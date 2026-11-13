import { afterEach, expect, test } from "bun:test";
import { act, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiConfirmDialog } from "./confirmation.js";
import { IqujiDrawer } from "./drawer.js";
import { IqujiDropdownMenu } from "./floating.js";
import { IqujiSelect } from "./forms.js";
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
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("测试中缺少实际浮层元素");
  return value;
}
function button(label: string) {
  return required(
    Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (value) =>
        value.textContent === label ||
        value.getAttribute("aria-label") === label,
    ),
  );
}
async function click(element: HTMLElement) {
  await act(async () => {
    element.focus();
    element.click();
    await tick();
  });
}
async function pressEscape() {
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
const popup = () =>
  required(document.querySelector<HTMLElement>('[role="dialog"][data-open]'));

function SelectDialog() {
  const [open, setOpen] = useState(false);
  const focus = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        打开
      </button>
      <IqujiDialog
        title="信息"
        closeLabel="关闭"
        open={open}
        onOpenChange={setOpen}
        initialFocusRef={focus}
      >
        <input aria-label="名称" ref={focus} />
        <IqujiSelect
          aria-label="选择"
          options={[{ value: "one", label: "一" }]}
        />
      </IqujiDialog>
    </>
  );
}

test("对话框按正式 ref 聚焦，Select 的 Escape 只关闭当前层，退出回到真实入口", async () => {
  await render(<SelectDialog />);
  const trigger = button("打开");
  await click(trigger);
  expect(document.activeElement === document.querySelector("input")).toBe(true);
  expect(document.body.style.overflow).toBe("hidden");
  const select = required(
    document.querySelector<HTMLElement>('[role="combobox"]'),
  );
  await click(select);
  expect(
    document.querySelector('[data-iquji-overlay="select"][data-open]'),
  ).not.toBeNull();
  await pressEscape();
  expect(popup()).not.toBeNull();
  expect(
    document.querySelector('[data-iquji-overlay="select"][data-open]'),
  ).toBeNull();
  expect(document.activeElement === select).toBe(true);
  await pressEscape();
  expect(document.querySelector('[role="dialog"][data-open]')).toBeNull();
  expect(document.activeElement === trigger).toBe(true);
  expect(document.body.style.overflow).toBe("");
});

test("抽屉内对话框独立进入 body Portal，Escape 依次关闭且最后恢复原滚动状态", async () => {
  document.body.style.overflow = "clip";
  function Nested() {
    const [drawer, setDrawer] = useState(true),
      [dialog, setDialog] = useState(false);
    return (
      <IqujiDrawer
        title="编辑"
        closeLabel="关闭抽屉"
        open={drawer}
        onOpenChange={setDrawer}
      >
        <button type="button" onClick={() => setDialog(true)}>
          确认
        </button>
        <IqujiDialog
          title="确认信息"
          closeLabel="关闭确认"
          open={dialog}
          onOpenChange={setDialog}
        >
          <input aria-label="确认内容" />
        </IqujiDialog>
      </IqujiDrawer>
    );
  }
  await render(<Nested />);
  const drawer = popup();
  await click(button("确认"));
  const dialogs = Array.from(
    document.querySelectorAll<HTMLElement>('[role="dialog"][data-open]'),
  );
  const dialog = required(dialogs.find((value) => value !== drawer));
  expect(drawer.contains(dialog)).toBe(false);
  expect(dialog.closest('[aria-hidden="true"]')).toBeNull();
  await pressEscape();
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    1,
  );
  expect(document.activeElement === button("确认")).toBe(true);
  expect(document.body.style.overflow).toBe("hidden");
  await pressEscape();
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    0,
  );
  expect(document.body.style.overflow).toBe("clip");
});

test("受控草稿拒绝关闭时保留内容且不通知完成，实际关闭只通知一次", async () => {
  let completed = 0,
    requested = 0;
  function Guarded() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <button type="button" onClick={() => setOpen(false)}>
          放弃
        </button>
        <IqujiDialog
          title="草稿"
          closeLabel="请求关闭"
          open={open}
          onOpenChange={() => requested++}
          onCloseComplete={() => completed++}
        >
          <input defaultValue="未保存" />
        </IqujiDialog>
      </>
    );
  }
  await render(<Guarded />);
  const input = document.querySelector("input");
  await click(button("请求关闭"));
  expect(requested).toBe(1);
  expect(completed).toBe(0);
  expect(input?.isConnected).toBe(true);
  await click(button("放弃"));
  expect(completed).toBe(1);
  expect(input?.isConnected).toBe(false);
  await act(tick);
  expect(completed).toBe(1);
});

