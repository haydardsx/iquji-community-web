import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiColorPicker, normalizeIqujiColor } from "./color-picker.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 30));
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

test("颜色组件限定六位十六进制值并规范大小写，禁止 CSS 表达式", () => {
  expect(normalizeIqujiColor(" #Aa00FF ")).toBe("#aa00ff");
  for (const value of ["red", "#fff", "#12345678", "var(--a)", "url(x)"])
    expect(normalizeIqujiColor(value)).toBeNull();
  const markup = renderToStaticMarkup(
    <IqujiColorPicker
      value={null}
      onChange={() => undefined}
      presets={[{ value: "#123456", label: "蓝色" }]}
      label="文字色"
      defaultLabel="默认"
      customLabel="自定义"
      hexLabel="色值"
      applyLabel="应用"
      cancelLabel="取消"
      disabled
    />,
  );
  expect(markup).toContain('aria-label="文字色"');
  expect(markup).toContain("disabled");
});

test("颜色浮层限制视口宽度并保留碰撞定位", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => {
    root.render(
      <IqujiOverlayProvider>
        <IqujiColorPicker
          value="#123456"
          onChange={() => undefined}
          presets={[
            { value: "#123456", label: "蓝色" },
            { value: "#654321", label: "绿色" },
          ]}
          label="文字色"
          defaultLabel="默认"
          customLabel="自定义"
          hexLabel="色值"
          applyLabel="应用"
          cancelLabel="取消"
        />
      </IqujiOverlayProvider>,
    );
    await tick();
  });
  const trigger = document.querySelector<HTMLButtonElement>('button[aria-label="文字色"]');
  if (!trigger) throw new Error("颜色入口未渲染");
  await act(async () => {
    trigger.click();
    await tick();
  });
  const popup = document.querySelector<HTMLElement>(".iquji-popover-popup[data-open]");
  const positioner = document.querySelector<HTMLElement>(".iquji-floating-positioner[data-side]");
  expect(popup?.style.maxWidth).toBe("calc(100vw - 32px)");
  expect(positioner).not.toBeNull();
  expect(positioner?.dataset.side).toBeTruthy();
});
