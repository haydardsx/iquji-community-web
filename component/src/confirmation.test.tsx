import { afterEach, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";
import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiConfirmDialog } from "./confirmation.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";
import { IqujiDialog } from "./overlays.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
const styles: HTMLStyleElement[] = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 40));
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
  for (const style of styles.splice(0)) style.remove();
  document.body.style.overflow = "";
});
async function render(content: React.ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => {
    root.render(<IqujiOverlayProvider>{content}</IqujiOverlayProvider>);
    await tick();
  });
}
function button(label: string) {
  const result = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button"),
  ).find((element) => element.textContent === label);
  if (!result) throw new Error(`缺少操作 ${label}`);
  return result;
}
async function click(target: HTMLElement) {
  await act(async () => {
    target.focus();
    target.click();
    await tick();
  });
}
function popup() {
  const result = document.querySelector<HTMLElement>(
    '[role="dialog"][data-open]',
  );
  if (!result) throw new Error("缺少打开的确认框");
  return result;
}

test("确认框默认聚焦取消，Escape 恢复入口且不执行危险操作", async () => {
  let confirmed = 0;
  function Example() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          离开
        </button>
        <IqujiConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="放弃未保存的修改？"
          description="当前草稿尚未保存。"
          closeLabel="关闭确认"
          cancelLabel="继续编辑"
          confirmLabel="放弃修改"
          onConfirm={() => confirmed++}
        />
      </>
    );
  }
  await render(<Example />);
  const trigger = button("离开");
  await click(trigger);
  expect(document.activeElement).toBe(button("继续编辑"));
  expect(
    document.getElementById(popup().getAttribute("aria-labelledby") ?? "")
      ?.textContent,
  ).toBe("放弃未保存的修改？");
  await act(async () => {
    button("继续编辑").dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    );
    await tick();
  });
  expect(document.querySelector('[role="dialog"][data-open]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(confirmed).toBe(0);
  await click(trigger);
  await click(button("放弃修改"));
  expect(confirmed).toBe(1);
  expect(popup()).not.toBeNull();
});

test("确认框仍尊重调用方显式尺寸，普通表单保留自身输入焦点", async () => {
  function Form() {
    const field = useRef<HTMLInputElement>(null);
    return (
      <IqujiDialog
        open
        title="表单"
        closeLabel="关闭"
        width={690}
        initialFocusRef={field}
      >
        <input aria-label="名称" ref={field} />
      </IqujiDialog>
    );
  }
  await render(<Form />);
  expect(popup().style.width).toBe("690px");
  expect(document.activeElement?.getAttribute("aria-label")).toBe("名称");
});

test("确认框允许业务覆盖默认尺寸", async () => {
  await render(
    <IqujiConfirmDialog
      open
      title="业务确认"
      closeLabel="关闭"
      cancelLabel="返回"
      confirmLabel="执行"
      onConfirm={() => {}}
      width={390}
    />,
  );
  expect(popup().style.width).toBe("390px");
  expect(document.activeElement).toBe(button("返回"));
});

test("仅确认被禁用时仍可取消并保留附加保存动作，等待语义不混用", async () => {
  let submitted = 0;
  let retried = 0;
  function Example() {
    const [open, setOpen] = useState(true);
    return (
      <IqujiConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="保存结果待核对"
        closeLabel="关闭"
        cancelLabel="继续编辑"
        confirmLabel="直接离开"
        confirmDisabled
        additionalActions={
          <button type="button" onClick={() => retried++}>
            重试保存
          </button>
        }
        onConfirm={() => submitted++}
      />
    );
  }
  await render(<Example />);
  expect(document.activeElement).toBe(button("继续编辑"));
  expect(button("直接离开").disabled).toBe(true);
  expect(button("继续编辑").disabled).toBe(false);
  await click(button("直接离开"));
  expect(submitted).toBe(0);
  await click(button("重试保存"));
  expect(retried).toBe(1);
  await click(button("继续编辑"));
  expect(document.querySelector('[role="dialog"][data-open]')).toBeNull();
});

test("正式确认样式隐藏空正文，取消与危险操作按满宽纵向排列", async () => {
  for (const path of [
    "@iquji-cloud/web-theme/tokens.css",
    "@iquji-cloud/web-component/styles.css",
  ]) {
    const result = await Bun.build({
      entrypoints: [fileURLToPath(import.meta.resolve(path))],
      target: "browser",
    });
    if (!result.success || !result.outputs[0])
      throw new AggregateError(result.logs, "确认样式构建失败");
    const style = document.createElement("style");
    style.textContent = await result.outputs[0].text();
    document.head.append(style);
    styles.push(style);
  }
  await render(
    <IqujiConfirmDialog
      open
      title="放弃未保存的修改？"
      description="未保存的输入将被丢弃。"
      closeLabel="关闭"
      cancelLabel="继续编辑"
      confirmLabel="放弃修改"
      onConfirm={() => {}}
    />,
  );
  const content = popup().querySelector<HTMLElement>(".iquji-dialog__body");
  const actions = popup().querySelector<HTMLElement>("footer");
  if (!content || !actions) throw new Error("缺少确认布局");
  expect(getComputedStyle(content).display).toBe("none");
  expect(getComputedStyle(actions).flexDirection).toBe("column");
  expect(actions.firstElementChild).toBe(button("继续编辑"));
  expect(actions.lastElementChild).toBe(button("放弃修改"));
  expect(getComputedStyle(button("继续编辑")).width).toBe("100%");
  expect(getComputedStyle(button("放弃修改")).width).toBe("100%");
  expect(document.activeElement).toBe(button("继续编辑"));
});
