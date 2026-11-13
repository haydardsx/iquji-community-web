import { expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

test("正式出口可被生产版 React 渲染，不依赖开发 JSX runtime", () => {
  const result = Bun.spawnSync(
    [
      process.execPath,
      "--eval",
      `
        import assert from "node:assert/strict";
        import { createElement } from "react";
        import { renderToStaticMarkup } from "react-dom/server";
        import { IqujiButton, IqujiDesktopTabStrip, IqujiDesktopTitleBar, IqujiField, IqujiInput, IqujiSettingsContent, IqujiSettingsLayout, IqujiSettingsSection, IqujiSettingsSwitchRow, IqujiWorkbenchLayout } from "@iquji-cloud/web-component";
        import { IqujiIcon } from "@iquji-cloud/web-icons";
        const markup = renderToStaticMarkup(createElement("form", null,
          createElement(IqujiField, { label: "名称", required: true },
            createElement(IqujiInput, { id: "production-name" })),
          createElement(IqujiButton, { type: "submit" },
            createElement(IqujiIcon, { decorative: true, name: "check" }), "保存")));
        assert.match(markup, /for="production-name"/u);
        assert.match(markup, /type="submit"/u);
        assert.match(markup, /保存/u);
        const titlebar = renderToStaticMarkup(createElement(IqujiDesktopTitleBar,
          { "data-tauri-drag-region": "", dragRegion: true },
          createElement(IqujiDesktopTabStrip, {
            activeTabId: "a", label: "Tabs", tabs: [{ id: "a", label: "A" }],
          })));
        assert.match(titlebar, /role="tablist"/u);
        assert.match(titlebar, /data-tauri-drag-region/u);
        const workbench = renderToStaticMarkup(createElement(IqujiWorkbenchLayout,
          { center: createElement("span", null, "center"), left: createElement("span", null, "left") }));
        assert.match(workbench, /role="separator"/u);
        const settings = renderToStaticMarkup(createElement(IqujiSettingsLayout,
          { navigation: createElement("nav", null, "navigation") },
          createElement(IqujiSettingsContent, { title: "General" },
            createElement(IqujiSettingsSection, { title: "Section" },
              createElement(IqujiSettingsSwitchRow, { label: "Toggle" })))));
        assert.match(settings, /role="switch"/u);
      `,
    ],
    {
      cwd: fileURLToPath(new URL("..", import.meta.url)),
      env: { ...process.env, NODE_ENV: "production" },
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  expect(result.stderr.toString()).toBe("");
  expect(result.exitCode).toBe(0);
});
