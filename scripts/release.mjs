import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { packPackages } from "./package.mjs";

const output = mkdtempSync(join(tmpdir(), "iquji-web-release-"));
try {
  const artifacts = packPackages(output);
  const tag = process.env.GITHUB_REF_NAME;
  if (tag && artifacts.some((item) => tag !== `v${item.version}`)) throw new Error("标签必须与全部正式包版本一致。");
  for (const item of artifacts) {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(item.name)}/${item.version}`);
    if (response.ok) {
      const published = await response.json();
      if (published.dist?.integrity !== item.integrity) throw new Error(`${item.name}@${item.version} 已存在但内容不同，请发布新版本。`);
      console.log(`已发布且内容一致：${item.name}@${item.version}`);
      continue;
    }
    if (response.status !== 404) throw new Error(`注册表查询失败：${item.name} (${response.status})`);
    const args = ["publish", item.filename, "--access", "public", "--ignore-scripts", "--registry", "https://registry.npmjs.org/"];
    if (process.argv.includes("--dry-run")) args.push("--dry-run");
    if (process.env.GITHUB_ACTIONS === "true") args.push("--provenance");
    execFileSync("npm", args, { stdio: "inherit" });
  }
} finally {
  rmSync(output, { recursive: true, force: true });
}
