import { afterEach, expect, test } from "bun:test";
import { act, createRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiDrawer } from "./drawer.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";
import { IqujiDialog } from "./overlays.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 40));
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});
async function render(content: React.ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () =>
    root.render(
      <IqujiOverlayProvider>
        <button type="button" data-test-background="">
          背景操作
        </button>
        {content}
      </IqujiOverlayProvider>,
    ),
  );
  await act(tick);
  return host;
}
function surface() {
  const result = document.querySelector<HTMLElement>(
    "[data-iquji-overlay-surface][data-open]",
  );
  if (!result) throw new Error("测试缺少正式浮层表面");
  return result;
}

for (const invalid of ["null", "disabled"] as const) {
  test(`初始焦点ref为${invalid}时回退到可用Popup，mandatory仍约束Tab、Escape与遮罩`, async () => {
    const initial = createRef<HTMLInputElement>();
    let changed = 0;
    const host = await render(
      <IqujiDialog
        open
        mandatory
        initialFocusRef={initial}
        title="必需确认"
        onOpenChange={() => changed++}
      >
        <input disabled ref={invalid === "disabled" ? initial : undefined} />
      </IqujiDialog>,
    );
    const popup = surface();
    expect(document.activeElement === popup).toBe(true);
    expect(
      host
        .querySelector("[data-test-background]")
        ?.closest('[aria-hidden="true"]'),
    ).not.toBeNull();
    const tab = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    await act(async () => {
      popup.dispatchEvent(tab);
      popup.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      const backdrop = document.querySelector<HTMLElement>(
        ".iquji-dialog-backdrop",
      );
      if (!backdrop) throw new Error("测试缺少正式遮罩");
      backdrop.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, button: 0 }),
      );
      backdrop.dispatchEvent(
        new MouseEvent("mouseup", { bubbles: true, button: 0 }),
      );
      backdrop.click();
      await tick();
    });
    expect(tab.defaultPrevented).toBe(true);
    expect(changed).toBe(0);
    expect(document.activeElement === popup).toBe(true);
    expect(surface() === popup).toBe(true);
  });
}

test("抽屉的禁用初始ref仍选择真实可用入口并启用顶层焦点边界", async () => {
  const initial = createRef<HTMLInputElement>();
  const host = await render(
    <IqujiDrawer open title="内容" closeLabel="关闭" initialFocusRef={initial}>
      <input disabled ref={initial} />
    </IqujiDrawer>,
  );
  const close = surface().querySelector<HTMLButtonElement>(
    'button[aria-label="关闭"]',
  );
  expect(document.activeElement === close).toBe(true);
  expect(
    host
      .querySelector("[data-test-background]")
      ?.closest('[aria-hidden="true"]'),
  ).not.toBeNull();
});

test("程序化焦点进入底层内容也不能反向激活底层trap或处理顶层Escape", async () => {
  let parentChanges = 0,
    childChanges = 0;
  await render(
    <IqujiDrawer
      open
      title="父层"
      closeLabel="关闭父层"
      onOpenChange={() => parentChanges++}
    >
      <input aria-label="底层输入" />
      <IqujiDialog
        open
        title="子层"
        closeLabel="关闭子层"
        onOpenChange={() => childChanges++}
      />
    </IqujiDrawer>,
  );
  const input = document.querySelector<HTMLInputElement>(
    'input[aria-label="底层输入"]',
  );
  if (!input) throw new Error("测试缺少底层输入");
  await act(async () => {
    input.focus();
    await tick();
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await tick();
  });
  expect(parentChanges).toBe(0);
  expect(childChanges).toBe(1);
  expect(input.closest('[aria-hidden="true"]')).not.toBeNull();
  const child = document.querySelector<HTMLElement>(".iquji-dialog[data-open]");
  expect(child?.closest('[aria-hidden="true"]')).toBeNull();
});
