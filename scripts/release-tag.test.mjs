import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { packages } from "./package.mjs";
import { verifyReleaseTag } from "./release-tag.mjs";

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

test("受控身份为 CI 通过的 main 打标签，重跑复用同一提交", async () => {
  const {tagMain} = await import("./tag-main.mjs");
  const sha="1".repeat(40);
  let passed=false, created=false, calls=0;
  const request=async (url, method, body) => {
    if (url.endsWith("/git/ref/heads/main")) return {object:{sha}};
    if (url.includes("/git/matching-refs/")) return created ? [{ref:"refs/tags/v1.0.0",object:{type:"commit",sha}}] : [];
    if (url.includes("/actions/workflows/")) return {workflow_runs:passed ? [{event:"push",head_sha:sha,head_branch:"main",conclusion:"success"}] : []};
    if (url.includes("/contents/")) {
      const item=url.split("/contents/")[1].split("/")[0];
      return {content:Buffer.from(JSON.stringify({name:`@iquji-community/web-${item}`,version:"1.0.0"})).toString("base64")};
    }
    assert.equal(method,"POST");assert.deepEqual(body,{ref:"refs/tags/v1.0.0",sha});calls++;created=true;
    return {object:{sha}};
  };
  await assert.rejects(tagMain("v1.0.0",request),/尚未通过 CI/);
  passed=true;
  assert.equal(await tagMain("v1.0.0",request),sha);
  assert.equal(await tagMain("v1.0.0",request),sha);
  assert.equal(calls,1);
});
