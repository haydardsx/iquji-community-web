import { afterEach, expect, test } from "bun:test";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiDrawer } from "./drawer.js";
import {
  type IqujiNotificationApi,
  IqujiNotificationProvider,
  useIqujiNotification,
} from "./notification.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";
import { IqujiDialog } from "./overlays.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
const tick = (delay = 30) =>
  new Promise<void>((resolve) => setTimeout(resolve, delay));
let api: IqujiNotificationApi;
function Capture() {
  api = useIqujiNotification();
  return null;
}
async function render(children?: ReactNode, maxCount = 3) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => {
    root.render(
      <IqujiOverlayProvider>
        <IqujiNotificationProvider closeLabel="关闭通知" maxCount={maxCount}>
          <Capture />
          {children}
        </IqujiNotificationProvider>
      </IqujiOverlayProvider>,
    );
  });
  await act(() => tick());
  return root;
}
const notifications = () => [
  ...document.querySelectorAll<HTMLElement>(
    ".iquji-notification:not([data-ending-style])",
  ),
];

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
  document.body.style.overflow = "";
});

test("同 key 更新而不重复创建，支持逐条关闭与数量上限", async () => {
  await render(undefined, 2);
  let closed = 0;
  await act(async () => {
    api.open({ key: "one", title: "旧标题", duration: 0 });
    api.open({
      key: "one",
      title: "新标题",
      duration: 0,
      onClose: () => closed++,
    });
    api.open({ key: "two", title: "第二条", duration: 0 });
  });
  expect(notifications()).toHaveLength(2);
  expect(document.body.textContent).toContain("新标题");
  expect(document.body.textContent).not.toContain("旧标题");
  await act(async () => {
    api.open({ key: "three", title: "第三条", duration: 0 });
    await tick();
  });
  expect(closed).toBe(1);
  expect(notifications()).toHaveLength(2);
  expect(
    notifications()
      .map((node) => node.textContent)
      .join(),
  ).not.toContain("新标题");
  await act(async () => {
    api.close("two");
    await tick();
  });
  expect(notifications()).toHaveLength(1);
  await act(async () => {
    api.close();
    await tick();
  });
  expect(notifications()).toHaveLength(0);
});

test("自动关闭、0 常驻与卸载后的定时器清理", async () => {
  const root = await render();
  let closed = 0;
  await act(async () => {
    api.open({ title: "自动关闭", duration: 35, onClose: () => closed++ });
    api.open({ key: "stay", title: "保持显示", duration: 0 });
  });
  await act(() => tick(80));
  expect(closed).toBe(1);
  expect(notifications()).toHaveLength(1);
  expect(notifications()[0]?.textContent).toContain("保持显示");
  // 同步提交与卸载，避免测试等待本身先触发自动关闭。
  act(() => {
    api.open({ title: "卸载前通知", duration: 35, onClose: () => closed++ });
    root.unmount();
  });
  await tick(60);
  expect(closed).toBe(1);
  expect(document.querySelector(".iquji-notification-viewport")).toBeNull();
});

test("同 key 更新重置进度条，常驻通知不显示进度条且不显示秒数", async () => {
  await render();
  await act(async () => {
    api.open({ key: "timer", title: "计时通知", duration: 10000 });
    api.open({ key: "stay", title: "常驻通知", duration: 0 });
  });
  const timed = notifications().find((node) =>
    node.textContent?.includes("计时通知"),
  );
  const persistent = notifications().find((node) =>
    node.textContent?.includes("常驻通知"),
  );
  const progress = timed?.querySelector(".iquji-notification__progress");
  expect(progress).not.toBeNull();
  expect(timed?.querySelector(".iquji-notification__countdown")).toBeNull();
  expect(
    persistent?.querySelector(".iquji-notification__countdown"),
  ).toBeNull();
  expect(persistent?.querySelector(".iquji-notification__progress")).toBeNull();
  await act(() => tick(1100));
  await act(async () =>
    api.open({ key: "timer", title: "计时通知", duration: 10000 }),
  );
  expect(notifications()).toHaveLength(2);
  expect(timed?.querySelector(".iquji-notification__countdown")).toBeNull();
  expect(timed?.querySelector(".iquji-notification__progress")).not.toBe(
    progress,
  );
});

