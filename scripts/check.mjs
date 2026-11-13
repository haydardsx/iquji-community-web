import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { packPackages, packages, root } from "./package.mjs";

const timeout = process.env.IQUJI_TEST_TIMEOUT_MS || "30000";
execFileSync("node", ["--test", join(root, "scripts/package-content.test.mjs")], { cwd: root, stdio: "inherit" });
for (const directory of [...packages, "preview"]) {
  const cwd = join(root, directory);
  execFileSync("bun", ["install", "--frozen-lockfile"], { cwd, stdio: "inherit" });
  if (directory !== "preview") execFileSync("bun", ["run", "build"], { cwd, stdio: "inherit" });
  else execFileSync("bun", ["run", "lint"], { cwd, stdio: "inherit" });
  execFileSync("bun", ["run", "typecheck"], { cwd, stdio: "inherit" });
  execFileSync("bun", ["test", "--timeout", timeout, "./src"], { cwd, stdio: "inherit" });
  if (directory === "preview") execFileSync("bun", ["--bun", "vite", "build"], { cwd, stdio: "inherit" });
}
const output = mkdtempSync(join(tmpdir(), "iquji-web-check-"));
try {
  const artifacts = packPackages(output);
  console.log(`全部检查通过，已验证 ${artifacts.length} 个公开 tarball。`);
} finally {
  rmSync(output, { recursive: true, force: true });
}
