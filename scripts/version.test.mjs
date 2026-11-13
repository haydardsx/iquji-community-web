import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { packages } from "./package.mjs";
import { updateVersion } from "./version.mjs";

const name = (directory) => `@iquji-web/web-${directory}`;
const internal = (directory) => directory === "component" ? { [name("icons")]: "0.1.0", [name("theme")]: "0.1.0" }
  : directory === "editor" ? { [name("component")]: "0.1.0", [name("icons")]: "0.1.0", [name("theme")]: "0.1.0" } : {};

function fixture(context) {
  const root = mkdtempSync(join(tmpdir(), "iquji-version-test-"));
  context.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, value) => writeFileSync(join(root, path), typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`);
  write("package.json", { name: "@iquji-web/community-web-tooling", private: true, version: "0.1.0" });
  for (const directory of [...packages, "preview"]) {
    mkdirSync(join(root, directory));
    const deps = directory === "preview" ? Object.fromEntries(packages.map((item) => [name(item), `file:../${item}`])) : internal(directory);
    const overrides = Object.fromEntries(Object.keys(deps).map((item) => [item, `file:../${item.slice("@iquji-web/web-".length)}`]));
    write(`${directory}/package.json`, { name: name(directory), version: "0.1.0", ...(directory === "preview" ? { private: true } : {}), dependencies: deps, overrides });
    const records = { external: ["external@0.1.0", "https://registry.example.invalid", { description: '字面内容 ,} 和 \\"、0.1.0 均不改变' }, "sha512-original"] };
    if (["editor", "preview"].includes(directory)) records[name("component")] = [`${name("component")}@file:../component`, { dependencies: internal("component") }];
    if (directory === "preview") records[name("editor")] = [`${name("editor")}@file:../editor`, { dependencies: internal("editor") }];
    const lock = { lockfileVersion: 1, configVersion: 1, workspaces: { "": { name: name(directory), dependencies: deps } }, overrides, packages: records };
    write(`${directory}/bun.lock`, `// 保留注释："${name("icons")}": "0.1.0"\n${JSON.stringify(lock, null, 2).replace(/\n}$/, ",\n}")}\n`);
  }
  return { root, write, json: (path) => JSON.parse(readFileSync(join(root, path), "utf8")), text: (path) => readFileSync(join(root, path), "utf8") };
}

function snapshot(value) {
  return Object.fromEntries(["package.json", ...[...packages, "preview"].flatMap((directory) => [`${directory}/package.json`, `${directory}/bun.lock`])].map((path) => [path, value.text(path)]));
}

test("同步全部版本和正式内部依赖，保留私有身份、本地路径及第三方锁字节", (context) => {
  const value = fixture(context);
  const before = snapshot(value);
  const result = updateVersion(value.root, "0.1.1");
  assert.equal(result.previousVersion, "0.1.0");
  assert.deepEqual(result.changedFiles.filter((path) => path.endsWith("bun.lock")), ["component/bun.lock", "editor/bun.lock", "preview/bun.lock"]);
  for (const directory of ["", ...packages, "preview"]) {
    const file = directory ? `${directory}/package.json` : "package.json";
    const manifest = value.json(file);
    assert.equal(manifest.version, "0.1.1");
    const original = JSON.parse(before[file]);
    assert.equal(manifest.name, original.name);
    assert.equal(manifest.private, original.private);
    assert.deepEqual(manifest.overrides, original.overrides);
    for (const [dependency, version] of Object.entries(internal(directory))) {
      assert.equal(version, "0.1.0");
      assert.equal(manifest.dependencies[dependency], "0.1.1");
    }
  }
  for (const directory of [...packages, "preview"]) {
    const path = `${directory}/bun.lock`;
    // 仅内部包键对应的版本字符串应变化，注释和第三方值必须逐字保留。
    const expected = before[path].split("\n").map((line) => line.startsWith("//") ? line : line.replace(/("@iquji-web\/web-[a-z]+": )"0\.1\.0"/g, '$1"0.1.1"')).join("\n");
    assert.equal(value.text(path), expected);
  }
  assert.deepEqual(value.json("preview/package.json").dependencies, JSON.parse(before["preview/package.json"]).dependencies);
});

