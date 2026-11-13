import { afterEach, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { IqujiDesktopRail } from "./desktop-rail.js";
import { IqujiDrawer } from "./drawer.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";
import { IqujiDialog } from "./overlays.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const device = (
  window as unknown as {
    happyDOM: { settings: { device: { prefersReducedMotion: string } } };
  }
).happyDOM.settings.device;
const originalMotion = device.prefersReducedMotion;
const styles: HTMLStyleElement[] = [];

afterEach(() => {
  for (const style of styles.splice(0)) style.remove();
  device.prefersReducedMotion = originalMotion;
  document.body.replaceChildren();
});

async function applyStyles(specifier: string) {
  const result = await Bun.build({
    entrypoints: [fileURLToPath(import.meta.resolve(specifier))],
    target: "browser",
  });
  if (!result.success || !result.outputs[0])
    throw new AggregateError(result.logs, "样式出口构建失败");
  const style = document.createElement("style");
  style.textContent = await result.outputs[0].text();
  document.head.append(style);
  styles.push(style);
}

test("组件样式出口不再隐式设置全局主题 token", async () => {
  await applyStyles("@iquji-cloud/web-component/styles.css");
  const computed = getComputedStyle(document.documentElement);
  expect(computed.getPropertyValue("--iquji-color-canvas")).toBe("");
  expect(computed.getPropertyValue("--iquji-motion-control")).toBe("");
});

test("主题与组件显式组合后，减少动态效果会停止真实DOM中的加载动画", async () => {
  device.prefersReducedMotion = "reduce";
  await applyStyles("@iquji-cloud/web-theme/tokens.css");
  await applyStyles("@iquji-cloud/web-component/styles.css");
  const spinner = document.createElement("span");
  spinner.className = "iquji-button__spinner";
  document.body.append(spinner);
  expect(getComputedStyle(spinner).animation).toBe("none");
});

test("图标栏分隔线可隐藏和恢复，保持宽度与导航行为", async () => {
  await applyStyles("@iquji-cloud/web-theme/tokens.css");
  await applyStyles("@iquji-cloud/web-component/styles.css");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  let selected = 0;
  const render = async (showDivider?: boolean) => {
    await act(async () => {
      root.render(
        createElement(IqujiDesktopRail, {
          items: [
            {
              icon: createElement("span", null, "D"),
              id: "documents",
              label: "文档",
              onSelect: () => selected++,
            },
          ],
          label: "导航",
          showDivider,
        }),
      );
    });
  };
  try {
    await render();
    const rail = host.querySelector("aside");
    if (!rail) throw new Error("缺少图标导航栏");
    const original = getComputedStyle(rail);
    const width = original.width;
    const dividerWidth = original.borderRightWidth;
    const dividerColor = original.borderRightColor;
    const isTransparent = (color: string) =>
      color === "transparent" ||
      /^#(?:[\da-f]{3}0|[\da-f]{6}00)$/i.test(color) ||
      /^(?:rgba|hsla|color)\([^)]*[,/]\s*0(?:\.0+)?%?\s*\)$/i.test(color);
    expect(original.borderRightStyle).toBe("solid");
    expect(isTransparent(dividerColor)).toBe(false);
    await render(false);
    const hidden = getComputedStyle(rail);
    expect(hidden.width).toBe(width);
    expect(hidden.borderRightWidth).toBe(dividerWidth);
    expect(isTransparent(hidden.borderRightColor)).toBe(true);
    const button = host.querySelector<HTMLButtonElement>(
      'button[aria-label="文档"]',
    );
    if (!button) throw new Error("缺少文档导航操作");
    await act(async () => button.click());
    expect(selected).toBe(1);
    expect(host.querySelector("nav")?.getAttribute("aria-label")).toBe("导航");
    await render(true);
    expect(getComputedStyle(rail).borderRightColor).toBe(dividerColor);
  } finally {
    await act(async () => root.unmount());
  }
});

for (const kind of ["抽屉", "对话框"] as const) {
  test(`${kind}保留挂载时，实际样式在退出完成后隐藏容器并在重开后恢复`, async () => {
    await applyStyles("@iquji-cloud/web-theme/tokens.css");
    await applyStyles("@iquji-cloud/web-component/styles.css");
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    let completed = 0;
    const render = async (open: boolean) => {
      await act(async () => {
        const props = {
          open,
          title: kind,
          closeLabel: "关闭",
          destroyOnClose: false,
          onCloseComplete: () => completed++,
          children: createElement("input", { defaultValue: "保留草稿" }),
        };
        root.render(
          createElement(
            IqujiOverlayProvider,
            null,
            kind === "抽屉"
              ? createElement(IqujiDrawer, props)
              : createElement(IqujiDialog, props),
          ),
        );
      });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });
    };
    try {
      await render(true);
      const popup = document.querySelector<HTMLElement>('[role="dialog"]');
      if (!popup) throw new Error("缺少已打开的正式浮层");
      const input = popup.querySelector("input");
      expect(getComputedStyle(popup).display).not.toBe("none");
      await render(false);
      expect(completed).toBe(1);
      expect(popup.isConnected).toBe(true);
      expect(popup.hidden).toBe(true);
      expect(getComputedStyle(popup).display).toBe("none");
      const backdrop = document.querySelector<HTMLElement>(
        ".iquji-overlay-backdrop",
      );
      if (!backdrop) throw new Error("缺少保留挂载的遮罩");
      expect(getComputedStyle(backdrop).display).toBe("none");
      await render(true);
      expect(popup.hidden).toBe(false);
      expect(getComputedStyle(popup).display).not.toBe("none");
      expect(popup.querySelector("input") === input).toBe(true);
      expect(input?.value).toBe("保留草稿");
      expect(completed).toBe(1);
    } finally {
      await act(async () => root.unmount());
    }
  });
}
