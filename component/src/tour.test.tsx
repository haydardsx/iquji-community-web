import { afterEach, expect, test } from "bun:test";
import { act, useRef, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiButton } from "./index.js";
import { IqujiDrawer } from "./drawer.js";
import { IqujiDropdownMenu, IqujiPopover } from "./floating.js";
import { IqujiSelect } from "./forms.js";
import { IqujiOverlayProvider } from "./overlay-layer.js";
import { IqujiDialog } from "./overlays.js";
import { IqujiTour } from "./tour.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: Root[] = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 50));
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
    await tick();
  });
  document.body.replaceChildren();
  document.body.style.overflow = "";
});
async function render(content: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => {
    root.render(<IqujiOverlayProvider>{content}</IqujiOverlayProvider>);
    await tick();
  });
  await act(tick);
  return root;
}
function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("测试缺少实际教程控件");
  return value;
}
function button(label: string) {
  return required(
    Array.from(document.querySelectorAll<HTMLButtonElement>("button")).find(
      (item) =>
        item.textContent === label || item.getAttribute("aria-label") === label,
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
function anchor(
  element: HTMLElement | null,
  rect = new DOMRect(200, 100, 240, 40),
) {
  if (element) element.getBoundingClientRect = () => rect;
}

test("教程高亮真实字段，字段仍可输入，滚动后目标更新且退出清理浮层", async () => {
  let bounds = new DOMRect(200, 100, 240, 40);
  function Example() {
    const input = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState("");
    return (
      <>
        <input
          aria-label="名称"
          ref={(element) => {
            input.current = element;
            if (element) element.getBoundingClientRect = () => bounds;
          }}
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
        <output>{value}</output>
        <IqujiTour
          open={open}
          onClose={() => setOpen(false)}
          closeLabel="退出教程"
          progress="1 / 3"
          actions={<IqujiButton>下一步</IqujiButton>}
          step={{
            id: "name",
            target: () => input.current,
            title: "填写名称",
            description: "在高亮字段输入名称。",
          }}
        />
      </>
    );
  }
  await render(<Example />);
  const spotlight = required(
    document.querySelector<HTMLElement>(".iquji-tour__spotlight"),
  );
  expect(spotlight.style.left).toBe("194px");
  expect(spotlight.style.top).toBe("94px");
  expect(spotlight.style.width).toBe("252px");
  expect(document.querySelector(".iquji-tour__card")?.textContent).toContain(
    "填写名称",
  );
  const field = required(
    document.querySelector<HTMLInputElement>('input[aria-label="名称"]'),
  );
  await act(async () => {
    field.focus();
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(field, "演示流程");
    field.dispatchEvent(new Event("input", { bubbles: true }));
    await tick();
  });
  expect(document.activeElement === field).toBe(true);
  expect(field.value).toBe("演示流程");
  bounds = new DOMRect(350, 180, 300, 48);
  await act(async () => {
    document.dispatchEvent(new Event("scroll"));
    await tick();
  });
  expect(spotlight.style.left).toBe("344px");
  expect(spotlight.style.top).toBe("174px");
  await click(button("退出教程"));
  expect(Boolean(document.querySelector(".iquji-tour"))).toBe(false);
  expect(field.value).toBe("演示流程");
  expect(document.activeElement === field).toBe(true);
});

test("目标延迟挂载和移除时保持当前步骤，缺失时安全保留退出入口", async () => {
  let target: HTMLElement | null = null;
  await render(
    <IqujiTour
      open
      onClose={() => {}}
      closeLabel="退出教程"
      step={{
        id: "late",
        target: () => target,
        title: "等待字段",
        description: "字段准备好后继续。",
      }}
    />,
  );
  expect(
    document.querySelector(".iquji-tour")?.hasAttribute("data-target-missing"),
  ).toBe(true);
  expect(document.querySelector(".iquji-tour__spotlight")).toBeNull();
  target = document.createElement("input");
  anchor(target, new DOMRect(80, 120, 260, 50));
  await act(async () => {
    document.body.append(required(target));
    await tick();
  });
  expect(
    document.querySelector(".iquji-tour")?.hasAttribute("data-target-missing"),
  ).toBe(false);
  expect(
    document.querySelector<HTMLElement>(".iquji-tour__spotlight")?.style.left,
  ).toBe("74px");
  await act(async () => {
    target?.remove();
    await tick();
  });
  expect(document.querySelector(".iquji-tour")?.getAttribute("data-step")).toBe(
    "late",
  );
  expect(document.querySelector(".iquji-tour__spotlight")).toBeNull();
  expect(button("退出教程").disabled).toBe(false);
});

test("两层抽屉内教程与真实字段共享焦点，Select和确认框按各自层级处理Escape", async () => {
  function Example() {
    const target = useRef<HTMLDivElement>(null);
    const [tour, setTour] = useState(true);
    const [confirmation, setConfirmation] = useState(false);
    const [mode, setMode] = useState("list");
    return (
      <IqujiDrawer open title="外层" closeLabel="关闭外层">
        <IqujiDrawer open title="编辑器" closeLabel="关闭编辑器">
          <div
            ref={(element) => {
              target.current = element;
              anchor(element);
            }}
          >
            <input aria-label="章节名称" />
            <IqujiSelect
              aria-label="视图"
              value={mode}
              onValueChange={(value) => setMode(value ?? "list")}
              options={[
                { value: "list", label: "列表" },
                { value: "grid", label: "网格" },
              ]}
            />
          </div>
          <IqujiTour
            open={tour}
            onClose={() => setTour(false)}
            closeLabel="退出教程"
            actions={
              <IqujiButton onClick={() => setConfirmation(true)}>
                打开确认
              </IqujiButton>
            }
            step={{
              id: "step",
              target: () => target.current,
              title: "编辑步骤",
              description: "填写步骤内容。",
            }}
          />
          <IqujiDialog
            open={confirmation}
            onOpenChange={setConfirmation}
            title="确认修改"
            closeLabel="关闭确认"
          >
            <p>检查修改后继续。</p>
          </IqujiDialog>
        </IqujiDrawer>
      </IqujiDrawer>
    );
  }
  await render(<Example />);
  const card = required(
    document.querySelector<HTMLElement>(".iquji-tour__card"),
  );
  const scope = required(
    card.closest<HTMLElement>(".iquji-overlay-floating-layer"),
  );
  expect(scope.style.zIndex).toBe("1022");
  const action = button("打开确认");
  await act(async () => {
    action.focus();
    await tick();
  });
  expect(document.activeElement === action).toBe(true);
  const field = required(
    document.querySelector<HTMLInputElement>('input[aria-label="章节名称"]'),
  );
  await act(async () => {
    field.focus();
    await tick();
  });
  expect(document.activeElement === field).toBe(true);
  await click(
    required(document.querySelector<HTMLElement>('[role="combobox"]')),
  );
  const select = required(
    document.querySelector<HTMLElement>(
      '[data-iquji-overlay="select"][data-open]',
    ),
  );
  expect(select.closest(".iquji-overlay-floating-layer") === scope).toBe(true);
  await escape();
  expect(
    document.querySelector('[data-iquji-overlay="select"][data-open]'),
  ).toBeNull();
  expect(Boolean(document.querySelector(".iquji-tour__card"))).toBe(true);
  await click(action);
  expect(Boolean(document.querySelector(".iquji-tour"))).toBe(false);
  expect(
    document.querySelector('[role="dialog"][data-open]')?.textContent,
  ).toContain("外层");
  await click(button("关闭确认"));
  await act(tick);
  expect(Boolean(document.querySelector(".iquji-tour__card"))).toBe(true);
  await act(async () => {
    field.focus();
    await tick();
  });
  await escape();
  expect(Boolean(document.querySelector(".iquji-tour"))).toBe(false);
  expect(document.querySelectorAll(".iquji-drawer[data-open]")).toHaveLength(2);
});

test("后挂载教程先消费Escape，保留未应用输入并阻止底层抽屉退出保护", async () => {
  let leaveRequests = 0;
  function Example() {
    const input = useRef<HTMLTextAreaElement>(null);
    const [tour, setTour] = useState(false);
    const [confirmation, setConfirmation] = useState(false);
    const [value, setValue] = useState("");
    return (
      <IqujiDrawer open title="文档列表" closeLabel="关闭文档列表">
        <IqujiDrawer
          open
          title="编辑器"
          closeLabel="关闭编辑器"
          onEscape={() => {
            leaveRequests++;
            setConfirmation(true);
            return true;
          }}
        >
          <IqujiButton onClick={() => setTour(true)}>开始教程</IqujiButton>
          <textarea
            aria-label="未应用输入"
            ref={(element) => {
              input.current = element;
              anchor(element);
            }}
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
          <IqujiTour
            open={tour}
            onClose={() => setTour(false)}
            closeLabel="退出教程"
            step={{
              id: "editing",
              target: () => input.current,
              title: "填写备注",
              description: "在原字段中编辑。",
            }}
          />
          <IqujiDialog
            open={confirmation}
            onOpenChange={setConfirmation}
            title="放弃修改"
            closeLabel="关闭确认"
          >
            <p>尚有未应用的输入。</p>
          </IqujiDialog>
        </IqujiDrawer>
      </IqujiDrawer>
    );
  }
  await render(<Example />);
  await click(button("开始教程"));
  const field = required(
    document.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="未应用输入"]',
    ),
  );
  await act(async () => {
    button("开始教程").blur();
    Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )?.set?.call(field, "尚未保存的备注");
    field.dispatchEvent(new Event("input", { bubbles: true }));
    await tick();
  });
  await escape();
  expect(leaveRequests).toBe(0);
  expect(Boolean(document.querySelector(".iquji-tour"))).toBe(false);
  expect(field.value).toBe("尚未保存的备注");
  expect(document.querySelectorAll(".iquji-drawer[data-open]")).toHaveLength(2);
  expect(
    Array.from(document.querySelectorAll('[role="dialog"][data-open]')).some(
      (dialog) => dialog.textContent?.includes("尚有未应用的输入"),
    ),
  ).toBe(false);
});

