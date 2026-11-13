import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { gzipSync } from "node:zlib";
import { comparePackageContents, readPackageFiles, verifyPublishedArtifact } from "./package-content.mjs";
import { release } from "./release.mjs";

const manifest = JSON.stringify({ name: "@iquji-web/web-icons", version: "0.1.0" });
const entries = [
  { name: "package/package.json", content: manifest },
  { name: "package/dist/index.js", content: "export const answer = 42;\n" },
  { name: "package/README.md", content: "公开说明\n" },
];

function archive(records = entries, { level = 9, mtime = 1, uid = 0 } = {}) {
  const blocks = [];
  for (const { name, content = "", mode = 0o644, type = "0" } of records) {
    const body = Buffer.from(content);
    const header = Buffer.alloc(512);
    header.write(name, 0, 100);
    for (const [start, length, value] of [[100, 8, mode], [108, 8, uid], [116, 8, uid], [124, 12, body.length], [136, 12, mtime]]) {
      header.write(value.toString(8).padStart(length - 1, "0") + "\0", start, length);
    }
    header.fill(32, 148, 156);
    header.write(type, 156);
    header.write("ustar\0", 257);
    header.write("00", 263);
    const checksum = header.reduce((sum, byte) => sum + byte, 0);
    header.write(checksum.toString(8).padStart(6, "0") + "\0 ", 148, 8);
    blocks.push(header, body, Buffer.alloc((512 - body.length % 512) % 512));
  }
  blocks.push(Buffer.alloc(1024));
  return gzipSync(Buffer.concat(blocks), { level });
}

function metadata(content) {
  return {
    name: "@iquji-web/web-icons", version: "0.1.0",
    dist: {
      tarball: "https://registry.npmjs.org/@iquji-web/web-icons/-/web-icons-0.1.0.tgz",
      integrity: `sha512-${createHash("sha512").update(content).digest("base64")}`,
    },
  };
}

function packageFixture() {
  const directory = mkdtempSync(join(tmpdir(), "iquji-package-content-test-"));
  const filename = join(directory, "icons.tgz");
  writeFileSync(filename, archive());
  return { item: { name: "@iquji-web/web-icons", version: "0.1.0", filename }, cleanup: () => rmSync(directory, { recursive: true, force: true }) };
}

test("归档压缩、顺序、时间和所有者不同仍要求全部文件字节一致", () => {
  const local = archive();
  const remote = archive([...entries].reverse(), { level: 1, mtime: 999, uid: 1000 });
  assert.notDeepEqual(local, remote);
  assert.equal(comparePackageContents(local, remote), 3);
});

test("拒绝同版本中改变、增加或删除的文件以及可执行位变化", () => {
  const variants = [
    entries.map((entry, index) => index === 1 ? { ...entry, content: "export const answer = 43;\n" } : entry),
    [...entries, { name: "package/dist/extra.js", content: "extra" }],
    entries.slice(0, -1),
    entries.map((entry, index) => index === 1 ? { ...entry, mode: 0o755 } : entry),
    entries.map((entry, index) => index === 0 ? { ...entry, content: manifest + " " } : entry),
  ];
  for (const variant of variants) assert.throws(() => comparePackageContents(archive(), archive(variant)), /不同/);
});

test("拒绝重复、越界、符号链接、硬链接及未支持的归档扩展", () => {
  const variants = [
    [...entries, entries[1]],
    [...entries, { name: "package/dist/../../escape", content: "bad" }],
    [...entries, { name: "/package/dist/escape", content: "bad" }],
    [...entries, { name: "package/dist/link", type: "2" }],
    [...entries, { name: "package/dist/link", type: "1" }],
    [...entries, { name: "package/dist/pax", type: "x" }],
    [...entries, { name: "package/resources/private.md", content: "bad" }],
  ];
  for (const variant of variants) assert.throws(() => readPackageFiles(archive(variant)));
});

test("拒绝损坏的gzip和缺少清单的制品", () => {
  assert.throws(() => readPackageFiles(archive().subarray(0, -8)));
  assert.throws(() => readPackageFiles(archive(entries.slice(1))), /缺少 package.json/);
});

