import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const packages = ["icons", "theme", "motion", "i18n", "query", "network", "component", "editor"];

export function packPackages(output) {
  mkdirSync(output, { recursive: true });
  if (readdirSync(output).length) throw new Error("发布输出目录必须为空。");
  const staging = mkdtempSync(join(tmpdir(), "iquji-web-package-"));
  try {
    return packages.map((directory) => {
      const source = join(root, directory);
      const target = join(staging, directory);
      mkdirSync(target);
      const manifest = JSON.parse(readFileSync(join(source, "package.json"), "utf8"));
      if (manifest.private || !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(manifest.version)) throw new Error(`${directory} 缺少有效公开版本。`);
      for (const key of ["devDependencies", "overrides", "scripts", "packageManager", "engines"]) delete manifest[key];
      for (const dependencies of [manifest.dependencies, manifest.peerDependencies]) {
        if (Object.values(dependencies ?? {}).some((value) => /^(?:file:|link:|workspace:|git\+|\.\.?\/)/.test(value))) throw new Error(`${directory} 的正式依赖必须使用公共注册表版本。`);
      }
      for (const item of ["dist", "README.md", "LICENSE"]) {
        if (!existsSync(join(source, item))) throw new Error(`${directory} 缺少 ${item}。`);
        cpSync(join(source, item), join(target, item), { recursive: true });
      }
      writeFileSync(join(target, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
      const [packed] = JSON.parse(execFileSync("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", output], { cwd: target, encoding: "utf8" }));
      for (const file of packed.files) {
        if (!/^(?:dist\/|package\.json$|README\.md$|LICENSE$)/.test(file.path)) throw new Error(`制品包含非发布文件：${file.path}`);
        const content = readFileSync(join(target, file.path));
        if (/\/(?:Users|home)\/[A-Za-z0-9_.-]+\/|[A-Z]:\\Users\\|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content.toString())) throw new Error(`制品包含本机信息或私密内容：${directory}/${file.path}`);
      }
      const filename = join(output, packed.filename);
      const integrity = `sha512-${createHash("sha512").update(readFileSync(filename)).digest("base64")}`;
      return { name: manifest.name, version: manifest.version, filename, integrity };
    });
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = process.argv.slice(2).find((arg) => arg !== "--");
  if (!output) throw new Error("用法：bun run pack -- <空输出目录>");
  for (const item of packPackages(resolve(output))) console.log(`${item.name}@${item.version}: ${item.filename}`);
}