test("教程目标中的菜单与Popover覆盖遮罩，伸出高亮区域的操作仍能完成", async () => {
  const styles = document.createElement("style");
  styles.textContent =
    (await Bun.file(new URL("./overlay.css", import.meta.url)).text()) +
    (await Bun.file(new URL("./tour.css", import.meta.url)).text());
  document.head.append(styles);
  let selected = 0;
  let applied = 0;
  function Example() {
    const target = useRef<HTMLDivElement>(null);
    return (
      <IqujiDrawer open title="设置" closeLabel="关闭设置">
        <div
          ref={(element) => {
            target.current = element;
            anchor(element, new DOMRect(120, 100, 220, 40));
          }}
        >
          <IqujiDropdownMenu
            trigger={<IqujiButton>打开菜单</IqujiButton>}
            items={[
              { key: "choose", label: "选择此项", onSelect: () => selected++ },
            ]}
          />
          <IqujiPopover trigger={<IqujiButton>打开详情</IqujiButton>}>
            <IqujiButton onClick={() => applied++}>应用设置</IqujiButton>
          </IqujiPopover>
        </div>
        <IqujiTour
          open
          onClose={() => {}}
          closeLabel="退出教程"
          step={{
            id: "controls",
            target: () => target.current,
            title: "选择设置",
            description: "打开控件继续选择。",
          }}
        />
      </IqujiDrawer>
    );
  }
  try {
    await render(<Example />);
    const tour = required(document.querySelector<HTMLElement>(".iquji-tour"));
    const checkLayer = (popup: HTMLElement) => {
      const positioner = required(
        popup.closest<HTMLElement>(".iquji-floating-positioner"),
      );
      expect(
        positioner.closest(".iquji-overlay-floating-layer") ===
          tour.closest(".iquji-overlay-floating-layer"),
      ).toBe(true);
      expect(Number(getComputedStyle(positioner).zIndex)).toBeGreaterThan(
        Number(getComputedStyle(tour).zIndex),
      );
      expect(getComputedStyle(positioner).pointerEvents).toBe("auto");
    };
    await click(button("打开菜单"));
    const menu = required(
      document.querySelector<HTMLElement>(".iquji-menu-popup[data-open]"),
    );
    checkLayer(menu);
    await click(required(menu.querySelector<HTMLElement>('[role="menuitem"]')));
    expect(selected).toBe(1);
    await click(button("打开详情"));
    checkLayer(
      required(
        document.querySelector<HTMLElement>(".iquji-popover-popup[data-open]"),
      ),
    );
    await click(button("应用设置"));
    expect(applied).toBe(1);
    expect(Boolean(document.querySelector(".iquji-tour__card"))).toBe(true);
  } finally {
    styles.remove();
  }
});

