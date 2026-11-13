import { expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import * as ts from "typescript";
import { COMMUNITY_PACKAGES, COMMUNITY_PREVIEW_COVERAGE } from "../catalog";
import { componentPreviews } from "./index";

const communityRoot = path.resolve(import.meta.dir, "../../../");

function readPackageManifest(packageId: string) {
  return JSON.parse(
    readFileSync(path.join(communityRoot, packageId, "package.json"), "utf8"),
  ) as {
    name: string;
    exports: Record<string, unknown>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    overrides?: Record<string, string>;
  };
}

test("每个 Community 包及正式出口都由实际预览条目覆盖", () => {
  const packageDirectories = readdirSync(communityRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "preview")
    .filter((entry) =>
      existsSync(path.join(communityRoot, entry.name, "package.json")),
    )
    .map((entry) => entry.name)
    .sort();
  expect(packageDirectories).toEqual([...COMMUNITY_PACKAGES].sort());

  const previewIds = new Set(componentPreviews.map((preview) => preview.id));
  for (const packageId of COMMUNITY_PACKAGES) {
    const manifest = readPackageManifest(packageId);
    const coverage = COMMUNITY_PREVIEW_COVERAGE[packageId];
    const productionExports = Object.keys(manifest.exports).filter(
      (exportPath) => exportPath !== "./test-support",
    );
    expect(Object.keys(coverage).sort()).toEqual(productionExports.sort());
    for (const preview of componentPreviews.filter(
      (item) => (item.packageId ?? "component") === packageId,
    )) {
      expect(coverage["."]).toContain(preview.id);
    }
    for (const [exportPath, ids] of Object.entries(coverage)) {
      expect(ids.length).toBeGreaterThan(0);
      for (const id of ids) {
        expect(previewIds.has(id)).toBe(true);
        const item = componentPreviews.find((preview) => preview.id === id);
        expect(item?.packageId ?? "component").toBe(packageId);
      }
      expect(manifest.exports[exportPath]).toBeDefined();
    }
  }
});

test("所有包运行时导出都在 Community preview 中被实际使用", () => {
  const previewFiles = readdirSync(path.join(import.meta.dir), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile() && /\.tsx?$/u.test(entry.name))
    .filter((entry) => entry.name !== "coverage.test.ts")
    .map((entry) => path.join(import.meta.dir, entry.name));
  const previewSources = previewFiles.map((filePath) => ({
    filePath,
    source: readFileSync(filePath, "utf8"),
  }));
  const appEntry = path.resolve(import.meta.dir, "../main.tsx");
  previewSources.push({
    filePath: appEntry,
    source: readFileSync(appEntry, "utf8"),
  });
  const analyzedSources = previewSources.map(({ filePath, source }) => {
    const sourceFile = ts.createSourceFile(
      filePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const imports = new Map<string, { exported: string; local: string }[]>();
    const usedNames = new Set<string>();
    const visit = (node: ts.Node) => {
      if (ts.isImportDeclaration(node)) {
        if (ts.isStringLiteral(node.moduleSpecifier)) {
          const bindings = node.importClause?.namedBindings;
          if (bindings && ts.isNamedImports(bindings)) {
            imports.set(
              node.moduleSpecifier.text,
              bindings.elements.map((element) => ({
                exported: (element.propertyName ?? element.name).text,
                local: element.name.text,
              })),
            );
          }
        }
        return;
      }
      if (ts.isIdentifier(node)) usedNames.add(node.text);
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return { filePath, source, imports, usedNames };
  });
  const missing: string[] = [];
  const packageEntries = COMMUNITY_PACKAGES.map((packageId) => {
    const manifest = readPackageManifest(packageId);
    const mainExport = manifest.exports["."] as
      | string
      | { types?: string; import?: string };
    const declarationPath =
      typeof mainExport === "string" ? undefined : mainExport.types;
    expect(declarationPath).toBeDefined();
    const entryPath = path.resolve(
      communityRoot,
      packageId,
      declarationPath ?? "",
    );
    return { packageId, manifest, entryPath };
  });
  const program = ts.createProgram(
    packageEntries.map((entry) => entry.entryPath),
    {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      skipLibCheck: true,
      target: ts.ScriptTarget.ES2022,
    },
  );
  const checker = program.getTypeChecker();

  for (const { packageId, manifest, entryPath } of packageEntries) {
    const entrySource = program.getSourceFile(entryPath);
    expect(entrySource).toBeDefined();
    const moduleSymbol = entrySource
      ? checker.getSymbolAtLocation(entrySource)
      : undefined;
    expect(moduleSymbol).toBeDefined();
    const runtimeExports = moduleSymbol
      ? checker.getExportsOfModule(moduleSymbol).filter((symbol) => {
          const target =
            symbol.flags & ts.SymbolFlags.Alias
              ? checker.getAliasedSymbol(symbol)
              : symbol;
          return (target.flags & ts.SymbolFlags.Value) !== 0;
        })
      : [];

    for (const exported of runtimeExports) {
      const exportName = exported.getName();
      const references = analyzedSources.filter(({ imports, usedNames }) =>
        (imports.get(manifest.name) ?? []).some(
          (entry) =>
            entry.exported === exportName && usedNames.has(entry.local),
        ),
      );
      if (references.length === 0) {
        missing.push(`${manifest.name}: ${exportName} 未在 preview 中使用`);
        continue;
      }
      const sourceWithPreview = references.find(
        ({ filePath, source }) =>
          componentPreviews.some(
            (preview) =>
              source.includes(`id: "${preview.id}"`) &&
              (preview.packageId ?? "component") === packageId &&
              Object.values(COMMUNITY_PREVIEW_COVERAGE[packageId])
                .flat()
                .includes(preview.id),
          ) ||
          (packageId === "theme" &&
            exportName === "IqujiThemeProvider" &&
            filePath === appEntry),
      );
      if (!sourceWithPreview) {
        missing.push(`${manifest.name}: ${exportName} 缺少对应的 preview 条目`);
      }
    }
  }
  expect(missing).toEqual([]);
});

test("图标示例覆盖 icons 包声明的全部图标名称", () => {
  const declarationPath = path.join(communityRoot, "icons", "dist/index.d.ts");
  const program = ts.createProgram([declarationPath], {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
  });
  const checker = program.getTypeChecker();
  const declaration = program.getSourceFile(declarationPath);
  const moduleSymbol = declaration
    ? checker.getSymbolAtLocation(declaration)
    : undefined;
  const iconNameSymbol = moduleSymbol
    ? checker
        .getExportsOfModule(moduleSymbol)
        .find((symbol) => symbol.getName() === "IqujiIconName")
    : undefined;
  expect(iconNameSymbol).toBeDefined();
  const iconNameType = iconNameSymbol
    ? checker.getDeclaredTypeOfSymbol(iconNameSymbol)
    : undefined;
  const expectedNames = iconNameType
    ? (iconNameType.isUnion() ? iconNameType.types : [iconNameType])
        .filter((value) => (value.flags & ts.TypeFlags.StringLiteral) !== 0)
        .map((value) => (value as ts.StringLiteralType).value)
        .sort()
    : [];
  const iconSource = ts.createSourceFile(
    "icons.tsx",
    readFileSync(path.join(import.meta.dir, "icons.tsx"), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let actualNames: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "ICON_NAMES" &&
      node.initializer &&
      ts.isArrayLiteralExpression(node.initializer)
    ) {
      actualNames = node.initializer.elements
        .filter(ts.isStringLiteral)
        .map((element) => element.text)
        .sort();
    }
    ts.forEachChild(node, visit);
  };
  visit(iconSource);
  expect(new Set(actualNames).size).toBe(actualNames.length);
  expect(actualNames).toEqual(expectedNames);
});

test("Community 正式包的本地依赖闭包不越过公开仓边界", () => {
  const packageNames = new Set(
    COMMUNITY_PACKAGES.map((packageId) => readPackageManifest(packageId).name),
  );
  const dependencyFields = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
    "overrides",
  ] as const;

  for (const packageId of COMMUNITY_PACKAGES) {
    const packageRoot = path.join(communityRoot, packageId);
    const manifest = readPackageManifest(packageId);
    for (const field of dependencyFields) {
      for (const [name, version] of Object.entries(manifest[field] ?? {})) {
        if (name.startsWith("@iquji-web/web-")) {
          expect(packageNames.has(name)).toBe(true);
        }
        if (version.startsWith("file:")) {
          const dependencyPath = path.resolve(packageRoot, version.slice(5));
          const relativePath = path.relative(communityRoot, dependencyPath);
          expect(
            relativePath === "" ||
              (!relativePath.startsWith("..") &&
                !path.isAbsolute(relativePath)),
          ).toBe(true);
          expect(existsSync(dependencyPath)).toBe(true);
        }
      }
    }
  }
});

test("Community 源码导入只指向本包或登记的公开 Community 包", () => {
  const packageNames = new Set(
    COMMUNITY_PACKAGES.map((packageId) => readPackageManifest(packageId).name),
  );

  for (const packageId of COMMUNITY_PACKAGES) {
    const packageRoot = path.join(communityRoot, packageId);
    const sourceFiles: string[] = [];
    for (const directory of ["src", "scripts"]) {
      const root = path.join(packageRoot, directory);
      if (!existsSync(root)) continue;
      const visitDirectory = (current: string) => {
        for (const entry of readdirSync(current, { withFileTypes: true })) {
          const entryPath = path.join(current, entry.name);
          if (entry.isDirectory()) visitDirectory(entryPath);
          else if (/\.(?:ts|tsx|mts|cts)$/u.test(entry.name)) {
            sourceFiles.push(entryPath);
          }
        }
      };
      visitDirectory(root);
    }

    for (const filePath of sourceFiles) {
      const sourceFile = ts.createSourceFile(
        filePath,
        readFileSync(filePath, "utf8"),
        ts.ScriptTarget.Latest,
        true,
        filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );
      const visit = (node: ts.Node) => {
        let modulePath: string | undefined;
        if (
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
        ) {
          modulePath = node.moduleSpecifier.text;
        } else if (
          ts.isCallExpression(node) &&
          node.expression.kind === ts.SyntaxKind.ImportKeyword &&
          node.arguments[0] &&
          ts.isStringLiteral(node.arguments[0])
        ) {
          modulePath = node.arguments[0].text;
        }

        if (modulePath?.startsWith("@iquji-web/")) {
          const [scope, packageName] = modulePath.split("/");
          const dependencyName = `${scope}/${packageName}`;
          expect(
            packageNames.has(dependencyName),
            `${filePath} 引用了非 Community 包 ${modulePath}`,
          ).toBe(true);
        }
        if (modulePath?.startsWith(".")) {
          const target = path.resolve(path.dirname(filePath), modulePath);
          const relativeTarget = path.relative(packageRoot, target);
          expect(
            relativeTarget === "" ||
              (!relativeTarget.startsWith("..") &&
                !path.isAbsolute(relativeTarget)),
            `${filePath} 的相对导入越过包边界：${modulePath}`,
          ).toBe(true);
        }
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);
    }
  }
});