test("注册表制品先验证完整性，再比较文件内容", async () => {
  const fixture = packageFixture();
  try {
    const remote = archive([...entries].reverse(), { level: 1, mtime: 2 });
    const published = metadata(remote);
    assert.equal(await verifyPublishedArtifact(fixture.item, published, async () => new Response(remote)), 3);
    await assert.rejects(verifyPublishedArtifact(fixture.item, published, async () => new Response(archive())), /完整性校验失败/);
    const changed = archive([...entries, { name: "package/dist/extra.js", content: "changed" }]);
    await assert.rejects(verifyPublishedArtifact(fixture.item, metadata(changed), async () => new Response(changed)), /文件清单不同/);
  } finally { fixture.cleanup(); }
});

test("拒绝身份不匹配、外部下载地址和下载错误", async () => {
  const fixture = packageFixture();
  try {
    const published = metadata(archive());
    await assert.rejects(verifyPublishedArtifact(fixture.item, { ...published, version: "0.2.0" }), /身份或版本不匹配/);
    await assert.rejects(verifyPublishedArtifact(fixture.item, { ...published, dist: { ...published.dist, tarball: "https://example.invalid/package.tgz" } }), /公开 npm/);
    await assert.rejects(verifyPublishedArtifact(fixture.item, published, async () => new Response("", { status: 503 }), { attempts: 1 }), /HTTP 503/);
  } finally { fixture.cleanup(); }
});

function downloadClock(timeoutMs = 300000) {
  let time = Date.parse("2026-11-13T10:00:00Z");
  const waits = [];
  return {
    waits,
    options: { timeoutMs, now: () => time, pause: async (ms) => { waits.push(ms); time += ms; } },
    advance: (ms) => { time += ms; },
  };
}

test("CDN暂时404后重试实际tarball，元数据与内容验证保持严格", async () => {
  const fixture = packageFixture();
  const clock = downloadClock();
  let requests = 0;
  try {
    const remote = archive();
    const count = await verifyPublishedArtifact(fixture.item, metadata(remote), async () => {
      requests += 1;
      return requests === 1 ? new Response("", { status: 404 }) : new Response(remote);
    }, clock.options);
    assert.equal(count, 3);
    assert.equal(requests, 2);
    assert.deepEqual(clock.waits, [5000]);
  } finally { fixture.cleanup(); }
});

test("限流和服务端错误遵循有上限的Retry-After，临时网络错误可恢复", async () => {
  const fixture = packageFixture();
  const clock = downloadClock();
  const remote = archive();
  let requests = 0;
  try {
    const outcomes = [
      new Response("", { status: 429, headers: { "retry-after": "12" } }),
      new Response("", { status: 503, headers: { "retry-after": "Fri, 13 Nov 2026 10:00:32 GMT" } }),
      new Response("", { status: 502, headers: { "retry-after": "99999" } }),
      new TypeError("fetch failed", { cause: { code: "ECONNRESET" } }),
      new Response(remote),
    ];
    await verifyPublishedArtifact(fixture.item, metadata(remote), async () => {
      const result = outcomes[requests++];
      if (result instanceof Error) throw result;
      return result;
    }, clock.options);
    assert.equal(requests, 5);
    assert.deepEqual(clock.waits, [12000, 20000, 60000, 5000]);
  } finally { fixture.cleanup(); }
});

test("下载超时会重试但总预算最多五分钟，次数上限仍生效", async () => {
  const fixture = packageFixture();
  const clock = downloadClock();
  let requests = 0;
  const started = clock.options.now();
  try {
    await assert.rejects(verifyPublishedArtifact(fixture.item, metadata(archive()), async (_url, options) => {
      assert.ok(options.signal instanceof AbortSignal);
      requests += 1;
      clock.advance(Math.min(30000, 300000 - (clock.options.now() - started)));
      throw new DOMException("请求超时", "TimeoutError");
    }, clock.options), /有界重试.*请求超时/);
    assert.ok(requests > 1 && requests < 10);
    assert.equal(clock.options.now() - started, 300000);
    let attempts = 0;
    await assert.rejects(verifyPublishedArtifact(fixture.item, metadata(archive()), async () => {
      attempts += 1;
      return new Response("", { status: 404 });
    }, { attempts: 2, pause: async () => {} }), /有界重试.*HTTP 404/);
    assert.equal(attempts, 2);
  } finally { fixture.cleanup(); }
});

