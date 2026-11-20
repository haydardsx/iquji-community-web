import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { isIPv4 } from "node:net";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const preview = fileURLToPath(new URL("../preview/src/previews/", import.meta.url));
const exampleNetworks = new Set(["192.0.2", "198.51.100", "203.0.113"]);

test("预览演示中的 IPv4 字面量使用文档示例网段或环回地址", () => {
  for (const entry of readdirSync(preview, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !/\.[jt]sx?$/.test(entry.name) || entry.name.includes(".test.")) {
      continue;
    }
    const source = readFileSync(join(entry.parentPath, entry.name), "utf8");
    for (const { 0: address } of source.matchAll(/(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])/g)) {
      if (!isIPv4(address)) continue;
      const network = address.slice(0, address.lastIndexOf("."));
      assert.ok(
        address.startsWith("127.") || exampleNetworks.has(network),
        `${entry.name} 使用了非示例 IPv4 字面量`,
      );
    }
  }
});
