import { createRequire } from "node:module";
import { defineConfig } from "@rspress/core";

const origin = "https://community-web.iquji.com";
const require = createRequire(import.meta.url);

export default defineConfig({
  root: ".cache/docs",
  title: "Iquji Community Web",
  logoText: "Iquji Community Web",
  lang: "en",
  route: { localeRedirect: "never" },
  icon: "/favicon.svg",
  siteOrigin: origin,
  sitemap: { siteUrl: origin },
  builderConfig: {
    resolve: {
      // Rspress 的本地搜索只使用 Document。使用浏览器入口，避免编入 Node worker 的本机文件地址。
      alias: { flexsearch$: require.resolve("flexsearch") },
    },
  },
  locales: [
    {
      lang: "en",
      label: "English",
      description:
        "Install and use Iquji React components, editors, themes, icons and TypeScript utilities.",
    },
    {
      lang: "zh",
      label: "简体中文",
      description:
        "安装和使用 Iquji React 组件、编辑器、主题、图标和 TypeScript 工具。",
    },
  ],
  head: [
    ({ routePath }) => [
      "link",
      { rel: "canonical", href: new URL(routePath, origin).href },
    ],
  ],
  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/haydardsx/iquji-community-web",
      },
    ],
  },
  llms: false,
  webMcp: false,
});
