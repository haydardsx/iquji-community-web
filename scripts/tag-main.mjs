import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { packages } from "./package.mjs";

const repo = "repos/haydardsx/iquji-community-web";
const stable = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

async function api(request, method = "GET", body) {
  const args = ["api", "--method", method, request];
  if (body) args.push("--input","-");
  const result = execFileSync("gh", args, {encoding:"utf8", input: body ? JSON.stringify(body) : undefined});
  return JSON.parse(result);
}

export async function tagMain(tag, request = api) {
  if (!stable.test(tag)) throw new Error("需要 vX.Y.Z 标签");
  const main = async () => (await request(`${repo}/git/ref/heads/main`)).object.sha;
  const head = await main();
  if (!/^[a-f0-9]{40}$/.test(head)) throw new Error("无法读取 main 修订");
  const ref = `refs/tags/${tag}`;
  const existing = async () => (await request(`${repo}/git/matching-refs/tags/${tag}`)).find(item => item.ref === ref);
  const found = await existing();
  if (found) {
    if (found.object.type !== "commit" || found.object.sha !== head) throw new Error("同名标签已存在且不指向当前 main");
    return head;
  }
  const runs = await request(`${repo}/actions/workflows/ci.yml/runs?branch=main&event=push&status=success&head_sha=${head}&per_page=100`);
  if (!runs.workflow_runs.some(run => run.event === "push" && run.head_sha === head && run.head_branch === "main" && run.conclusion === "success")) {
    throw new Error("此主线提交尚未通过 CI");
  }
  for (const name of packages) {
    const data = await request(`${repo}/contents/${name}/package.json?ref=${head}`);
    const manifest = JSON.parse(Buffer.from(data.content,"base64").toString("utf8"));
    if (manifest.private || manifest.name !== `@iquji-community/web-${name}` || tag !== `v${manifest.version}`) {
      throw new Error(`${name} 的包身份或版本不符`);
    }
  }
  if (await main() !== head) throw new Error("main 已更新，请对最新提交重新执行");
  try {
    await request(`${repo}/git/refs`, "POST", {ref, sha:head});
  } catch (error) {
    const raced = await existing();
    if (raced?.object?.type !== "commit" || raced.object.sha !== head) throw error;
  }
  return head;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  if (process.argv.length !== 3) throw new Error("用法：node scripts/tag-main.mjs vX.Y.Z");
  console.log(await tagMain(process.argv[2]));
}
