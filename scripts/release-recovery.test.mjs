import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { gzipSync } from "node:zlib";
import { release, retryableReleaseError } from "./release.mjs";

function fixture(context, leaf = "icons") {
  const directory = mkdtempSync(join(tmpdir(), "iquji-release-recovery-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const name = `@iquji-web/web-${leaf}`;
  const blocks = [];
  for (const [path, text] of Object.entries({ "package.json": JSON.stringify({ name, version: "0.1.2" }), "dist/index.js": "export const value = 1;\n" })) {
    const content = Buffer.from(text);
    const header = Buffer.alloc(512);
    header.write(`package/${path}`);
    for (const [offset, length, value] of [[100, 8, 0o644], [108, 8, 0], [116, 8, 0], [124, 12, content.length], [136, 12, 1]]) {
      header.write(value.toString(8).padStart(length - 1, "0") + "\0", offset, length);
    }
    header.fill(32, 148, 156);
    header.write("0", 156);
    header.write("ustar\0", 257);
    header.write("00", 263);
    header.write(header.reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, "0") + "\0 ", 148, 8);
    blocks.push(header, content, Buffer.alloc((512 - content.length % 512) % 512));
  }
  const archive = gzipSync(Buffer.concat([...blocks, Buffer.alloc(1024)]));
  const filename = join(directory, `${leaf}.tgz`);
  writeFileSync(filename, archive);
  const item = { name, version: "0.1.2", filename };
  const metadata = { name, version: item.version, dist: { tarball: `https://registry.npmjs.org/${name}/-/web-${leaf}-0.1.2.tgz`, integrity: `sha512-${createHash("sha512").update(archive).digest("base64")}` } };
  return { item, archive, metadata };
}

test("整条发布链应对元数据延迟超过五分钟及压缩包旧404缓存，不重复上传", async (context) => {
  const value = fixture(context);
  let elapsed = 0;
  let published = 0;
  let lookups = 0;
  const queries = new Set();
  await release({
    tag: null, pack: () => [value.item], now: () => elapsed, pause: async (ms) => { elapsed += ms; },
    publish: () => { published += 1; },
    fetchImpl: async (input, options) => {
      const url = new URL(input);
      if (url.pathname.endsWith(".tgz")) return url.search ? new Response(value.archive) : new Response("cached miss", { status: 404 });
      assert.equal(options.headers["Cache-Control"], "no-cache");
      assert.ok(url.searchParams.get("iquji-verification"));
      assert.ok(!queries.has(url.href));
      queries.add(url.href);
      lookups += 1;
      if (lookups === 1) return new Response("temporary", { status: 503 });
      if (!published || elapsed < 360000) return new Response("not yet", { status: 404 });
      return Response.json(value.metadata);
    },
  });
  assert.equal(published, 1);
  assert.ok(elapsed > 300000 && elapsed < 900000);
});

test("部分上传后恢复仅发布缺失包，再跑相同版本不发布", async (context) => {
  const icons = fixture(context);
  const theme = fixture(context, "theme");
  const values = [icons, theme];
  const available = new Set([icons.item.name]);
  const uploads = [];
  const options = {
    tag: null, pack: () => values.map((value) => value.item),
    publish: (_command, args) => {
      const value = values.find((value) => value.item.filename === args[1]);
      uploads.push(value.item.name);
      available.add(value.item.name);
    },
    fetchImpl: async (input) => {
      const url = new URL(input);
      const value = values.find((value) => decodeURIComponent(url.pathname).includes(value.item.name));
      if (url.pathname.endsWith(".tgz")) return new Response(value.archive);
      return available.has(value.item.name) ? Response.json(value.metadata) : new Response("missing", { status: 404 });
    },
  };
  await release(options);
  await release(options);
  assert.deepEqual(uploads, [theme.item.name]);
});

test("权限与内容失败不得被临时故障续跑掩盖，共同时间预算耗尽可恢复", async (context) => {
  const value = fixture(context);
  let uploads = 0;
  const options = { tag: null, pack: () => [value.item], publish: () => { uploads += 1; } };
  await assert.rejects(release({ ...options, fetchImpl: async () => new Response("forbidden", { status: 403 }) }), (error) => !retryableReleaseError(error));
  assert.equal(uploads, 0);
  await assert.rejects(release({ ...options, fetchImpl: async (input) => new URL(input).pathname.endsWith(".tgz") ? new Response("corrupted") : Response.json(value.metadata) }), (error) => /完整性/.test(error.message) && !retryableReleaseError(error));
  let elapsed = 0;
  await assert.rejects(release({ ...options, verificationTimeoutMs: 10000, now: () => elapsed, pause: async (ms) => { elapsed += ms; }, fetchImpl: async () => { elapsed += 1000; return new Response("unavailable", { status: 503 }); } }), retryableReleaseError);
  assert.equal(uploads, 0);
  const temporary = Object.assign(new Error("temporary"), { retryableRelease: true });
  assert.ok(retryableReleaseError(new AggregateError([temporary])));
  assert.equal(retryableReleaseError(new AggregateError([temporary, new Error("content mismatch")])), false);
});

test("元数据响应恰好耗尽预算时保留同版本恢复能力，不开始下载", async (context) => {
  const value = fixture(context);
  let elapsed = 0;
  let requests = 0;
  await assert.rejects(release({
    tag: null, pack: () => [value.item], verificationTimeoutMs: 10000, now: () => elapsed,
    publish: () => assert.fail("不应重复上传"),
    fetchImpl: async () => {
      requests += 1;
      elapsed = 10000;
      return Response.json(value.metadata);
    },
  }), retryableReleaseError);
  assert.equal(requests, 1);
});