test("重复相同版本为无写入操作，Node CLI 支持显式仓库目录", (context) => {
  const value = fixture(context);
  const script = fileURLToPath(new URL("./version.mjs", import.meta.url));
  execFileSync(process.execPath, [script, "0.1.1", value.root]);
  const before = snapshot(value);
  assert.deepEqual(updateVersion(value.root, "0.1.1").changedFiles, []);
  assert.deepEqual(snapshot(value), before);
});

test("拒绝无效目标版本且不修改任何文件", (context) => {
  const value = fixture(context);
  const before = snapshot(value);
  for (const version of [undefined, "", "v0.1.1", "01.1.1", "0.1", "0.1.1-beta", "0.1.1+build", "0.1.1\n", "../0.1.1"]) {
    assert.throws(() => updateVersion(value.root, version), /正式 x\.y\.z/);
    assert.deepEqual(snapshot(value), before);
  }
});

test("公开包和私有清单的不同当前版本均在写入前拒绝", (context) => {
  for (const file of ["icons/package.json", "package.json", "preview/package.json"]) {
    const value = fixture(context);
    value.write(file, { ...value.json(file), version: "0.2.0" });
    const before = snapshot(value);
    assert.throws(() => updateVersion(value.root, "0.1.1"), /版本不一致/);
    assert.deepEqual(snapshot(value), before);
  }
});

test("拒绝未知内部依赖和过期内部版本，失败前不写入其他清单", (context) => {
  for (const mutate of [
    (value) => value.write("editor/package.json", { ...value.json("editor/package.json"), dependencies: { [name("unknown")]: "0.1.0" } }),
    (value) => value.write("component/package.json", { ...value.json("component/package.json"), dependencies: { [name("icons")]: "0.0.9" } }),
    (value) => value.write("preview/bun.lock", value.text("preview/bun.lock").replace('"@iquji-web/web-component": [', '"@iquji-web/web-unknown": [')),
    (value) => value.write("editor/bun.lock", value.text("editor/bun.lock").replaceAll('"@iquji-web/web-icons": "0.1.0"', '"@iquji-web/web-icons": "0.0.9"')),
  ]) {
    const value = fixture(context);
    mutate(value);
    const before = snapshot(value);
    assert.throws(() => updateVersion(value.root, "0.1.1"), /未知内部依赖|内部依赖版本不一致/);
    assert.deepEqual(snapshot(value), before);
  }
});

test("拒绝错误公开身份、私有标记及发布清单中的本地正式依赖", (context) => {
  for (const mutate of [
    (value) => value.write("icons/package.json", { ...value.json("icons/package.json"), name: name("unknown") }),
    (value) => value.write("component/package.json", { ...value.json("component/package.json"), private: "true" }),
    (value) => value.write("preview/package.json", { ...value.json("preview/package.json"), private: false }),
    (value) => value.write("component/package.json", { ...value.json("component/package.json"), dependencies: { [name("icons")]: "file:../icons" } }),
  ]) {
    const value = fixture(context);
    mutate(value);
    const before = snapshot(value);
    assert.throws(() => updateVersion(value.root, "0.1.1"), /包身份|private|本地依赖路径/);
    assert.deepEqual(snapshot(value), before);
  }
});

test("最后一份锁文件损坏时不会留下已更新的清单", (context) => {
  const value = fixture(context);
  value.write("preview/bun.lock", '{ "workspaces": ');
  const before = snapshot(value);
  assert.throws(() => updateVersion(value.root, "0.1.1"), /JSON 文档/);
  assert.deepEqual(snapshot(value), before);
});
