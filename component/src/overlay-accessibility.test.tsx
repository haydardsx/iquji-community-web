import { afterEach, expect, test } from "bun:test";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiDrawer } from "./drawer.js";
import { IqujiSelect } from "./forms.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";
import { IqujiDialog } from "./overlays.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 40));
afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  document.body.replaceChildren();
  document.body.style.overflow = "";
});
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("测试缺少浮层控件");
  return value;
}
async function click(element: HTMLElement) {
  await act(async () => {
    element.focus();
    element.click();
    await tick();
  });
}
function button(label: string) {
  return required(
    Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (element) =>
        element.textContent === label ||
        element.getAttribute("aria-label") === label,
    ),
  );
}
async function escape() {
  await act(async () => {
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await tick();
  });
}

test.each([
  "dialog",
  "drawer",
] as const)("%s 子菜单在首次打开和重开时均可被辅助技术读取", async (kind) => {
  const Surface = kind === "drawer" ? IqujiDrawer : IqujiDialog;
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          打开
        </button>
        <Surface
          open={open}
          onOpenChange={setOpen}
          title="表单"
          closeLabel="关闭"
        >
          <IqujiSelect
            aria-label="选择"
            options={[
              { value: "one", label: "选项一" },
              { value: "two", label: "选项二" },
            ]}
          />
        </Surface>
      </>
    );
  }
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root?.render(
      <IqujiOverlayProvider>
        <Example />
      </IqujiOverlayProvider>,
    );
    await tick();
  });
  for (let pass = 0; pass < 2; pass++) {
    await click(button("打开"));
    const select = required(
      document.querySelector<HTMLElement>('[role="combobox"]'),
    );
    await click(select);
    const option = required(
      document.querySelector<HTMLElement>('[role="option"]'),
    );
    expect(option.closest('[aria-hidden="true"], [inert]')).toBeNull();
    expect(button("打开").closest('[aria-hidden="true"]')).not.toBeNull();
    await escape();
    expect(
      document.querySelector('[data-iquji-overlay="select"][data-open]'),
    ).toBeNull();
    expect(document.activeElement).toBe(select);
    expect(document.querySelector('[role="dialog"][data-open]')).not.toBeNull();
    await escape();
    expect(document.activeElement).toBe(button("打开"));
  }
});

test("抽屉内次级对话框的子菜单归属顶层且关闭后恢复父层", async () => {
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <IqujiDrawer open title="主表单" closeLabel="关闭主表单">
        <button type="button" onClick={() => setOpen(true)}>
          补充资料
        </button>
        <IqujiDialog
          open={open}
          onOpenChange={setOpen}
          title="补充资料"
          closeLabel="关闭资料"
        >
          <IqujiSelect
            aria-label="资料类型"
            options={[{ value: "one", label: "文本" }]}
          />
        </IqujiDialog>
      </IqujiDrawer>
    );
  }
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => {
    root?.render(
      <IqujiOverlayProvider>
        <Example />
      </IqujiOverlayProvider>,
    );
    await tick();
  });
  await click(button("补充资料"));
  await click(
    required(document.querySelector<HTMLElement>('[role="combobox"]')),
  );
  expect(
    required(document.querySelector('[role="option"]')).closest(
      '[aria-hidden="true"], [inert]',
    ),
  ).toBeNull();
  await escape();
  await escape();
  expect(document.activeElement).toBe(button("补充资料"));
  expect(
    button("补充资料").closest('[aria-hidden="true"], [inert]'),
  ).toBeNull();
});
