import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

type Language = "en" | "zh";

const previewTextModule = "../i18n/use-preview-text";
const localePackage = "@iquji-community/web-i18n";
const themePackage = "@iquji-community/web-theme";
const componentPackage = "@iquji-community/web-component";
const editorPackage = "@iquji-community/web-editor";
const terminalPackage = "@iquji-community/web-terminal";

function exampleEntries(file: ts.SourceFile) {
  const entries: { id: string; component: ts.Identifier }[] = [];
  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        !declaration.name.text.endsWith("Previews") ||
        !declaration.initializer ||
        !ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        continue;
      }
      for (const item of declaration.initializer.elements) {
        if (!ts.isObjectLiteralExpression(item)) continue;
        const properties = item.properties.filter(ts.isPropertyAssignment);
        const id = properties.find(
          (property) => property.name.getText() === "id",
        )?.initializer;
        const render = properties.find(
          (property) => property.name.getText() === "render",
        )?.initializer;
        if (!id || !ts.isStringLiteral(id)) continue;
        if (
          !render ||
          !ts.isArrowFunction(render) ||
          !ts.isJsxSelfClosingElement(render.body) ||
          !ts.isIdentifier(render.body.tagName)
        ) {
          throw new Error(`无法提取 ${id.text} 对应的 TSX 用法`);
        }
        entries.push({ id: id.text, component: render.body.tagName });
      }
    }
  }
  return entries;
}

