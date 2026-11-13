import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const MAX_ARCHIVE_BYTES = 32 * 1024 * 1024;
const MAX_UNPACKED_BYTES = 128 * 1024 * 1024;
const decoder = new TextDecoder("utf-8", { fatal: true });

function field(header, start, length) {
  const bytes = header.subarray(start, start + length);
  const end = bytes.indexOf(0);
  return decoder.decode(end < 0 ? bytes : bytes.subarray(0, end));
}

function octal(header, start, length) {
  const value = field(header, start, length).trim();
  if (!/^[0-7]+$/.test(value)) throw new Error("制品包含无效的 tar 数值字段。");
  const parsed = Number.parseInt(value, 8);
  if (!Number.isSafeInteger(parsed)) throw new Error("制品 tar 数值超出安全范围。");
  return parsed;
}

export function readPackageFiles(archive) {
  if (archive.length > MAX_ARCHIVE_BYTES) throw new Error("制品压缩体积超出检查上限。");
  const tar = gunzipSync(archive, { maxOutputLength: MAX_UNPACKED_BYTES });
  const files = new Map();
  const seen = new Set();
  let offset = 0;
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      if (tar.length - offset < 1024 || !tar.subarray(offset).every((byte) => byte === 0)) {
        throw new Error("制品 tar 结束标记无效。");
      }
      if (!files.has("package.json")) throw new Error("制品缺少 package.json。");
      return files;
    }
    const checksum = header.reduce((sum, byte, index) => sum + (index >= 148 && index < 156 ? 32 : byte), 0);
    if (checksum !== octal(header, 148, 8)) throw new Error("制品 tar 头校验失败。");
    if (field(header, 257, 6) !== "ustar") throw new Error("制品不是支持的 ustar 归档。");
    const type = header[156];
    // 发布包只接受普通文件和目录，其他 tar 扩展一律失败，避免遗漏实际安装内容。
    if (![0, 48, 53].includes(type)) throw new Error("制品包含不支持的 tar 记录或链接。");
    const prefix = field(header, 345, 155);
    const name = `${prefix ? `${prefix}/` : ""}${field(header, 0, 100)}`;
    const location = type === 53 && name.endsWith("/") ? name.slice(0, -1) : name;
    if (!location.startsWith("package/") && !(type === 53 && location === "package")) {
      throw new Error("制品路径必须位于 package/ 内。");
    }
    if (/[\\\x00-\x1f\x7f]/.test(location) || location.split("/").some((part) => !part || part === "." || part === "..")) {
      throw new Error("制品包含不安全的路径。");
    }
    if (seen.has(location)) throw new Error(`制品包含重复路径：${location}`);
    seen.add(location);
    if (seen.size > 10000) throw new Error("制品条目数超出检查上限。");
    const size = octal(header, 124, 12);
    const start = offset + 512;
    const end = start + size;
    const next = start + Math.ceil(size / 512) * 512;
    if (next > tar.length) throw new Error("制品 tar 文件内容不完整。");
    if (type === 53) {
      if (size !== 0) throw new Error("制品目录记录不允许包含正文。");
    } else {
      const relative = location.slice("package/".length);
      if (!/^(?:dist\/|package\.json$|README\.md$|LICENSE$)/.test(relative)) {
        throw new Error(`制品包含非发布文件：${relative}`);
      }
      files.set(relative, { content: tar.subarray(start, end), executable: octal(header, 100, 8) & 0o111 });
    }
    offset = next;
  }
  throw new Error("制品 tar 缺少结束标记。");
}

export function comparePackageContents(localArchive, publishedArchive) {
  const local = readPackageFiles(localArchive);
  const published = readPackageFiles(publishedArchive);
  for (const name of new Set([...local.keys(), ...published.keys()])) {
    const left = local.get(name);
    const right = published.get(name);
    if (!left || !right) throw new Error(`已发布制品的文件清单不同：${name}`);
    if (!left.content.equals(right.content)) throw new Error(`已发布制品的文件内容不同：${name}`);
    if (left.executable !== right.executable) throw new Error(`已发布制品的可执行权限不同：${name}`);
  }
  return local.size;
}

async function downloadArchive(url, fetchImpl) {
  const response = await fetchImpl(url, { redirect: "error", signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`下载已发布制品失败：HTTP ${response.status}`);
  if (Number(response.headers.get("content-length")) > MAX_ARCHIVE_BYTES) throw new Error("制品下载体积超出检查上限。");
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > MAX_ARCHIVE_BYTES) throw new Error("制品下载体积超出检查上限。");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function verifyPublishedArtifact(item, published, fetchImpl = fetch) {
  if (published.name !== item.name || published.version !== item.version) throw new Error("注册表返回的包身份或版本不匹配。");
  const url = new URL(published.dist?.tarball);
  if (url.origin !== "https://registry.npmjs.org" || url.username || url.password || url.hash) {
    throw new Error("已发布制品必须来自公开 npm 注册表。");
  }
  const archive = await downloadArchive(url, fetchImpl);
  const integrity = `sha512-${createHash("sha512").update(archive).digest("base64")}`;
  if (!published.dist?.integrity?.split(/\s+/).includes(integrity)) throw new Error("已发布制品的完整性校验失败。");
  return comparePackageContents(readFileSync(item.filename), archive);
}
