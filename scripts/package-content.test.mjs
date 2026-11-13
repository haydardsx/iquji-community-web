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
    await assert.rejects(verifyPublishedArtifact(fixture.item, published, async () => new Response("", { status: 503 })), /HTTP 503/);
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
