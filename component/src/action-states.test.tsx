import { afterEach, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IconButton, IqujiButton, IqujiButtonLink } from "./index.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
const styles: HTMLStyleElement[] = [];
const originalTheme = document.documentElement.dataset.theme;

afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  for (const style of styles.splice(0)) style.remove();
  document.body.replaceChildren();
  if (originalTheme === undefined)
    delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = originalTheme;
});

function mount() {
  const parent = document.createElement("div");
  const host = document.createElement("div");
  parent.append(host);
  document.body.append(parent);
  const root = createRoot(host);
  roots.push(root);
  return { host, root, parent };
}

async function applyStyles(specifier: string) {
  const result = await Bun.build({
    entrypoints: [fileURLToPath(import.meta.resolve(specifier))],
    target: "browser",
  });
  if (!result.success || !result.outputs[0])
    throw new AggregateError(result.logs, "操作样式出口构建失败");
  const style = document.createElement("style");
  style.textContent = await result.outputs[0].text();
  document.head.append(style);
  styles.push(style);
}

const channels = (color: string): number[] => {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const expanded =
      hex.length === 3 ? [...hex].map((value) => value + value).join("") : hex;
    const values = expanded
      .match(/.{2}/g)
      ?.map((value) => Number.parseInt(value, 16));
    if (!values || values.length !== 3)
      throw new Error(`无法识别颜色：${color}`);
    return values;
  }
  const values = color.match(/[\d.]+/g)?.map(Number);
  if (!values || values.length < 3) throw new Error(`无法识别颜色：${color}`);
  return values.slice(0, 3);
};
const luminance = (color: string) => {
  const [red = 0, green = 0, blue = 0] = channels(color).map((value) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
};

test.each([
  { disabled: true },
  { loading: true },
  { "aria-disabled": true as const },
  { "aria-disabled": "true" as const },
])("链接按钮在禁用或加载状态拒绝激活，并可恢复正式链接：%j", async (state) => {
  const { host, root, parent } = mount();
  let activated = 0;
  let parentActivated = 0;
  parent.addEventListener("click", () => parentActivated++);
  const render = async (blocked: boolean) => {
    await act(async () => {
      root.render(
        <IqujiButtonLink
          {...(blocked ? state : {})}
          href="#next"
          onClick={() => activated++}
          tabIndex={0}
        >
          继续
        </IqujiButtonLink>,
      );
    });
  };
  await render(true);
  const link = host.querySelector("a");
  if (!link) throw new Error("正式链接按钮未渲染");
  expect(link.getAttribute("aria-disabled")).toBe("true");
  expect(link.getAttribute("role")).toBe("link");
  expect(link.hasAttribute("href")).toBe(false);
  expect(link.tabIndex).toBe(-1);
  const event = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => {
    link.dispatchEvent(event);
  });
  expect(event.defaultPrevented).toBe(true);
  expect(activated).toBe(0);
  expect(parentActivated).toBe(0);
  await render(false);
  expect(link.hasAttribute("aria-disabled")).toBe(false);
  expect(link.hasAttribute("role")).toBe(false);
  expect(link.getAttribute("href")).toBe("#next");
  expect(link.tabIndex).toBe(0);
  await act(async () => link.click());
  expect(activated).toBe(1);
  expect(parentActivated).toBe(1);
});

for (const theme of ["light", "dark"]) {
  test(`${theme} 主题的填充操作保持白色前景和可读对比度，禁用时使用灰色`, async () => {
    document.documentElement.dataset.theme = theme;
    await applyStyles("@iquji-cloud/web-theme/tokens.css");
    await applyStyles("@iquji-cloud/web-component/styles.css");
    const { host, root } = mount();
    host.style.color = "gray";
    await act(async () => {
      root.render(
        (["primary", "danger"] as const).map((variant) => (
          <section key={variant}>
            <IqujiButton variant={variant}>执行</IqujiButton>
            <IconButton
              icon={<span>×</span>}
              label="执行图标"
              variant={variant}
            />
            <IqujiButtonLink href="#next" variant={variant}>
              继续
            </IqujiButtonLink>
            <IqujiButton disabled variant={variant}>
              禁用
            </IqujiButton>
            <IconButton
              disabled
              icon={<span>×</span>}
              label="禁用图标"
              variant={variant}
            />
            <IqujiButtonLink disabled href="#next" variant={variant}>
              禁用链接
            </IqujiButtonLink>
          </section>
        )),
      );
    });
    for (const control of host.querySelectorAll<HTMLElement>("button,a")) {
      const style = getComputedStyle(control);
      if (control.matches(":disabled,[aria-disabled=true]")) {
        for (const color of [style.backgroundColor, style.color]) {
          const values = channels(color);
          expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(
            20,
          );
        }
        expect(
          Math.min(...channels(style.backgroundColor)),
        ).toBeGreaterThanOrEqual(200);
        expect(style.opacity).toBe("1");
      } else {
        expect(channels(style.color)).toEqual([255, 255, 255]);
        const background = luminance(style.backgroundColor);
        expect(1.05 / (background + 0.05)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}
