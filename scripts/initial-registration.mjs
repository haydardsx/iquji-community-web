import { randomUUID } from "node:crypto";
import { setTimeout as pause } from "node:timers/promises";
import { execFileSync } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { readPackageFiles, verifyPublishedArtifact } from "./package-content.mjs";
import { packPackages, packages, root } from "./package.mjs";
import { publisherEmail, verifyPublisher } from "./npm-publisher.mjs";
import { verifyReleaseTag } from "./release-tag.mjs";

const repository = "haydardsx/iquji-community-web";
const registry = "https://registry.npmjs.org/";
const email = "community@iqu.lol";

async function lookup(name) {
  const endpoint = new URL(encodeURIComponent(name), registry);
  endpoint.searchParams.set("verification", randomUUID());
  const response = await fetch(endpoint, {
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(30000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`无法检查 ${name} 的注册状态（HTTP ${response.status}）。`);
  const record = await response.json();
  if (record.name !== name || !record.versions) throw new Error("注册表返回了无效包记录。");
  return record;
}

export async function verifyRegistration(item, {read = lookup, verify = verifyPublishedArtifact, wait = pause, attempts = 60} = {}) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const record = await read(item.name);
    const version = record?.versions[item.version];
    if (version) {
      if (version._npmUser?.email === publisherEmail) await verifyPublisher(item.name, item.version, version);
      if (version.name !== item.name || version.version !== item.version || version.author?.email !== email ||
          !record.maintainers?.length || record.maintainers.some((owner) => owner?.email !== email) ||
          (version._npmUser !== undefined && version._npmUser?.email !== email && version._npmUser?.email !== publisherEmail) ||
          (version.maintainers !== undefined && (!Array.isArray(version.maintainers) ||
            version.maintainers.some((owner) => owner?.email !== email)))) {
        throw new Error(`注册表中的发行身份与 ${item.name} 不符。`);
      }
      await verify(item, version);
      return;
    }
    if (attempt + 1 < attempts) await wait(5000);
  }
  throw new Error(`注册表尚未返回 ${item.name}@${item.version}，可重新执行以核验已上传的版本。`);
}

export function checkRun(run, tag, commit, workflowId) {
  if (!["push", "workflow_dispatch"].includes(run.event) || run.status !== "completed" ||
      run.conclusion !== "success" || run.head_sha !== commit || run.head_branch !== tag ||
      run.workflow_id !== workflowId || run.path !== ".github/workflows/release.yml" ||
      run.repository?.full_name !== repository || run.head_repository?.full_name !== repository) {
    throw new Error("指定运行必须成功完成当前仓库的发布标签检查。");
  }
}

export function checkManifest(item, manifest) {
  if (manifest.name !== item.name || manifest.version !== item.version || manifest.private ||
      manifest.author?.email !== email || manifest.publishConfig?.access !== "public" ||
      manifest.publishConfig.registry !== registry) {
    throw new Error("制品内的包名、版本或公开发行身份不正确。");
  }
}

async function prepare(directory) {
  verifyReleaseTag(process.env.GITHUB_REF_NAME);
  const artifacts = packPackages(directory);
  const records = await Promise.all(artifacts.map(({name}) => lookup(name)));
  appendFileSync(process.env.GITHUB_OUTPUT, `registration=${records.includes(null)}\n`);
}

function command(program, args) {
  return execFileSync(program, args, {cwd: root, encoding: "utf8"}).trim();
}

async function register(runId, tag) {
  if (!/^[1-9]\d*$/.test(runId)) throw new Error("需要 GitHub Actions 运行编号。");
  const commit = verifyReleaseTag(tag);
  const api = (path) => JSON.parse(command("gh", ["api", `repos/${repository}/${path}`]));
  const remoteTag = api(`git/ref/tags/${tag}`);
  if (remoteTag.object.type !== "commit" || remoteTag.object.sha !== commit) throw new Error("远端标签与当前检出不同。");
  const run = api(`actions/runs/${runId}`);
  checkRun(run, tag, commit, api("actions/workflows/release.yml").id);

  const user = JSON.parse(command("npm", ["profile", "get", "--json", "--registry", registry]));
  if (user.email !== email || user.email_verified !== true) throw new Error("请使用已验证项目邮箱的 npm 发布账号。");
  const directory = mkdtempSync(join(tmpdir(), "web-registration-"));
  try {
    command("gh", ["run", "download", runId, "-R", repository, "-n", "initial-registration", "-D", directory]);
    const version = tag.slice(1);
    const items = packages.map((item) => ({
      name: `@iquji-community/web-${item}`, version,
      filename: join(directory, `iquji-community-web-${item}-${version}.tgz`),
    }));
    const names = readdirSync(directory).sort();
    if (JSON.stringify(names) !== JSON.stringify(items.map((item) => basename(item.filename)).sort())) {
      throw new Error("发布运行的归档清单与标签不符。");
    }
    for (const item of items) {
      const manifest = readPackageFiles(readFileSync(item.filename)).get("package.json").content;
      checkManifest(item, JSON.parse(manifest));
    }
    const registered = [];
    for (const item of items) {
      const record = await lookup(item.name);
      if (record) {
        const previous = record.versions[item.version];
        if (previous) registered.push(item);
        continue;
      }
      execFileSync("npm", ["publish", item.filename, "--access", "public", "--ignore-scripts",
        "--registry", registry], {cwd: directory, stdio: "inherit"});
      registered.push(item);
    }
    await Promise.all(registered.map((item) => verifyRegistration(item)));
  } finally {
    rmSync(directory, {recursive: true, force: true});
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const [action, ...args] = process.argv.slice(2);
  if (action === "prepare" && args.length === 1) await prepare(args[0]);
  else if (action === "publish" && args.length === 2) await register(args[0], args[1]);
  else throw new Error("用法：initial-registration.mjs prepare DIRECTORY 或 publish RUN_ID TAG");
}
