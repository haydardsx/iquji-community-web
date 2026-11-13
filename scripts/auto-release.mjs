import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { packages } from "./package.mjs";

const REPOSITORY = "haydardsx/iquji-community-web";
const REMOTE = `https://github.com/${REPOSITORY}.git`;
const BOT_NAME = "github-actions[bot]";
const BOT_EMAIL = "41898282+github-actions[bot]@users.noreply.github.com";
const WAIT_TIMEOUT = 60 * 60 * 1000;
const VERSION_FILES = new Set([
  "package.json", "preview/package.json", "preview/bun.lock",
  ...packages.flatMap((name) => [`${name}/package.json`, `${name}/bun.lock`]),
]);

export function requireSha(value) {
  if (typeof value !== "string" || !/^[a-f0-9]{40}$/.test(value)) throw new Error("提交身份必须是完整小写 Git SHA。");
  return value;
}

export function stableVersion(value) {
  if (typeof value !== "string" || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)) return null;
  const parts = value.split(".").map(Number);
  if (!parts.every(Number.isSafeInteger)) throw new Error("版本号超出安全整数范围。");
  return parts;
}

function compareVersions(left, right) {
  const a = stableVersion(left);
  const b = stableVersion(right);
  if (!a || !b) throw new Error("版本排序只接受正式 x.y.z。");
  for (let index = 0; index < 3; index += 1) if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1;
  return 0;
}

export function nextPatchVersion({ sourceVersions, registryVersions, tagVersions }) {
  if (sourceVersions.length !== packages.length || sourceVersions.some((version) => !stableVersion(version))) {
    throw new Error("八个源码包必须都声明正式版本。");
  }
  const versions = [...sourceVersions, ...registryVersions, ...tagVersions].filter((version) => stableVersion(version));
  const maximum = versions.reduce((left, right) => compareVersions(left, right) >= 0 ? left : right);
  const parts = stableVersion(maximum);
  if (parts[2] === Number.MAX_SAFE_INTEGER) throw new Error("patch 版本号已超出安全范围。");
  parts[2] += 1;
  return parts.join(".");
}

export function parseAutoSource(message) {
  if (typeof message !== "string") throw new Error("标签说明必须是文本。");
  const records = message.split(/\r?\n/).filter((line) => line.startsWith("Auto-Release-Source:"));
  if (!records.length) return null;
  if (records.length !== 1) throw new Error("自动发布标签包含重复源码身份。");
  const match = /^Auto-Release-Source: ([a-f0-9]{40})$/.exec(records[0]);
  if (!match) throw new Error("自动发布标签的源码身份无效。");
  return requireSha(match[1]);
}

export function chooseRelease(source, tags, completedTags) {
  requireSha(source);
  const automatic = tags.filter((tag) => tag.source !== null);
  const sources = new Set();
  for (const tag of automatic) {
    requireSha(tag.source);
    requireSha(tag.snapshot);
    if (!stableVersion(tag.version) || tag.name !== `v${tag.version}`) throw new Error("自动发布标签版本无效。");
    if (sources.has(tag.source)) throw new Error("同一源码存在多个自动发布标签，拒绝自动分配新版本。");
    sources.add(tag.source);
  }
  const pending = automatic.filter((tag) => !completedTags.has(tag.name)).sort((a, b) => compareVersions(a.version, b.version));
  if (pending.length) return { kind: "resume", tag: pending[0] };
  const existing = automatic.find((tag) => tag.source === source);
  return existing ? { kind: "skip", tag: existing } : { kind: "create", source };
}

export function selectPublisherRun(runs, tag, excludedIds = new Set(), notBefore = 0) {
  requireSha(tag.snapshot);
  return runs.filter((run) =>
    Number.isSafeInteger(run.id) && run.id > 0 && !excludedIds.has(run.id)
    && run.event === "workflow_dispatch" && run.head_branch === tag.name && run.head_sha === tag.snapshot
    && run.display_title === `npm / publish / ${tag.name}`
    && Number.isFinite(Date.parse(run.created_at)) && Date.parse(run.created_at) >= notBefore,
  ).sort((a, b) => b.id - a.id)[0] ?? null;
}

export function completedTagsFromReleases(releases) {
  if (!Array.isArray(releases) || releases.some((release) => !release || typeof release !== "object")) {
    throw new Error("GitHub Release 完成清单无效。");
  }
  return new Set(releases.filter((release) =>
    release.draft === false && release.prerelease === false
    && typeof release.published_at === "string" && Number.isFinite(Date.parse(release.published_at))
    && typeof release.tag_name === "string" && release.tag_name.startsWith("v") && stableVersion(release.tag_name.slice(1)),
  ).map((release) => release.tag_name));
}

function command(root, executable, args, options = {}) {
  return execFileSync(executable, args, {
    cwd: root, encoding: "utf8", timeout: 60000, maxBuffer: 32 * 1024 * 1024,
    stdio: ["pipe", "pipe", "pipe"], ...options,
  });
}

