import assert from "node:assert/strict";
import { test } from "node:test";
import { checkManifest, checkRun, verifyRegistration } from "./initial-registration.mjs";

test("首次注册必须使用来自本仓的成功标签运行", () => {
  const repository = {full_name: "haydardsx/iquji-community-web"};
  const run = {
    event: "push", status: "completed", conclusion: "success",
    head_branch: "v1.0.0", head_sha: "a".repeat(40), repository,
    head_repository: repository, path: ".github/workflows/release.yml", workflow_id: 2,
  };
  const check = (change) => checkRun({...run, ...change}, "v1.0.0", run.head_sha, 2);
  check({});
  check({event: "workflow_dispatch"});
  for (const change of [
    {event: "pull_request"}, {head_branch: "main"}, {head_sha: "b".repeat(40)},
    {workflow_id: 1}, {status: "queued"}, {conclusion: "failure"},
    {repository: {full_name: "example/test"}}, {head_repository: {full_name: "example/test"}},
    {path: ".github/workflows/ci.yml"},
  ]) assert.throws(() => check(change));
});

test("逐个核对归档内的公开包身份和版本", () => {
  const item = {name: "@iquji-community/web-icons", version: "1.0.0"};
  const manifest = {...item, author: {email: "community@iqu.lol"}, publishConfig: {access: "public", registry: "https://registry.npmjs.org/"}};
  checkManifest(item, manifest);
  for (const change of [
    {name: "@example/other"}, {version: "1.0.1"}, {private: true},
    {author: {email: "example@example.invalid"}}, {publishConfig: {access: "restricted"}},
  ]) assert.throws(() => checkManifest(item, {...manifest, ...change}));
});

test("首次发布后等待索引传播并回下载制品，拒绝不符的维护者", async () => {
  const item = {name: "@iquji-community/web-icons", version: "1.0.0"};
  const email = "community@iqu.lol";
  const version = {...item, author: {email}};
  const record = {maintainers: [{email}], versions: {"1.0.0": version}};
  const responses = [null, {versions: {}}, record];
  let downloads = 0;
  await verifyRegistration(item, {
    read: async () => responses.shift(), wait: async () => {}, attempts: 3,
    verify: async (local, remote) => {
      assert.equal(local, item); assert.equal(remote, version); downloads++;
    },
  });
  assert.equal(downloads, 1);
  await assert.rejects(verifyRegistration(item, {
    read: async () => ({...record, maintainers: []}), verify: () => assert.fail(), attempts: 1,
  }), /发行身份/);
  for (const identity of [{_npmUser: {email: "example@example.invalid"}},
    {maintainers: [{email: "example@example.invalid"}]}]) {
    await assert.rejects(verifyRegistration(item, {
      read: async () => ({...record, versions: {"1.0.0": {...version, ...identity}}}),
      verify: () => assert.fail(), attempts: 1,
    }), /发行身份/);
  }
  await assert.rejects(verifyRegistration(item, {
    read: async () => null, verify: () => assert.fail(), attempts: 1,
  }), /尚未返回/);
});
