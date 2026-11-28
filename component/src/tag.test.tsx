import { afterEach, expect, test } from "bun:test";
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiTag } from "./tag.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

afterEach(() => {
  document.body.replaceChildren();
});

test("静态标签渲染 span 并保留语义色调与尺寸属性", () => {
  const html = renderToStaticMarkup(
    <IqujiTag size="md" tone="info" variant="outline">
      只读模式
    </IqujiTag>,
  );

  expect(html).toMatch(/^<span\b/u);
  expect(html).toContain('data-tone="info"');
  expect(html).toContain('data-variant="outline"');
  expect(html).toContain('data-size="md"');
  expect(html).toContain("只读模式");
});

test("可选中标签渲染原生 button 并支持点击切换、禁用保护与 ref 透传", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const changes: boolean[] = [];
  const triggerRef = createRef<HTMLElement>();

  await act(async () => {
    root.render(
      <IqujiTag
        onSelectedChange={(next) => changes.push(next)}
        ref={triggerRef}
        selected={false}
      >
        CLI 压缩
      </IqujiTag>,
    );
  });

  const button = host.querySelector("button");
  expect(button).not.toBeNull();
  expect(triggerRef.current).toBe(button);
  expect(button?.getAttribute("type")).toBe("button");
  expect(button?.getAttribute("aria-pressed")).toBe("false");

  await act(async () => {
    button?.click();
  });
  expect(changes).toEqual([true]);

  await act(async () => {
    root.render(
      <IqujiTag
        disabled
        onSelectedChange={(next) => changes.push(next)}
        selected
      >
        Studio 压缩
      </IqujiTag>,
    );
  });

  const disabledButton = host.querySelector("button");
  expect(disabledButton?.disabled).toBe(true);
  expect(disabledButton?.getAttribute("aria-pressed")).toBe("true");
  expect(disabledButton?.dataset.selected).toBe("true");
  await act(async () => {
    disabledButton?.click();
  });
  expect(changes).toEqual([true]);
});

test("仅启用 interactive 触发器模式时渲染 button 且不附加多余 aria-pressed", () => {
  const html = renderToStaticMarkup(
    <IqujiTag interactive tone="neutral">
      选择方式
    </IqujiTag>,
  );

  expect(html).toMatch(/^<button\b/u);
  expect(html).toContain("iquji-tag--interactive");
  expect(html).not.toContain("aria-pressed");
});