test("权限拒绝、证书错误、完整性失败和真实内容变化立即失败且不重试", async () => {
  const fixture = packageFixture();
  const remote = archive();
  const changed = archive(entries.map((entry, index) => index === 1 ? { ...entry, content: "changed" } : entry));
  try {
    for (const { result, published, error } of [
      { result: new Response("", { status: 403 }), published: metadata(remote), error: /HTTP 403/ },
      { result: new TypeError("fetch failed", { cause: { code: "CERT_HAS_EXPIRED" } }), published: metadata(remote), error: /fetch failed/ },
      { result: new Response(changed), published: metadata(remote), error: /完整性校验失败/ },
      { result: new Response(changed), published: metadata(changed), error: /文件内容不同/ },
    ]) {
      let requests = 0;
      let waits = 0;
      await assert.rejects(verifyPublishedArtifact(fixture.item, published, async () => {
        requests += 1;
        if (result instanceof Error) throw result;
        return result;
      }, { pause: async () => { waits += 1; } }), error);
      assert.equal(requests, 1);
      assert.equal(waits, 0);
    }
  } finally { fixture.cleanup(); }
});

test("只读核验通过已有同内容版本，缺失或不同版本失败且从不发布", async () => {
  const fixture = packageFixture();
  let publishedCount = 0;
  const options = {
    verifyOnly: true, tag: null, pack: () => [fixture.item], publish: () => { publishedCount += 1; },
  };
  try {
    const remote = archive([...entries].reverse(), { level: 1 });
    await release({ ...options, fetchImpl: async (url) => String(url).endsWith(".tgz") ? new Response(remote) : Response.json(metadata(remote)) });
    await assert.rejects(release({ ...options, fetchImpl: async () => new Response("", { status: 404 }) }), /尚未发布/);
    const changed = archive(entries.map((entry, index) => index === 1 ? { ...entry, content: "changed" } : entry));
    await assert.rejects(release({ ...options, fetchImpl: async (url) => String(url).endsWith(".tgz") ? new Response(changed) : Response.json(metadata(changed)) }), /文件内容不同/);
    assert.equal(publishedCount, 0);
  } finally { fixture.cleanup(); }
});

test("发布模式仍仅将缺失版本交给npm，dry-run标志不丢失", async () => {
  const fixture = packageFixture();
  const calls = [];
  try {
    await release({ dryRun: true, tag: null, pack: () => [fixture.item], fetchImpl: async () => new Response("", { status: 404 }), publish: (...args) => calls.push(args) });
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], "npm");
    assert.equal(calls[0][1][0], "publish");
    assert.ok(calls[0][1].includes("--dry-run"));
  } finally { fixture.cleanup(); }
});

test("发布后等待注册表可读并核验实际文件，超时不会登记成功", async () => {
  const fixture = packageFixture();
  try {
    let requests = 0;
    let publishes = 0;
    let waits = 0;
    const remote = archive();
    await release({
      tag: null, pack: () => [fixture.item], registryAttempts: 2,
      publish: () => { publishes += 1; }, pause: async () => { waits += 1; },
      fetchImpl: async (url) => {
        if (String(url).endsWith(".tgz")) return new Response(remote);
        requests += 1;
        return requests < 3 ? new Response("", { status: 404 }) : Response.json(metadata(remote));
      },
    });
    assert.equal(publishes, 1);
    assert.equal(waits, 1);
    await assert.rejects(release({
      tag: null, pack: () => [fixture.item], registryAttempts: 2,
      publish: () => {}, pause: async () => {},
      fetchImpl: async () => new Response("", { status: 404 }),
    }), (error) => error instanceof AggregateError && error.errors.some((cause) => /注册表尚不可读取/.test(cause.message)));
  } finally { fixture.cleanup(); }
});
