import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { packages, root as repositoryRoot } from "./package.mjs";

const stableVersion = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const packageDirectories = new Map(packages.map((directory) => [`@iquji-web/web-${directory}`, directory]));
const dependencyFields = new Set(["dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "overrides"]);

// 保留原始位置，仅忽略 JSONC 注释和尾逗号；字符串内容交给 JSON.parse 校验。
function parseDocument(text, filename) {
  const characters = text.split("");
  const tokens = [];
  for (let index = 0; index < text.length;) {
    const start = index;
    const character = text[index];
    if (character === '"') {
      index++;
      while (index < text.length && text[index] !== '"') index += text[index] === "\\" ? 2 : 1;
      if (index >= text.length) throw new Error(`${filename} 包含未结束的字符串。`);
      index++;
      tokens.push({ kind: "string", value: JSON.parse(text.slice(start, index)), start, end: index });
    } else if (text.startsWith("//", index) || text.startsWith("/*", index)) {
      const line = text[index + 1] === "/";
      const end = line ? text.indexOf("\n", index + 2) : text.indexOf("*/", index + 2);
      if (!line && end < 0) throw new Error(`${filename} 包含未结束的注释。`);
      index = end < 0 ? text.length : end + (line ? 0 : 2);
      for (let position = start; position < index; position++) {
        if (!/[\r\n]/.test(characters[position])) characters[position] = " ";
      }
    } else {
      if ("{}[]:,".includes(character)) tokens.push({ kind: character, start, end: index + 1 });
      index++;
    }
  }
  for (let index = 0; index < tokens.length; index++) {
    if (tokens[index].kind === "," && ["}", "]"].includes(tokens[index + 1]?.kind)) characters[tokens[index].start] = " ";
  }
  try {
    return { value: JSON.parse(characters.join("")), tokens };
  } catch (error) {
    throw new Error(`${filename} 不是有效的 JSON 文档。`, { cause: error });
  }
}

function updateDependencies(value, { root, directory, filename, previousVersion, version, publicManifest = false }) {
  if (!value || typeof value !== "object") return;
  for (const [field, contents] of Object.entries(value)) {
    if (dependencyFields.has(field)) {
      if (!contents || typeof contents !== "object" || Array.isArray(contents)) throw new Error(`${filename} 的 ${field} 必须是依赖映射。`);
      for (const [name, current] of Object.entries(contents)) {
        if (!name.startsWith("@iquji-web/")) continue;
        const target = packageDirectories.get(name);
        if (!target) throw new Error(`${filename} 含有未知内部依赖：${name}。`);
        if (typeof current !== "string") throw new Error(`${filename} 的内部依赖版本必须是字符串：${name}。`);
        if (current.startsWith("file:")) {
          if ((publicManifest && ["dependencies", "peerDependencies", "optionalDependencies"].includes(field)) || resolve(root, directory, current.slice(5)) !== join(root, target)) {
            throw new Error(`${filename} 的内部本地依赖路径无效：${name}。`);
          }
        } else {
          if (current !== previousVersion) throw new Error(`${filename} 的内部依赖版本不一致：${name}。`);
          contents[name] = version;
        }
      }
    } else {
      updateDependencies(contents, { root, directory, filename, previousVersion, version });
    }
  }
}

function patchVersions(text, document, expected, filename, previousVersion, version, manifest) {
  const replacements = [];
  let depth = 0;
  for (let index = 0; index < document.tokens.length; index++) {
    const token = document.tokens[index];
    if (["{", "["].includes(token.kind)) depth++;
    if (["}", "]"].includes(token.kind)) depth--;
    const value = document.tokens[index + 2];
    if (token.kind !== "string" || document.tokens[index + 1]?.kind !== ":" || value?.kind !== "string" || value.value !== previousVersion) continue;
    if (packageDirectories.has(token.value) || (manifest && depth === 1 && token.value === "version")) {
      replacements.push({ start: value.start, end: value.end });
    }
  }
  let updated = text;
  for (const replacement of replacements.reverse()) updated = updated.slice(0, replacement.start) + JSON.stringify(version) + updated.slice(replacement.end);
  if (!isDeepStrictEqual(parseDocument(updated, filename).value, expected)) throw new Error(`${filename} 的版本文本更新超出已验证范围。`);
  return updated;
}

export function updateVersion(directory, version) {
  if (typeof version !== "string" || !stableVersion.test(version)) throw new Error("发布版本必须是无前导零的正式 x.y.z 版本。");
  const root = resolve(directory);
  const manifests = ["package.json", ...packages.map((item) => `${item}/package.json`), "preview/package.json"].map((filename) => {
    const text = readFileSync(join(root, filename), "utf8");
    return { filename, text, document: parseDocument(text, filename) };
  });
  const previousVersion = manifests[1].document.value.version;
  if (typeof previousVersion !== "string" || !stableVersion.test(previousVersion)) throw new Error("当前公开包缺少有效的统一正式版本。");
  const changes = [];
  for (const item of manifests) {
    const manifest = item.document.value;
    const localDirectory = dirname(item.filename);
    const publicManifest = packages.includes(localDirectory);
    if (manifest.version !== previousVersion) throw new Error(`${item.filename} 的当前版本不一致。`);
    if (publicManifest ? ![undefined, false].includes(manifest.private) || manifest.name !== `@iquji-web/web-${localDirectory}` : manifest.private !== true || typeof manifest.name !== "string" || !manifest.name) {
      throw new Error(`${item.filename} 的包身份或 private 标记无效。`);
    }
    const expected = structuredClone(manifest);
    expected.version = version;
    updateDependencies(expected, { root, directory: localDirectory, filename: item.filename, previousVersion, version, publicManifest });
    changes.push({ filename: item.filename, text: item.text, updated: patchVersions(item.text, item.document, expected, item.filename, previousVersion, version, true) });
  }
  for (const localDirectory of [...packages, "preview"]) {
    const filename = `${localDirectory}/bun.lock`;
    const text = readFileSync(join(root, filename), "utf8");
    const document = parseDocument(text, filename);
    const manifest = manifests.find((item) => item.filename === `${localDirectory}/package.json`).document.value;
    if (document.value.workspaces?.[""]?.name !== manifest.name) throw new Error(`${filename} 的工作区身份与包清单不一致。`);
    for (const key of Object.keys(document.value.packages ?? {})) {
      for (const name of key.match(/@iquji-web\/[a-zA-Z0-9._-]+/g) ?? []) {
        if (!packageDirectories.has(name)) throw new Error(`${filename} 含有未知内部依赖：${name}。`);
      }
    }
    const expected = structuredClone(document.value);
    updateDependencies(expected, { root, directory: localDirectory, filename, previousVersion, version });
    changes.push({ filename, text, updated: patchVersions(text, document, expected, filename, previousVersion, version, false) });
  }
  // 所有清单和锁文件先验证，避免输入错误造成半套版本更新。
  const changedFiles = changes.filter((item) => item.text !== item.updated);
  for (const item of changedFiles) writeFileSync(join(root, item.filename), item.updated);
  return { previousVersion, version, changedFiles: changedFiles.map((item) => item.filename) };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [version, directory = repositoryRoot, ...extra] = process.argv.slice(2);
  if (extra.length) throw new Error("用法：node scripts/version.mjs <x.y.z> [仓库目录]");
  const result = updateVersion(directory, version);
  console.log(`版本 ${result.previousVersion} → ${result.version}，更新 ${result.changedFiles.length} 个文件。`);
}
