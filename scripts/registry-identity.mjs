import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { publisherEmail, verifyPublisher } from "./npm-publisher.mjs";
import { root } from "./package.mjs";

export async function auditRegistry(names, { allowMissing, fetchImpl = fetch, verify = verifyPublisher } = {}) {
  const email = process.env.COMMUNITY_RELEASE_EMAIL;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("缺少经核实的公开发行邮箱。");
  const directory = mkdtempSync(join(tmpdir(), "community-registry-"));
  const documents = [];
  try {
    for (const name of names) {
      const url = new URL(encodeURIComponent(name), "https://registry.npmjs.org/");
      const response = await fetchImpl(url, {
        redirect: "error", headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(30000),
      });
      if (allowMissing && response.status === 404) continue;
      if (!response.ok) {
        const error = new Error(`无法核验 ${name} 的注册表身份（HTTP ${response.status}）。`);
        error.retryableRelease = response.status === 404 || response.status === 429 || response.status >= 500;
        throw error;
      }
      const record = await response.json();
      if (record.name !== name || !Array.isArray(record.maintainers) || !record.maintainers.length
          || record.maintainers.some((person) => typeof person?.email !== "string")) {
        throw new Error(`${name} 的注册表维护者记录不完整。`);
      }
      const file = join(directory, `package-${documents.length}.json`);
      const issuers = [];
      for (const [version, entry] of Object.entries(record.versions ?? {})) {
        if (entry._npmUser?.email === publisherEmail) {
          await verify(name, version, entry, fetchImpl);
          issuers.push(version);
        }
      }
      writeFileSync(file, JSON.stringify({record, issuers}), { mode: 0o600 });
      documents.push(file);
    }
    if (documents.length) {
      const args = documents.flatMap((file) => ["--verified-registry", file]);
      execFileSync("python3", [join(root, ".github/scripts/community_guard.py"), "--repo", root, "--tree", "HEAD", ...args], { stdio: "inherit" });
    }
    return documents.length;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
