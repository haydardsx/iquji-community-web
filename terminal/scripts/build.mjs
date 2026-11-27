import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src");
const outdir = path.join(root, "dist");
fs.rmSync(outdir, { recursive: true, force: true });
const typescript = Bun.spawnSync(
  [
    process.execPath,
    path.join(root, "node_modules/typescript/bin/tsc"),
    "-p",
    "tsconfig.build.json",
  ],
  {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  },
);
if (typescript.exitCode !== 0) process.exit(typescript.exitCode);
const styles = await Bun.build({
  entrypoints: [path.join(source, "styles.css")],
  outdir,
  target: "browser",
});
if (!styles.success)
  throw new AggregateError(styles.logs, "CSS 产物构建失败");
