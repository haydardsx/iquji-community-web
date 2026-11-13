import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { packPackages } from "./package.mjs";
import { verifyPublishedArtifact } from "./package-content.mjs";

export async function release({ verifyOnly = false, dryRun = false, fetchImpl = fetch, pack = packPackages, publish = execFileSync, tag = process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : undefined, registryAttempts = 60, pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  const output = mkdtempSync(join(tmpdir(), "iquji-web-release-"));
  try {
    const artifacts = pack(output);
    if (tag && artifacts.some((item) => tag !== `v${item.version}`)) throw new Error("标签必须与全部正式包版本一致。");
    async function lookup(item, attempts = 1) {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        const response = await fetchImpl(`https://registry.npmjs.org/${encodeURIComponent(item.name)}/${item.version}`, {
          redirect: "error", signal: AbortSignal.timeout(30000),
        });
        if (response.ok) return response.json();
        if (response.status !== 404) throw new Error(`注册表查询失败：${item.name} (${response.status})`);
        if (attempt + 1 < attempts) await pause(5000);
      }
      return null;
    }
    for (const item of artifacts) {
      const published = await lookup(item);
      if (published) {
        const count = await verifyPublishedArtifact(item, published, fetchImpl);
        console.log(`已发布且 ${count} 个文件内容一致：${item.name}@${item.version}`);
        continue;
      }
      if (verifyOnly) throw new Error(`只读核验发现尚未发布的版本：${item.name}@${item.version}`);
      const args = ["publish", item.filename, "--access", "public", "--ignore-scripts", "--registry", "https://registry.npmjs.org/"];
      if (dryRun) args.push("--dry-run");
      if (process.env.GITHUB_ACTIONS === "true") args.push("--provenance");
      publish("npm", args, { stdio: "inherit" });
      if (!dryRun) {
        const uploaded = await lookup(item, registryAttempts);
        if (!uploaded) throw new Error(`发布请求已提交，但注册表尚不可读取：${item.name}@${item.version}，重跑会复用此版本。`);
        const count = await verifyPublishedArtifact(item, uploaded, fetchImpl);
        console.log(`已发布并核验 ${count} 个文件：${item.name}@${item.version}`);
      }
    }
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  if (args.some((arg) => !["--verify-published", "--dry-run"].includes(arg))) throw new Error("不支持的发布参数。");
  await release({ verifyOnly: args.includes("--verify-published"), dryRun: args.includes("--dry-run") });
}
