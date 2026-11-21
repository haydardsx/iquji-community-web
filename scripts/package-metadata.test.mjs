import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { packages, root } from "./package.mjs";

test("所有公开包都使用 Community 官方作者身份", () => {
  for (const directory of packages) {
    const manifest = JSON.parse(readFileSync(join(root, directory, "package.json"), "utf8"));
    assert.deepEqual(manifest.author, {
      name: "IQuji Community",
      email: "community@iqu.lol",
    });
  }
});

test("预览与私有 tooling 不作为公开作者发行包", () => {
  for (const filename of ["package.json", "preview/package.json"]) {
    const manifest = JSON.parse(readFileSync(join(root, filename), "utf8"));
    assert.equal(manifest.private, true);
    assert.equal(manifest.author?.email, undefined);
  }
});
