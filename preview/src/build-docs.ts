import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { COMMUNITY_PACKAGES, type ComponentPreview } from "./catalog";
import { getExampleSources } from "./example-source";
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
  const sources = getExampleSources(language);
  const dir = resolve(docs, language);
  mkdirSync(dir);
  const navigation = [
    {
      type: "file",
      name: "index",
      label: language === "en" ? "Getting started" : "快速开始",
    },
  ];
  const packages = [];
  const catalog = componentPreviews.map((item) => ({
    id: item.id,
    category: item.category,
    packageId: item.packageId ?? "component",
    name: getPreviewText(item, locale).name,
  }));

  function example(item: ComponentPreview) {
    const { name, description } = getPreviewText(item, locale);
    const symbol = getPreviewText(item, "en-US").name;
    const title = language === "zh" ? `${name} · ${symbol}` : name;
    const source = sources.get(item.id);
    if (!source) throw new Error(`缺少示例源码 ${item.id}`);
    return [
      `<span id="example-${item.id}" />`,
      `## ${title}`,
      description,
      `<Example id="${item.id}" language="${language}">`,
      `\`\`\`\`tsx\n${source.trimEnd()}\n\`\`\`\``,
      "</Example>",
    ].join("\n\n");
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
    packages.push({ id: pkg, description });
    navigation.push({
      type: "file",
      name: pkg,
      label: title.replace("@iquji-community/", ""),
    });
  }
  const index = [
    "---\ntitle: Iquji Community Web\npageType: custom\n---",
    'import HomeShowcase from "../../../src/HomeShowcase";',
    `<HomeShowcase language="${language}" packages={${JSON.stringify(packages)}} examples={${JSON.stringify(catalog)}} />`,
  ];
  writeFileSync(resolve(dir, "index.mdx"), index.join("\n\n"));
  writeFileSync(resolve(dir, "_meta.json"), JSON.stringify(navigation));
}
