import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { packPackages } from "./package.mjs";
import { verifyPublishedArtifact } from "./package-content.mjs";

export function retryableReleaseError(error) {
  if (error instanceof AggregateError) return error.errors.length > 0 && error.errors.every(retryableReleaseError);
  return error?.retryableRelease === true;
}

function temporaryNetworkError(error) {
  if (["AbortError", "TimeoutError"].includes(error?.name)) return true;
  return ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EAI_AGAIN", "ENETUNREACH", "EHOSTUNREACH", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_BODY_TIMEOUT", "UND_ERR_SOCKET"].includes(error?.cause?.code ?? error?.code);
}

function propagationError(message) {
  return Object.assign(new Error(message), { retryableRelease: true });
}

export async function release({ verifyOnly = false, dryRun = false, fetchImpl = fetch, pack = packPackages, publish = execFileSync, tag = process.env.GITHUB_REF_TYPE === "tag" ? process.env.GITHUB_REF_NAME : undefined, registryAttempts = 181, pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms)), now = Date.now, verificationTimeoutMs = 900000 } = {}) {
  const output = mkdtempSync(join(tmpdir(), "iquji-web-release-"));
  try {
    const artifacts = pack(output);
    const uploaded = [];
    if (tag && artifacts.some((item) => tag !== `v${item.version}`)) throw new Error("标签必须与全部正式包版本一致。");
    if (!Number.isSafeInteger(verificationTimeoutMs) || verificationTimeoutMs <= 0 || verificationTimeoutMs > 900000) throw new Error("注册表核验预算必须在十五分钟以内。");
    const deadline = now() + verificationTimeoutMs;
    async function lookup(item, waitForPublication = false) {
      let latestStatus = "请求超时";
      for (let attempt = 0; attempt < registryAttempts && now() < deadline; attempt += 1) {
        const url = new URL(`https://registry.npmjs.org/${encodeURIComponent(item.name)}/${item.version}`);
        // 注册表和下载 CDN 的传播独立；公开随机查询参数避免重复读取缓存的旧 404。
        url.searchParams.set("iquji-verification", randomUUID());
        try {
          const response = await fetchImpl(url.href, {
            redirect: "error", headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
            signal: AbortSignal.timeout(Math.max(1, Math.min(30000, deadline - now()))),
          });
          if (response.ok) return await response.json();
          latestStatus = `HTTP ${response.status}`;
          await response.body?.cancel().catch(() => {});
          if (response.status === 404 && !waitForPublication) return null;
          if (![404, 429].includes(response.status) && response.status < 500) throw new Error(`注册表查询失败：${item.name} (${response.status})`);
        } catch (error) {
          if (!temporaryNetworkError(error)) throw error;
          latestStatus = error.cause?.code ?? error.name;
        }
        if (attempt + 1 < registryAttempts && deadline - now() > 5000) await pause(5000);
      }
      throw propagationError(`注册表尚不可读取：${item.name}@${item.version}（${latestStatus}），保留版本自动继续。`);
    }
    const verify = (item, published) => {
      const remaining = deadline - now();
      if (remaining <= 0) throw propagationError(`注册表核验预算已耗尽：${item.name}@${item.version}，保留版本自动继续。`);
      return verifyPublishedArtifact(item, published, fetchImpl, { timeoutMs: remaining, pause, now });
    };
    for (const item of artifacts) {
      const published = await lookup(item);
      if (published) {
        const count = await verify(item, published);
        console.log(`已发布且 ${count} 个文件内容一致：${item.name}@${item.version}`);
        continue;
      }
      if (verifyOnly) throw new Error(`只读核验发现尚未发布的版本：${item.name}@${item.version}`);
      const args = ["publish", item.filename, "--access", "public", "--ignore-scripts", "--registry", "https://registry.npmjs.org/"];
      if (dryRun) args.push("--dry-run");
      if (process.env.GITHUB_ACTIONS === "true") args.push("--provenance");
      publish("npm", args, { stdio: "inherit" });
      if (!dryRun) uploaded.push(item);
    }
    // 按依赖顺序完成上传后，同时等待各包分发，避免把注册表传播延迟逐包累加。
    const verified = await Promise.allSettled(uploaded.map(async (item) => {
      const published = await lookup(item, true);
      const count = await verify(item, published);
      console.log(`已发布并核验 ${count} 个文件：${item.name}@${item.version}`);
    }));
    const failed = verified.filter((result) => result.status === "rejected");
    if (failed.length) throw new AggregateError(failed.map((result) => result.reason), "部分已上传制品暂未通过核验，重跑会复用此版本。");
  } finally {
    rmSync(output, { recursive: true, force: true });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  if (args.some((arg) => !["--verify-published", "--dry-run"].includes(arg))) throw new Error("不支持的发布参数。");
  try {
    await release({ verifyOnly: args.includes("--verify-published"), dryRun: args.includes("--dry-run") });
  } catch (error) {
    console.error(error);
    process.exitCode = retryableReleaseError(error) ? 75 : 1;
  }
}
