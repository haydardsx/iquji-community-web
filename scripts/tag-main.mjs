import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { packages } from "./package.mjs";

const repo = "repos/haydardsx/iquji-community-web";
const stable = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

function api(endpoint) {
  return JSON.parse(execFileSync("gh", ["api", "--hostname", "github.com", "--method", "GET", endpoint],
    { encoding: "utf8" }));
}

export async function checkMainTag(tag, revision, request = api) {
  if (!stable.test(tag)) throw new Error("需要 vX.Y.Z 标签");
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error("需要完整的主线提交号");
  const checkHead = async () => {
    const main = await request(`${repo}/branches/main`);
    if (main.protected !== true || main.commit?.sha !== revision) {
      throw new Error("指定提交已不在受保护的 main 分支顶端");
    }
  };
  await checkHead();
  const ref = `refs/tags/${tag}`;
  const tags = await request(`${repo}/git/matching-refs/tags/${tag}`);
  const existing = tags.find((item) => item.ref === ref);
  if (existing && (existing.object.type !== "commit" || existing.object.sha !== revision)) {
    throw new Error("同名标签已存在且不指向指定主线提交");
  }
  const runs = await request(`${repo}/actions/workflows/ci.yml/runs?branch=main&event=push&status=success&head_sha=${revision}&per_page=100`);
  if (!runs.workflow_runs.some((run) => run.event === "push" && run.head_sha === revision
      && run.head_branch === "main" && run.status === "completed" && run.conclusion === "success")) {
    throw new Error("此主线提交尚未通过 CI");
  }
  for (const directory of packages) {
    const path = `${directory}/package.json`;
    const data = await request(`${repo}/contents/${path}?ref=${revision}`);
    if (data.type !== "file" || data.encoding !== "base64" || data.path !== path) {
      throw new Error(`${directory} 的包清单不是预期的发布文件`);
    }
    const manifest = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
    if (manifest.private || manifest.name !== `@iquji-community/web-${directory}` || tag !== `v${manifest.version}`) {
      throw new Error(`${directory} 的包身份或版本不符`);
    }
  }
  await checkHead();
  return revision;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  if (process.argv.length !== 4) throw new Error("用法：node scripts/tag-main.mjs vX.Y.Z <主线提交号>");
  console.log(await checkMainTag(process.argv[2], process.argv[3]));
}
