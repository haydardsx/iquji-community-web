import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { COMMUNITY_PACKAGES, type ComponentPreview } from "./catalog";
import { getPreviewText } from "./i18n/catalog-text";
import { componentPreviews } from "./previews";

const root = resolve(import.meta.dir, "../..");
const docs = resolve(root, "preview/.cache/docs");
rmSync(docs, { recursive: true, force: true });
mkdirSync(resolve(docs, "public"), { recursive: true });
copyFileSync(
  resolve(root, "preview/public/favicon.svg"),
  resolve(docs, "public/favicon.svg"),
);

copyFileSync(
  resolve(root, "component/LICENSE"),
  resolve(docs, "public/LICENSE-iquji-community-web-component.txt"),
);

for (const language of ["en", "zh"] as const) {
  const locale = language === "en" ? "en-US" : "zh-CN";
  const filename = language === "en" ? "README.md" : "README.zh-CN.md";
  const dir = resolve(docs, language);
  mkdirSync(dir);
  const navigation = [
    {
      type: "file",
      name: "index",
      label: language === "en" ? "Getting started" : "快速开始",
    },
  ];
  const index = [
    `---\ntitle: "${language === "en" ? "Getting started" : "快速开始"}"\n---`,
    "# Iquji Community Web",
    language === "en"
      ? "React components and TypeScript utilities for building forms, data tables, editors and application settings. Install each package independently from npm."
      : "使用 React 组件和 TypeScript 工具构建表单、数据表格、编辑器和应用设置。八个 npm 包均可独立安装。",
    "```sh\nnpm install @iquji-community/web-component @iquji-community/web-theme\n```",
    language === "en" ? "## Packages" : "## 组件包",
  ];

  function example(item: ComponentPreview) {
    const { name, description } = getPreviewText(item, locale);
    const symbol = getPreviewText(item, "en-US").name;
    const title = language === "zh" ? `${name} · ${symbol}` : name;
    return `## ${title}\n\n${description}\n\n<Example id="${item.id}" language="${language}" />`;
  }

  for (const pkg of COMMUNITY_PACKAGES) {
    const readme = readFileSync(resolve(root, pkg, filename), "utf8");
    const [, , , , ...body] = readme.trimEnd().split("\n");
    const description = body[0] ?? "";
    const title = `@iquji-community/web-${pkg}`;
    const examples = componentPreviews.filter(
      (item) => (item.packageId ?? "component") === pkg,
    );
    const content = [
      `---\ntitle: "${title}"\ndescription: ${JSON.stringify(description)}\n---`,
      'import Example from "../../../src/Example";',
      `# ${title}`,
      body.join("\n"),
      ...examples.map(example),
    ];
    writeFileSync(resolve(dir, `${pkg}.mdx`), content.join("\n\n"));
    index.push(`- [\`${title}\`](./${pkg}) — ${description}`);
    navigation.push({
      type: "file",
      name: pkg,
      label: title.replace("@iquji-community/", ""),
    });
  }
  writeFileSync(resolve(dir, "index.md"), index.join("\n\n"));
  writeFileSync(resolve(dir, "_meta.json"), JSON.stringify(navigation));
}
