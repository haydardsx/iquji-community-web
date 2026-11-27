import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { COMMUNITY_PACKAGES } from "./catalog";
import { getPreviewText } from "./i18n/catalog-text";
import { componentPreviews } from "./previews";

const build = resolve(import.meta.dir, "../doc_build");
const sitemap = readFileSync(resolve(build, "sitemap.xml"), "utf8");
for (const language of ["en", "zh"] as const) {
  const prefix = language === "en" ? "" : "zh/";
  const locale = language === "en" ? "en-US" : "zh-CN";
  for (const pkg of ["index", ...COMMUNITY_PACKAGES]) {
    const html = readFileSync(resolve(build, `${prefix}${pkg}.html`), "utf8");
    const url = `https://community-web.iquji.com/${prefix}${pkg === "index" ? "" : pkg}`;
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `站点地图缺少 ${url}`);
    const links = html.match(/<link\b[^>]+>/g) ?? [];
    assert.ok(
      links.some(
        (tag) =>
          tag.includes('rel="canonical"') && tag.includes(`href="${url}"`),
      ),
      `页面缺少规范地址 ${url}`,
    );
    for (const item of componentPreviews.filter(
      (entry) => (entry.packageId ?? "component") === pkg,
    )) {
      assert.ok(
        html.includes(
          getPreviewText(item, locale).name.replaceAll("&", "&amp;"),
        ),
        `${url} 缺少 ${item.id}`,
      );
      assert.ok(
        html.includes(`data-example="${item.id}"`),
        `${url} 缺少 ${item.id} 的示例卡片`,
      );
    }
    const sources =
      html.match(/<details class="guide-example__source">/g) ?? [];
    const expected = componentPreviews.filter(
      (entry) => (entry.packageId ?? "component") === pkg,
    ).length;
    assert.equal(sources.length, expected, `${url} 示例代码数量有误`);
    assert.equal(
      [
        ...html.matchAll(
          /<details class="guide-example__source">([\s\S]*?)<\/details>/g,
        ),
      ].filter(([, source]) => source?.includes("rp-codeblock language-tsx"))
        .length,
      expected,
      `${url} 缺少 TSX 代码块`,
    );
  }
}