test.each([
  false,
  true,
])("子层退出后恢复真实入口，父层在子层期间隐藏=%s", async (replaceParent) => {
  let completed = 0;
  function Parent() {
    const [open, setOpen] = useState(false);
    const opener = useRef<HTMLButtonElement>(null);
    return (
      <IqujiDrawer
        title="详情"
        closeLabel="关闭详情"
        open={!replaceParent || !open}
      >
        <button ref={opener} type="button" onClick={() => setOpen(true)}>
          安排
        </button>
        <IqujiDrawer
          title="安排内容"
          closeLabel="完成安排"
          open={open}
          onOpenChange={setOpen}
          onCloseComplete={() => {
            completed++;
            if (!replaceParent) opener.current?.focus();
          }}
        >
          <input />
        </IqujiDrawer>
      </IqujiDrawer>
    );
  }
  await render(<Parent />);
  const opener = button("安排");
  await click(opener);
  await click(button("完成安排"));
  expect(completed).toBe(1);
  expect(document.activeElement === opener).toBe(true);
  expect(opener.tabIndex).toBe(0);
  expect(document.body.style.overflow).toBe("hidden");
});

test("关闭完成等待实际 CSS 动画，期间保持滚动锁而不依赖固定时长", async () => {
  let completed = 0,
    finish = () => {};
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  function Animated() {
    const [open, setOpen] = useState(true);
    return (
      <IqujiDialog
        title="动画"
        closeLabel="关闭"
        open={open}
        onOpenChange={setOpen}
        onCloseComplete={() => completed++}
      >
        <input />
      </IqujiDialog>
    );
  }
  await render(<Animated />);
  const dialog = popup();
  dialog.getAnimations = () => [
    { finished, playState: "running", pending: true } as unknown as Animation,
  ];
  await click(button("关闭"));
  expect(completed).toBe(0);
  expect(dialog.isConnected).toBe(true);
  expect(document.body.style.overflow).toBe("hidden");
  await act(async () => {
    finish();
    await tick();
  });
  expect(completed).toBe(1);
  expect(dialog.isConnected).toBe(false);
  expect(document.body.style.overflow).toBe("");
});

test("重新打开取消旧退出完成，不卸载新容器或抢走其焦点", async () => {
  let setOpen: (value: boolean) => void = () => {},
    completed = 0,
    finish = () => {};
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  function Reopened() {
    const [open, update] = useState(true);
    setOpen = update;
    return (
      <IqujiDialog
        title="重开"
        closeLabel="关闭"
        open={open}
        onOpenChange={update}
        onCloseComplete={() => completed++}
      >
        <input aria-label="填写" />
      </IqujiDialog>
    );
  }
  await render(<Reopened />);
  popup().getAnimations = () => [
    { finished, playState: "running", pending: true } as unknown as Animation,
  ];
  await click(button("关闭"));
  await act(async () => {
    setOpen(true);
    await tick();
  });
  const input = required(document.querySelector<HTMLInputElement>("input"));
  await act(async () => input.focus());
  await act(async () => {
    finish();
    await tick();
  });
  expect(completed).toBe(0);
  expect(popup().contains(input)).toBe(true);
  expect(document.activeElement === input).toBe(true);
});

test("等待退出时卸载旧容器会取消完成通知，不夺走新容器焦点", async () => {
  let replace = () => {},
    completed = 0,
    finish = () => {};
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  function Replaced() {
    const [old, setOld] = useState(true);
    const [open, setOpen] = useState(true);
    replace = () => setOld(false);
    return old ? (
      <IqujiDialog
        key="old"
        title="旧容器"
        closeLabel="关闭旧容器"
        open={open}
        onOpenChange={setOpen}
        onCloseComplete={() => completed++}
      >
        <input />
      </IqujiDialog>
    ) : (
      <IqujiDialog key="new" title="新容器" closeLabel="关闭新容器" open>
        <input aria-label="新内容" />
      </IqujiDialog>
    );
  }
  await render(<Replaced />);
  popup().getAnimations = () => [
    { finished, playState: "running", pending: true } as unknown as Animation,
  ];
  await click(button("关闭旧容器"));
  await act(async () => {
    replace();
    await tick();
  });
  const input = required(document.querySelector<HTMLInputElement>("input"));
  await act(async () => input.focus());
  await act(async () => {
    finish();
    await tick();
  });
  expect(completed).toBe(0);
  expect(document.activeElement === input).toBe(true);
  expect(popup().textContent).toContain("新容器");
});

test("关闭后已失效的入口不会重新得到焦点", async () => {
  function DisabledTrigger() {
    const [open, setOpen] = useState(false);
    const [disabled, setDisabled] = useState(false);
    return (
      <>
        <button type="button" disabled={disabled} onClick={() => setOpen(true)}>
          提交入口
        </button>
        <IqujiDialog
          open={open}
          title="提交"
          closeLabel="完成提交"
          onOpenChange={(next) => {
            setDisabled(true);
            setOpen(next);
          }}
        >
          <input />
        </IqujiDialog>
      </>
    );
  }
  await render(<DisabledTrigger />);
  const trigger = button("提交入口");
  await click(trigger);
  await click(button("完成提交"));
  expect(trigger.disabled).toBe(true);
  expect(document.activeElement === trigger).toBe(false);
});