for (const reason of ["hover", "focus", "window"] as const) {
  test(`${reason} 暂停通知关闭与视觉计时，恢复后继续倒计时`, async () => {
    await render();
    await act(async () => api.open({ title: "可暂停通知", duration: 1300 }));
    const viewport = document.querySelector<HTMLElement>(
      ".iquji-notification-viewport",
    );
    const notification = notifications()[0];
    if (!viewport || !notification) throw new Error("缺少通知区域");
    await act(async () => {
      if (reason === "hover")
        viewport.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
      if (reason === "focus")
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "F6", bubbles: true }),
        );
      if (reason === "window") {
        const win = viewport.ownerDocument.defaultView;
        const event = new FocusEvent("blur");
        // Happy DOM 注册器把 window 映射到 globalThis，显式保留真实浏览器的事件目标。
        Object.defineProperty(event, "target", { value: win });
        win?.dispatchEvent(event);
      }
    });
    const progress = notification.querySelector<HTMLElement>(
      ".iquji-notification__progress",
    );
    expect(progress?.style.animationPlayState).toBe("paused");
    await act(() => tick(1400));
    expect(notifications()).toHaveLength(1);
    expect(
      notification.querySelector(".iquji-notification__countdown"),
    ).toBeNull();
    await act(async () => {
      if (reason === "hover")
        viewport.dispatchEvent(
          new MouseEvent("mouseout", {
            bubbles: true,
            relatedTarget: document.body,
          }),
        );
      if (reason === "focus") viewport.blur();
      if (reason === "window")
        document.body.dispatchEvent(new FocusEvent("focus"));
      await tick();
    });
    expect(progress?.style.animationPlayState).toBe("running");
    await act(() => tick(1400));
    expect(notifications()).toHaveLength(0);
  });
}

test("多个通知堆叠时带有层级索引，鼠标滑入视口展开", async () => {
  await render(undefined, 3);
  await act(async () => {
    api.open({ key: "n1", title: "第一条通知", duration: 0 });
    api.open({ key: "n2", title: "第二条通知", duration: 0 });
    api.open({ key: "n3", title: "第三条通知", duration: 0 });
  });
  const items = notifications();
  expect(items).toHaveLength(3);
  expect(items[0]?.getAttribute("data-index")).toBe("0");
  expect(items[1]?.getAttribute("data-index")).toBe("1");
  expect(items[2]?.getAttribute("data-index")).toBe("2");

  const viewport = document.querySelector<HTMLElement>(
    ".iquji-notification-viewport",
  );
  if (!viewport) throw new Error("缺少通知区域");

  await act(async () => {
    viewport.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await tick();
  });
  expect(viewport.hasAttribute("data-expanded")).toBe(true);

  await act(async () => {
    viewport.dispatchEvent(
      new MouseEvent("mouseout", {
        bubbles: true,
        relatedTarget: document.body,
      }),
    );
    await tick();
  });
  expect(viewport.hasAttribute("data-expanded")).toBe(false);
});

for (const kind of ["dialog", "drawer"] as const) {
  test(`${kind} 打开时通知保留输入焦点，操作可聚焦且不关闭容器`, async () => {
    let changed = 0;
    let acted = 0;
    const content = <input aria-label="文档名称" defaultValue="示例文档" />;
    await render(
      kind === "dialog" ? (
        <IqujiDialog
          open
          title="配置"
          closeLabel="关闭配置"
          onOpenChange={() => changed++}
        >
          {content}
        </IqujiDialog>
      ) : (
        <IqujiDrawer
          open
          title="配置"
          closeLabel="关闭配置"
          onOpenChange={() => changed++}
        >
          {content}
        </IqujiDrawer>
      ),
    );
    const input = document.querySelector<HTMLInputElement>("input");
    if (!input) throw new Error("缺少表单输入");
    await act(async () => {
      input.focus();
      api.open({
        title: "已提交",
        duration: 0,
        actions: (
          <button type="button" onClick={() => acted++}>
            查看结果
          </button>
        ),
      });
      await tick();
    });
    expect(document.activeElement).toBe(input);
    const notification = notifications()[0];
    expect(notification?.closest('[aria-hidden="true"], [inert]')).toBeNull();
    expect(
      notification?.closest(".iquji-overlay-floating-layer"),
    ).not.toBeNull();
    const action = notification?.querySelector<HTMLButtonElement>("button");
    if (!action) throw new Error("缺少通知操作");
    await act(async () => {
      action.focus();
      action.click();
      await tick();
    });
    expect(document.activeElement).toBe(action);
    expect(acted).toBe(1);
    expect(changed).toBe(0);
    await act(async () => {
      action.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      await tick();
    });
    expect(notifications()).toHaveLength(0);
    expect(changed).toBe(0);
  });
}
