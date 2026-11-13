import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chooseRelease, completedTagsFromReleases, nextPatchVersion, parseAutoSource,
  requireSha, selectPublisherRun, stableVersion,
} from "./auto-release.mjs";

const first = "a".repeat(40);
const second = "b".repeat(40);
const latest = "c".repeat(40);
const snapshot = "d".repeat(40);
const sourceVersions = Array(8).fill("0.1.0");
const tag = (version, source = first) => ({ name: `v${version}`, version, source, snapshot });

test("下一patch取八包注册表、标签和源码中的最高正式版本", () => {
  assert.equal(nextPatchVersion({ sourceVersions, registryVersions: ["0.1.8", "0.1.10", "9.0.0-beta.1"], tagVersions: ["0.1.9"] }), "0.1.11");
  assert.equal(nextPatchVersion({ sourceVersions, registryVersions: ["0.2.9"], tagVersions: ["1.0.4"] }), "1.0.5");
  assert.equal(nextPatchVersion({ sourceVersions: [...sourceVersions.slice(1), "2.0.7"], registryVersions: ["1.9.9"], tagVersions: [] }), "2.0.8");
});

test("版本解析拒绝不完整源码、前导零、非正式版本和整数溢出", () => {
  for (const value of ["1.2", "v1.2.3", "01.2.3", "1.2.3-rc.1", "1.2.3+build", "1.2.3\n", null, {}]) assert.equal(stableVersion(value), null);
  for (const versions of [sourceVersions.slice(1), [...sourceVersions.slice(1), "1.0.0-beta"]]) {
    assert.throws(() => nextPatchVersion({ sourceVersions: versions, registryVersions: [], tagVersions: [] }), /八个源码包/);
  }
  assert.throws(() => stableVersion("1.2.9007199254740992"), /安全整数/);
  assert.throws(() => nextPatchVersion({ sourceVersions, registryVersions: ["1.0.9007199254740991"], tagVersions: [] }), /patch/);
});

test("自动标签只接受唯一且完整的源码SHA，普通旧标签保持非自动身份", () => {
  assert.equal(parseAutoSource(`自动发布\n\nAuto-Release-Source: ${first}\n`), first);
  assert.equal(parseAutoSource("手工发布 v0.1.0"), null);
  for (const value of ["abc123", first.toUpperCase(), `--${first}`, first + "\n", null]) assert.throws(() => requireSha(value));
  assert.throws(() => parseAutoSource(`Auto-Release-Source: ${first}\nAuto-Release-Source: ${second}`), /重复/);
  assert.throws(() => parseAutoSource("Auto-Release-Source: invalid"), /无效/);
});

test("任何未完成版本先恢复，不能因最新源码已完成而跳过失败版本", () => {
  const tags = [tag("0.1.3", latest), tag("0.1.2", second), tag("0.1.1", first)];
  assert.deepEqual(chooseRelease(latest, tags, new Set(["v0.1.3"])), { kind: "resume", tag: tags[2] });
  assert.deepEqual(chooseRelease(latest, tags, new Set(["v0.1.1", "v0.1.3"])), { kind: "resume", tag: tags[1] });
});

test("同源码重跑复用未完成标签，已完成源码跳过，新源码才分配版本", () => {
  const previous = tag("0.1.1");
  assert.deepEqual(chooseRelease(first, [previous], new Set()), { kind: "resume", tag: previous });
  assert.deepEqual(chooseRelease(first, [previous], new Set([previous.name])), { kind: "skip", tag: previous });
  assert.deepEqual(chooseRelease(latest, [previous], new Set([previous.name])), { kind: "create", source: latest });
  assert.deepEqual(chooseRelease(latest, [tag("0.1.0", null)], new Set()), { kind: "create", source: latest });
});

test("源码到多个自动版本的歧义必须阻断，不能继续跳版本", () => {
  assert.throws(() => chooseRelease(latest, [tag("0.1.1"), tag("0.1.2")], new Set()), /多个自动发布标签/);
  assert.throws(() => chooseRelease(latest, [{ ...tag("0.1.1"), name: "v0.1.2" }], new Set()), /标签版本无效/);
});

test("只有已正式发布的稳定GitHub Release才构成完成标记", () => {
  const release = { tag_name: "v0.1.1", draft: false, prerelease: false, published_at: "2026-11-13T10:00:00Z" };
  const actual = completedTagsFromReleases([
    release,
    { ...release, tag_name: "v0.1.2", draft: true },
    { ...release, tag_name: "v0.1.3", prerelease: true },
    { ...release, tag_name: "v0.1.4", published_at: null },
    { ...release, tag_name: "v0.1.5", published_at: "not-a-date" },
    { ...release, tag_name: "v0.1.6-rc.1" },
  ]);
  assert.deepEqual(actual, new Set(["v0.1.1"]));
  assert.throws(() => completedTagsFromReleases([null]), /完成清单无效/);
});

test("等待只匹配指定标签和完整快照SHA的dispatch任务", () => {
  const target = tag("0.1.1");
  const run = { id: 101, event: "workflow_dispatch", display_title: `npm / publish / ${target.name}`, head_branch: target.name, head_sha: snapshot, created_at: "2026-11-13T10:00:10Z", status: "queued" };
  const unrelated = [
    { ...run, id: 102, event: "push" },
    { ...run, id: 103, head_branch: "main" },
    { ...run, id: 104, head_branch: "v0.1.2" },
    { ...run, id: 105, head_sha: second },
    { ...run, id: 106, created_at: "2026-11-13T09:59:00Z" },
    { ...run, id: 107 },
    { ...run, id: Number.MAX_SAFE_INTEGER + 1 },
    { ...run, id: 108, display_title: `npm / verify / ${target.name}` },
  ];
  assert.equal(selectPublisherRun([...unrelated, run], target, new Set([107]), Date.parse("2026-11-13T10:00:00Z")), run);
  assert.equal(selectPublisherRun([run], target, new Set([101])), null);
  assert.equal(selectPublisherRun(unrelated.slice(0, 4), target), null);
});