test("近全屏和缺失目标保留完整说明，底边字段恢复向上避让", async () => {
  const prototype = HTMLElement.prototype;
  const originalRect = prototype.getBoundingClientRect;
  const properties = [
    "offsetWidth",
    "offsetHeight",
    "clientWidth",
    "clientHeight",
  ] as const;
  const descriptors = properties.map((name) =>
    Object.getOwnPropertyDescriptor(prototype, name),
  );
  const width = window.innerWidth;
  const height = window.innerHeight;
  let bounds = new DOMRect(20, 60, width - 40, height - 60);
  let target: HTMLElement | null = null;
  let cardBounds = new DOMRect(0, 0, 328, 200);
  prototype.getBoundingClientRect = function () {
    if (this.matches(".iquji-tour__card, .iquji-tour__positioner"))
      return cardBounds;
    if (this === document.documentElement)
      return new DOMRect(0, 0, width, height);
    return originalRect.call(this);
  };
  for (const name of properties) {
    Object.defineProperty(prototype, name, {
      configurable: true,
      get() {
        const rect = this.getBoundingClientRect();
        return name.endsWith("Width") ? rect.width : rect.height;
      },
    });
  }
  try {
    await render(
      <>
        <div
          ref={(element) => {
            target = element;
            if (element) element.getBoundingClientRect = () => bounds;
          }}
        />
        <IqujiTour
          open
          onClose={() => {}}
          closeLabel="退出教程"
          step={{
            id: "canvas",
            target: () => target,
            title: "检查当前步骤",
            description: "检查完成后继续设置下一步。",
            placement: "bottom",
          }}
        />
      </>,
    );
    const positioner = required(
      document.querySelector<HTMLElement>(".iquji-tour__positioner"),
    );
    const coordinates = () => {
      const translation = positioner.style.transform.match(
        /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/,
      );
      return {
        x: Number(translation?.[1] ?? positioner.style.left.replace("px", "")),
        y: Number(translation?.[2] ?? positioner.style.top.replace("px", "")),
      };
    };
    const contained = coordinates();
    expect(contained.x).toBeGreaterThanOrEqual(16);
    expect(contained.y).toBeGreaterThanOrEqual(16);
    expect(contained.x + cardBounds.width).toBeLessThanOrEqual(width - 16);
    expect(contained.y + cardBounds.height).toBeLessThanOrEqual(height - 16);
    expect(document.querySelector(".iquji-tour__arrow")).toBeNull();
    bounds = new DOMRect(width / 2 - 120, height - 80, 240, 40);
    await act(async () => {
      window.dispatchEvent(new Event("resize"));
      await tick();
    });
    await act(tick);
    expect(positioner.getAttribute("data-side")).toBe("top");
    expect(coordinates().y + cardBounds.height).toBeLessThanOrEqual(
      bounds.top - 16,
    );
    expect(Boolean(document.querySelector(".iquji-tour__arrow"))).toBe(true);
    cardBounds = new DOMRect(0, 0, 328, height - 32);
    await act(async () => {
      required(target).hidden = true;
      window.dispatchEvent(new Event("resize"));
      await tick();
    });
    await act(tick);
    expect(document.querySelector(".iquji-tour__spotlight")).toBeNull();
    expect(coordinates().y).toBeGreaterThanOrEqual(16);
    expect(coordinates().y + cardBounds.height).toBeLessThanOrEqual(height);
  } finally {
    prototype.getBoundingClientRect = originalRect;
    properties.forEach((name, index) => {
      const descriptor = descriptors[index];
      if (descriptor) Object.defineProperty(prototype, name, descriptor);
      else Reflect.deleteProperty(prototype, name);
    });
  }
});