function git(root, args, options = {}) {
  return command(root, "git", ["-c", "credential.helper=", "-c", "http.extraHeader=", ...args], options).trimEnd();
}

function github(root, endpoint) {
  return JSON.parse(command(root, "gh", ["api", "--hostname", "github.com", "--paginate", "--slurp", endpoint]));
}

function completedReleases(root) {
  const pages = github(root, `repos/${REPOSITORY}/releases?per_page=100`);
  if (!Array.isArray(pages) || pages.some((page) => !Array.isArray(page))) throw new Error("GitHub Release 返回结构无效。");
  return completedTagsFromReleases(pages.flat());
}

function remoteState(root) {
  git(root, ["fetch", "--tags", "origin", "refs/heads/main:refs/remotes/origin/main"]);
  const source = requireSha(git(root, ["rev-parse", "refs/remotes/origin/main"]));
  const advertised = git(root, ["ls-remote", "--refs", "--tags", REMOTE]);
  const tags = [];
  for (const line of advertised.split("\n").filter(Boolean)) {
    const [object, ref] = line.split("\t");
    requireSha(object);
    const name = ref?.replace(/^refs\/tags\//, "");
    if (!ref?.startsWith("refs/tags/") || !name) throw new Error("远端标签记录无效。");
    // 获取刚出现的标签对象；已有对象也必须对应本次远端广告的完整 SHA。
    git(root, ["fetch", "--no-tags", "origin", ref]);
    const type = git(root, ["cat-file", "-t", object]);
    let autoSource = null;
    if (type === "tag") {
      const raw = git(root, ["cat-file", "tag", object]);
      autoSource = parseAutoSource(raw.slice(raw.indexOf("\n\n") + 2));
    }
    const version = name.startsWith("v") ? name.slice(1) : "";
    if (autoSource && !stableVersion(version)) throw new Error("自动发布标签必须是正式 vX.Y.Z。");
    if (!stableVersion(version)) continue;
    const snapshot = requireSha(git(root, ["rev-parse", `${object}^{commit}`]));
    if (autoSource) {
      const parents = git(root, ["show", "-s", "--format=%P", snapshot]).split(" ");
      if (parents.length !== 1 || parents[0] !== autoSource) throw new Error(`标签 ${name} 的快照父提交与源码身份不同。`);
      for (const directory of packages) {
        const manifest = JSON.parse(git(root, ["show", `${snapshot}:${directory}/package.json`]));
        if (manifest.name !== `@iquji-web/web-${directory}` || manifest.version !== version) throw new Error(`标签 ${name} 的包身份或版本不一致。`);
      }
    }
    tags.push({ name, version, source: autoSource, snapshot });
  }
  return { source, tags, completed: completedReleases(root) };
}

async function registryVersions() {
  const collections = await Promise.all(packages.map(async (directory) => {
    const name = `@iquji-web/web-${directory}`;
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`, {
      redirect: "error", signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`无法读取 ${name} 的已发布版本：HTTP ${response.status}`);
    const body = await response.json();
    if (body.name !== name || !body.versions || typeof body.versions !== "object" || Array.isArray(body.versions)) {
      throw new Error(`注册表返回的 ${name} 版本清单无效。`);
    }
    return Object.keys(body.versions);
  }));
  return collections.flat();
}

function assertSnapshotChanges(snapshot) {
  const changed = git(snapshot, ["diff", "--name-only", "-z"]).split("\0").filter(Boolean);
  if (!changed.length || changed.some((name) => !VERSION_FILES.has(name))) throw new Error("发布快照包含版本文件以外的修改或没有版本变化。");
  if (git(snapshot, ["ls-files", "--others", "--exclude-standard", "-z"])) throw new Error("发布快照包含未登记文件。");
  return changed;
}

async function createSnapshot(root, source, version) {
  const temporary = mkdtempSync(join(tmpdir(), "iquji-web-auto-release-"));
  const snapshot = join(temporary, "snapshot");
  let attached = false;
  try {
    git(root, ["worktree", "add", "--detach", snapshot, source]);
    attached = true;
    const { updateVersion } = await import(new URL("./version.mjs", import.meta.url));
    await updateVersion(snapshot, version);
    assertSnapshotChanges(snapshot);
    const buildEnvironment = { ...process.env };
    for (const key of ["GH_TOKEN", "GITHUB_TOKEN", "NODE_AUTH_TOKEN", "NPM_TOKEN"]) delete buildEnvironment[key];
    command(snapshot, "bun", ["run", "check"], { stdio: "inherit", timeout: 60 * 60 * 1000, env: buildEnvironment });
    const changed = assertSnapshotChanges(snapshot);
    git(snapshot, ["add", "--", ...changed]);
    git(snapshot, ["-c", `user.name=${BOT_NAME}`, "-c", `user.email=${BOT_EMAIL}`, "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", "commit", "-m", `发布 ${version} 的版本快照`, "-m", `Auto-Release-Source: ${source}`]);
    const sha = requireSha(git(snapshot, ["rev-parse", "HEAD"]));
    const name = `v${version}`;
    const object = requireSha(git(snapshot, ["mktag"], {
      input: `object ${sha}\ntype commit\ntag ${name}\ntagger ${BOT_NAME} <${BOT_EMAIL}> ${Math.floor(Date.now() / 1000)} +0000\n\n自动发布 ${version}\n\nAuto-Release-Source: ${source}\n`,
    }));
    // 凭据 helper 只作用于本次推送，令牌不进入命令参数或 Git 配置文件。
    git(root, ["-c", "credential.helper=!gh auth git-credential", "push", REMOTE, `${object}:refs/tags/${name}`]);
    return { name, version, source, snapshot: sha };
  } finally {
    if (attached) git(root, ["worktree", "remove", "--force", snapshot]);
    rmSync(temporary, { recursive: true, force: true });
  }
}

function publisherRuns(root) {
  const pages = github(root, `repos/${REPOSITORY}/actions/workflows/release.yml/runs?event=workflow_dispatch&per_page=100`);
  if (!Array.isArray(pages) || pages.some((page) => !Array.isArray(page.workflow_runs))) throw new Error("发布任务返回结构无效。");
  return pages.flatMap((page) => page.workflow_runs);
}

async function publishSnapshot(root, tag) {
  const previous = publisherRuns(root);
  let run = selectPublisherRun(previous.filter((item) => item.status !== "completed"), tag);
  const excluded = new Set(previous.map((item) => item.id));
  const started = Date.now();
  if (!run) {
    command(root, "gh", ["workflow", "run", "release.yml", "--repo", REPOSITORY, "--ref", tag.name, "-f", "operation=publish"]);
    console.log(`已请求发布 ${tag.name}，快照 ${tag.snapshot}。`);
  } else {
    console.log(`等待既有发布任务 ${run.id}：${tag.name}。`);
  }
  while (Date.now() - started < WAIT_TIMEOUT) {
    if (run) {
      const pages = github(root, `repos/${REPOSITORY}/actions/runs/${run.id}`);
      const current = selectPublisherRun(pages, tag);
      if (!current || current.id !== run.id) throw new Error("发布任务的标签或快照身份改变。");
      if (current.status === "completed") {
        if (current.conclusion !== "success") throw new Error(`发布 ${tag.name} 失败：${current.conclusion}；重跑将复用此版本。`);
        if (!completedReleases(root).has(tag.name)) throw new Error(`发布任务成功但缺少 ${tag.name} 的正式 GitHub Release 完成标记。`);
        console.log(`发布完成：${tag.name}（任务 ${run.id}）。`);
        return;
      }
    } else {
      run = selectPublisherRun(publisherRuns(root), tag, excluded, started - 5000);
    }
    await delay(10000);
  }
  throw new Error(`等待 ${tag.name} 发布超时；未分配其他版本，重跑将复用此标签。`);
}

export async function main(root = process.cwd()) {
  root = resolve(root);
  if (!process.env.GH_TOKEN) throw new Error("自动发布需要通过 GH_TOKEN 环境提供当前工作流的 GITHUB_TOKEN。");
  if (process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY !== REPOSITORY) throw new Error("自动发布只能在所属公开仓库运行。");
  const identity = JSON.parse(readFileSync(join(root, ".repository.json"), "utf8"));
  if (identity.id !== "iquji-community-web" || identity.visibility !== "public") throw new Error("自动发布要求公开 Community Web 仓库身份。");
  if (git(root, ["remote", "get-url", "origin"]).replace(/\.git$/, "") !== REMOTE.replace(/\.git$/, "")) throw new Error("origin 必须指向所属公开仓库。");
  while (true) {
    const state = remoteState(root);
    const decision = chooseRelease(state.source, state.tags, state.completed);
    if (decision.kind === "skip") {
      console.log(`最新 main 已完成发布：${decision.tag.name}（${state.source}）。`);
      return;
    }
    if (decision.kind === "resume") {
      await publishSnapshot(root, decision.tag);
      continue;
    }
    const sourceVersions = packages.map((directory) => {
      const manifest = JSON.parse(git(root, ["show", `${state.source}:${directory}/package.json`]));
      if (manifest.name !== `@iquji-web/web-${directory}`) throw new Error("源码包身份不匹配。");
      return manifest.version;
    });
    const version = nextPatchVersion({ sourceVersions, registryVersions: await registryVersions(), tagVersions: state.tags.map((tag) => tag.version) });
    console.log(`为最新 main ${state.source} 准备统一版本 ${version}。`);
    const tag = await createSnapshot(root, state.source, version);
    await publishSnapshot(root, tag);
    return;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length !== 2) throw new Error("自动发布规划器不接受额外参数。");
  await main();
}