function collectDependencies(
  component: ts.Identifier,
  file: ts.SourceFile,
  checker: ts.TypeChecker,
) {
  const statements = new Set<ts.Statement>();
  const imports = new Set<ts.Declaration>();

  function visit(node: ts.Node) {
    if (ts.isIdentifier(node)) {
      const declaration = checker.getSymbolAtLocation(node)?.declarations?.[0];
      if (declaration?.getSourceFile() === file) {
        if (
          ts.isImportSpecifier(declaration) ||
          ts.isImportClause(declaration) ||
          ts.isNamespaceImport(declaration)
        ) {
          imports.add(declaration);
        } else {
          const statement = ts.isVariableDeclaration(declaration)
            ? declaration.parent.parent
            : declaration;
          if (
            statement.parent === file &&
            ts.isStatement(statement) &&
            !statements.has(statement)
          ) {
            statements.add(statement);
            ts.forEachChild(statement, visit);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(component);
  if (statements.size === 0) {
    throw new Error(`找不到 ${component.text} 的示例定义`);
  }
  return { statements, imports };
}

function selectImports(
  file: ts.SourceFile,
  selected: ReadonlySet<ts.Declaration>,
) {
  const imports = new Map<string, string>();
  for (const node of file.statements) {
    if (
      !ts.isImportDeclaration(node) ||
      !ts.isStringLiteral(node.moduleSpecifier)
    ) {
      continue;
    }
    const clause = node.importClause;
    if (!clause) continue;
    const module = node.moduleSpecifier.text;
    if (module === previewTextModule) continue;
    const bindings = clause.namedBindings;
    const names =
      bindings && ts.isNamedImports(bindings)
        ? bindings.elements
            .filter((element) => selected.has(element))
            .map((element) => element.getText())
        : [];
    const defaultName =
      clause.name && selected.has(clause) ? clause.name.text : "";
    const namespace =
      bindings && ts.isNamespaceImport(bindings) && selected.has(bindings)
        ? bindings.getText()
        : "";
    const list = names.length > 0 ? `{ ${names.join(", ")} }` : namespace;
    const specifiers = [defaultName, list].filter(Boolean).join(", ");
    if (specifiers) {
      const prefix = clause.isTypeOnly ? "import type" : "import";
      imports.set(module, `${prefix} ${specifiers} from "${module}";`);
    }
  }
  return imports;
}

type SourceEdit = { start: number; end: number; text: string };

function localizedStatements(
  statements: readonly ts.Statement[],
  checker: ts.TypeChecker,
  language: Language,
  preserveLanguageSwitch: boolean,
) {
  const edits: SourceEdit[] = [];
  const textDeclarations: ts.VariableDeclaration[] = [];
  let needsTextHelper = preserveLanguageSwitch;

  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === "usePreviewText"
    ) {
      textDeclarations.push(node);
    }
    if (ts.isIdentifier(node)) {
      const declaration = checker.getSymbolAtLocation(node)?.declarations?.[0];
      if (
        declaration &&
        ts.isVariableDeclaration(declaration) &&
        textDeclarations.includes(declaration) &&
        node !== declaration.name
      ) {
        const parent = node.parent;
        const value =
          ts.isCallExpression(parent) && parent.expression === node
            ? parent.arguments[language === "zh" ? 0 : 1]
            : undefined;
        if (
          value &&
          (ts.isStringLiteral(value) || ts.isTemplateLiteral(value))
        ) {
          edits.push({
            start: parent.getStart(),
            end: parent.end,
            text: value.getText(),
          });
        } else {
          needsTextHelper = true;
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  for (const statement of statements) visit(statement);

  if (!needsTextHelper) {
    for (const declaration of textDeclarations) {
      const variable = declaration.parent.parent;
      const file = declaration.getSourceFile();
      const { line } = file.getLineAndCharacterOfPosition(variable.getStart());
      const lineStart = file.getPositionOfLineAndCharacter(line, 0);
      const endOfLine = file.text.indexOf("\n", variable.end);
      edits.push({ start: lineStart, end: endOfLine + 1, text: "" });
    }
  }

  return {
    needsTextHelper,
    code: statements.map((statement) => {
      const start = statement.getStart();
      let code = statement.getText();
      if (!needsTextHelper) {
        for (const edit of edits
          .filter((edit) => edit.start >= start && edit.end <= statement.end)
          .sort((left, right) => right.start - left.start)) {
          code =
            code.slice(0, edit.start - start) +
            edit.text +
            code.slice(edit.end - start);
        }
      }
      return code;
    }),
  };
}

function exampleSource(
  id: string,
  component: ts.Identifier,
  file: ts.SourceFile,
  checker: ts.TypeChecker,
  language: Language,
) {
  const selected = collectDependencies(component, file, checker);
  const imports = selectImports(file, selected.imports);
  const statements = file.statements.filter((node) =>
    selected.statements.has(node),
  );
  const { code, needsTextHelper } = localizedStatements(
    statements,
    checker,
    language,
    id === "i18n-provider",
  );
  const helpers: string[] = [];
  if (needsTextHelper) {
    const parameters =
      id === "i18n-provider"
        ? "chinese: string, english: string"
        : language === "en"
          ? "_chinese: string, english: string"
          : "chinese: string, _english: string";
    const translatedText =
      id === "i18n-provider"
        ? 'locale === "zh-CN" ? chinese : english'
        : language === "en"
          ? "english"
          : "chinese";
    const locale =
      id === "i18n-provider" ? "  const { locale } = useIqujiLocale();\n" : "";
    helpers.push(`function usePreviewText() {
${locale}  return (${parameters}) => ${translatedText};
}`);
  }

  let body = `<${component.text} />`;
  const extraImports: string[] = [];
  if (imports.get(localePackage)?.includes("useIqujiLocale")) {
    extraImports.push(
      `import { IqujiLocaleProvider } from "${localePackage}";`,
    );
    const locale = language === "en" ? "en-US" : "zh-CN";
    body = `<IqujiLocaleProvider
  catalogs={{ "en-US": {}, "zh-CN": {} }}
  defaultLocale="${locale}"
>
  ${body}
</IqujiLocaleProvider>`;
  }
  if (imports.get(themePackage)?.includes("useIqujiTheme")) {
    extraImports.push(`import { IqujiThemeProvider } from "${themePackage}";`);
    body = `<IqujiThemeProvider>\n  ${body}\n</IqujiThemeProvider>`;
  }

  const styles = [`import "${themePackage}/tokens.css";`];
  if (imports.has(componentPackage)) {
    styles.push(`import "${componentPackage}/styles.css";`);
  }
  if (imports.has(editorPackage)) {
    styles.push(`import "${editorPackage}/styles.css";`);
  }
  if (imports.has(terminalPackage)) {
    styles.push(`import "${terminalPackage}/styles.css";`);
  }
  const entryIndex = statements.findIndex(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === component.text,
  );
  if (entryIndex !== -1 && extraImports.length === 0) {
    code[entryIndex] = `export default ${code[entryIndex]}`;
  } else {
    code.push(`export default function Example() {
  return (
${body
  .split("\n")
  .map((line) => `    ${line}`)
  .join("\n")}
  );
}`);
  }
  return [
    [...styles, ...imports.values(), ...extraImports].join("\n"),
    ...helpers,
    ...code,
  ].join("\n\n");
}

export function getExampleSources(
  language: Language,
): ReadonlyMap<string, string> {
  const directory = resolve(import.meta.dir, "previews");
  const files = readdirSync(directory)
    .filter((name) => name.endsWith(".tsx") && !name.endsWith(".test.tsx"))
    .map((name) => resolve(directory, name));
  // 示例只引用本文件的定义和公开包，按符号追踪即可保留需要的导入及辅助定义。
  const program = ts.createProgram(files, {
    noResolve: true,
    noLib: true,
    jsx: ts.JsxEmit.Preserve,
  });
  const checker = program.getTypeChecker();
  const examples = new Map<string, string>();
  for (const file of program.getSourceFiles()) {
    for (const { id, component } of exampleEntries(file)) {
      if (examples.has(id)) throw new Error(`示例标识重复：${id}`);
      examples.set(id, exampleSource(id, component, file, checker, language));
    }
  }
  return examples;
}
