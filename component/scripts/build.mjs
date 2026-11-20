import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "src");
const outdir = path.join(root, "dist");
fs.rmSync(outdir, { recursive: true, force: true });
const entrypoints = [
  path.join(
    source,
    fs.existsSync(path.join(source, "index.tsx")) ? "index.tsx" : "index.ts",
  ),
];
if (fs.existsSync(path.join(source, "test-support.ts")))
  entrypoints.push(path.join(source, "test-support.ts"));
const built = await Bun.build({
  entrypoints,
  outdir,
  target: "browser",
  format: "esm",
  packages: "external",
  define: { "process.env.NODE_ENV": '"production"' },
});
if (!built.success)
  throw new AggregateError(built.logs, "JavaScript 产物构建失败");
const declarations = Bun.spawnSync(
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
if (declarations.exitCode !== 0) process.exit(declarations.exitCode);
for (const stylesheet of ["styles.css", "tokens.css"]) {
  const entrypoint = path.join(source, stylesheet);
  if (!fs.existsSync(entrypoint)) continue;
  const styles = await Bun.build({
    entrypoints: [entrypoint],
    outdir,
    target: "browser",
  });
  if (!styles.success)
    throw new AggregateError(styles.logs, "CSS 产物构建失败");
}