test("宿主在子层完成通知中才重开父层，通过正式ref指定本轮初始入口", async () => {
  function Swapped() {
    const [parent, setParent] = useState(true),
      [child, setChild] = useState(false);
    const entry = useRef<HTMLButtonElement>(null);
    return (
      <IqujiDrawer
        open={parent}
        title="父层"
        closeLabel="关闭父层"
        initialFocusRef={entry}
      >
        <button
          ref={entry}
          type="button"
          onClick={() => {
            setParent(false);
            setChild(true);
          }}
        >
          原入口
        </button>
        <IqujiDrawer
          open={child}
          title="子层"
          closeLabel="关闭子层"
          onOpenChange={setChild}
          onCloseComplete={() => setParent(true)}
        />
      </IqujiDrawer>
    );
  }
  await render(<Swapped />);
  const opener = button("原入口");
  await click(opener);
  await click(button("关闭子层"));
  expect(document.activeElement === opener).toBe(true);
  expect(opener.tabIndex).toBe(0);
});

test("退出期间用户已进入新的业务输入时，关闭完成不夺走焦点", async () => {
  let finish = () => {};
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  function Editing() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          打开旧任务
        </button>
        <input aria-label="新业务输入" />
        <IqujiDialog
          open={open}
          title="旧任务"
          closeLabel="关闭旧任务"
          onOpenChange={setOpen}
        />
      </>
    );
  }
  await render(<Editing />);
  await click(button("打开旧任务"));
  popup().getAnimations = () => [
    { finished, playState: "running", pending: true } as unknown as Animation,
  ];
  await click(button("关闭旧任务"));
  const input = required(document.querySelector<HTMLInputElement>("input"));
  await act(async () => input.focus());
  await act(async () => {
    finish();
    await tick();
  });
  expect(document.activeElement === input).toBe(true);
});

test.each([
  false,
  true,
])("抽屉 destroyOnClose=%s 按声明保留或销毁内容状态", async (destroyOnClose) => {
  let setOpen: (value: boolean) => void = () => {};
  function Stateful() {
    const [open, update] = useState(true);
    setOpen = update;
    return (
      <IqujiDrawer
        title="状态"
        closeLabel="关闭"
        open={open}
        onOpenChange={update}
        destroyOnClose={destroyOnClose}
      >
        <input defaultValue="初始" />
      </IqujiDrawer>
    );
  }
  await render(<Stateful />);
  const input = required(document.querySelector<HTMLInputElement>("input"));
  input.value = "保留";
  await click(button("关闭"));
  await act(async () => {
    setOpen(true);
    await tick();
  });
  expect(document.querySelector<HTMLInputElement>("input")?.value).toBe(
    destroyOnClose ? "初始" : "保留",
  );
});

test("从菜单打开对话框后回到可见菜单入口，确认提交中的关闭与重复动作均不可用", async () => {
  let confirmed = 0;
  let close = () => {};
  function MenuDialog() {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    close = () => setOpen(false);
    return (
      <>
        <IqujiDropdownMenu
          trigger={<button type="button">菜单</button>}
          items={[
            { key: "delete", label: "删除", onSelect: () => setOpen(true) },
          ]}
        />
        <IqujiConfirmDialog
          title="删除记录"
          closeLabel="关闭"
          open={open}
          onOpenChange={setOpen}
          confirmLabel="提交"
          cancelLabel="返回"
          onConfirm={() => {
            confirmed++;
            setPending(true);
          }}
          confirmLoading={pending}
        >
          <p>处理中</p>
        </IqujiConfirmDialog>
      </>
    );
  }
  await render(<MenuDialog />);
  const trigger = button("菜单");
  await click(trigger);
  const item = required(
    document.querySelector<HTMLElement>('[role="menuitem"]'),
  );
  await click(item);
  await click(button("提交"));
  expect(button("提交").disabled).toBe(true);
  expect(button("返回").disabled).toBe(true);
  await pressEscape();
  expect(popup()).not.toBeNull();
  expect(confirmed).toBe(1);
  await act(async () => {
    close();
    await tick();
  });
  expect(document.activeElement === trigger).toBe(true);
});

test("父子容器同时初始打开时，子层仍是实际顶层", async () => {
  function InitialNested() {
    const [open, setOpen] = useState(true);
    return (
      <IqujiDrawer title="父层" closeLabel="父关闭" open>
        <IqujiDialog
          title="子层"
          closeLabel="子关闭"
          open={open}
          onOpenChange={setOpen}
        >
          <input />
        </IqujiDialog>
      </IqujiDrawer>
    );
  }
  await render(<InitialNested />);
  button("子关闭").focus();
  await pressEscape();
  expect(document.querySelectorAll('[role="dialog"][data-open]')).toHaveLength(
    1,
  );
  expect(popup().textContent).toContain("父层");
});
