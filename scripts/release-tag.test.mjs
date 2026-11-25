import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { packages } from "./package.mjs";
import { verifyReleaseTag } from "./release-tag.mjs";
import { checkMainTag } from "./tag-main.mjs";

test("发布标签必须固定主线中的提交，并与八个包的版本一致", (context) => {
  const cwd = mkdtempSync(join(tmpdir(), "release-tag-"));
  context.after(() => rmSync(cwd, {recursive:true, force:true}));
  const git = (...args) => execFileSync("git", ["-c","user.name=Example","-c","user.email=example@example.invalid",...args], {cwd, stdio:"pipe", encoding:"utf8"}).trim();
  git("init","-q","-b","main");
  for (const item of packages) {
    mkdirSync(join(cwd,item));
    writeFileSync(join(cwd,item,"package.json"), JSON.stringify({name:`@iquji-community/web-${item}`, version:"1.0.0"}));
  }
  git("add","."); git("commit","-qm","test: add manifests");
  git("tag","v1.0.0");
  git("update-ref","refs/remotes/origin/main","HEAD");
  assert.equal(verifyReleaseTag("v1.0.0",cwd),git("rev-parse","HEAD"));
  assert.throws(() => verifyReleaseTag("v1.00.0",cwd));
  git("tag","v1.2.0");
  assert.throws(() => verifyReleaseTag("v1.2.0",cwd),/标签不符/);
  git("switch","-qc","change");
  git("commit","-q","--allow-empty","-m","test: branch change");
  git("tag","v1.1.0");
  assert.throws(() => verifyReleaseTag("v1.0.0",cwd),/检出与标签不匹配/);
  assert.throws(() => verifyReleaseTag("v1.1.0",cwd));
});

const revision = "1".repeat(40);
const anotherRevision = "2".repeat(40);
const tag = "v1.0.0";
const ref = `refs/tags/${tag}`;

function preflightFixture({ passes = true, protectedMain = true, head = revision, existing, wrongPackage, moves } = {}) {
  const requests = [];
  let mainReads = 0;
  return {
    requests,
    async request(...args) {
      assert.equal(args.length, 1, "预检只传入固定的读取端点");
      const [endpoint] = args;
      requests.push(endpoint);
      if (endpoint.endsWith("/branches/main")) {
        mainReads++;
        return { protected: protectedMain, commit: { sha: moves && mainReads > 1 ? anotherRevision : head } };
      }
      if (endpoint.includes("/git/matching-refs/")) return existing ? [{ ref, object: existing }] : [];
      if (endpoint.includes("/actions/workflows/")) {
        return { workflow_runs: [{ event: passes ? "push" : "pull_request", head_sha: revision,
          head_branch: "main", status: "completed", conclusion: "success" }] };
      }
      const manifest = /\/contents\/([^/]+)\/package\.json\?ref=(.+)$/.exec(endpoint);
      assert.ok(manifest, "出现预检不支持的写入或读取端点");
      const [, directory, sha] = manifest;
      assert.equal(sha, revision);
      const value = { name: `@iquji-community/web-${directory}`, version: directory === wrongPackage ? "1.0.1" : "1.0.0" };
      return { type: "file", encoding: "base64", path: `${directory}/package.json`,
        content: Buffer.from(JSON.stringify(value)).toString("base64") };
    },
  };
}

test("建标预检只读取保护主线、该提交的推送检查和八个发布清单", async () => {
  for (const existing of [undefined, { type: "commit", sha: revision }]) {
    const { request, requests } = preflightFixture({ existing });
    assert.equal(await checkMainTag(tag, revision, request), revision);
    assert.equal(requests.filter((endpoint) => endpoint.includes("/contents/")).length, packages.length);
    assert.equal(requests.filter((endpoint) => endpoint.endsWith("/branches/main")).length, 2);
  }
});

test("建标预检遇到主线变化、检查失败和同名标签冲突时拒绝", async () => {
  const cases = [
    [{ head: anotherRevision }, /main 分支顶端/],
    [{ protectedMain: false }, /main 分支顶端/],
    [{ moves: true }, /main 分支顶端/],
    [{ passes: false, existing: { type: "commit", sha: revision } }, /尚未通过 CI/],
    [{ wrongPackage: "editor" }, /包身份或版本不符/],
    [{ existing: { type: "commit", sha: anotherRevision } }, /同名标签已存在/],
    [{ existing: { type: "tag", sha: revision } }, /同名标签已存在/],
  ];
  for (const [options, error] of cases) {
    await assert.rejects(checkMainTag(tag, revision, preflightFixture(options).request), error);
  }
  const { request, requests } = preflightFixture();
  await assert.rejects(checkMainTag("v1.00.0", revision, request), /需要 vX.Y.Z 标签/);
  await assert.rejects(checkMainTag(tag, "wrong", request), /完整的主线提交号/);
  assert.deepEqual(requests, []);
});
