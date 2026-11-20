import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packages, root } from "./package.mjs";

export function verifyReleaseTag(tag, cwd = root) {
  if (!/^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(tag ?? "")) {
    throw new Error("发布需要 vX.Y.Z 标签");
  }
  const git = (...args) => execFileSync("git", args, {cwd, encoding: "utf8"}).trim();
  const revision = git("rev-parse", "--verify", `refs/tags/${tag}^{commit}`);
  if (git("rev-parse", "HEAD") !== revision) throw new Error("发布检出与标签不匹配");
  git("merge-base", "--is-ancestor", revision, "refs/remotes/origin/main");
  for (const item of packages) {
    const metadata = JSON.parse(readFileSync(path.join(cwd, item, "package.json"), "utf8"));
    if (metadata.private || metadata.version !== tag.slice(1) || metadata.name !== `@iquji-community/web-${item}`) {
      throw new Error(`${item} 的名称、版本或发布属性与标签不符`);
    }
  }
  return revision;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) verifyReleaseTag(process.argv[2]);
