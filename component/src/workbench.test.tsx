import { afterEach, describe, expect, spyOn, test } from "bun:test";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { type IqujiWorkbenchGeometry, IqujiWorkbenchLayout } from "./workbench.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const roots: Root[] = [];
const cleanups: Array<() => void> = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 30));

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
  for (const cleanup of cleanups.splice(0)) cleanup();
});

async function mount(content: ReactNode) {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  roots.push(root);
  await act(async () => {
    root.render(content);
    await tick();
  });
}

function required<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("测试中缺少目标元素");
  return value;
}

async function press(element: HTMLElement, key: string) {
  await act(async () => {
    element.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key,
      }),
    );
    await tick();
  });
}

function mockLayout(widths: IqujiWorkbenchGeometry) {
  const observers: LayoutResizeObserver[] = [];
  class LayoutResizeObserver {
    readonly targets = new Set<Element>();
    disconnected = false;
    constructor(private callback: ResizeObserverCallback) {
      observers.push(this);
    }
    observe(target: Element) { this.targets.add(target); }
    unobserve(target: Element) { this.targets.delete(target); }
    disconnect() {
      this.disconnected = true;
      this.targets.clear();
    }
    notify() { this.callback([], this as unknown as ResizeObserver); }
  }
  const originalObserver = globalThis.ResizeObserver;
  globalThis.ResizeObserver = LayoutResizeObserver as unknown as typeof ResizeObserver;
  const rectangles = spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      const width = this.classList.contains("iquji-workbench__pane--left")
        ? widths.leftWidth
        : this.classList.contains("iquji-workbench__pane--right")
          ? widths.rightWidth
          : widths.centerWidth;
      return new DOMRect(0, 0, width, 100);
    });
  cleanups.push(() => {
    globalThis.ResizeObserver = originalObserver;
    rectangles.mockRestore();
  });
  return observers;
}

describe("三栏工作台正式行为", () => {
  test("中心区始终渲染，左右栏可选并带可访问分隔条", () => {
    const both = renderToStaticMarkup(
      <IqujiWorkbenchLayout
        center={<span>Center</span>}
        left={<span>Left</span>}
        leftResizeLabel="Resize left"
        right={<span>Right</span>}
        rightResizeLabel="Resize right"
      />,
    );
    expect(both).toContain("Center");
    expect(both).toContain("Left");
    expect(both).toContain("Right");
    expect(both.match(/role="separator"/gu)?.length).toBe(2);
    expect(both).toContain('aria-label="Resize left"');
    expect(both).toContain('aria-label="Resize right"');
    expect(both).toContain('aria-orientation="vertical"');
    expect(both).toContain('aria-valuemin="180"');
    expect(both).toContain('aria-valuemax="420"');
    expect(both).toContain("--iquji-workbench-center-min-width:480px");

    const centerOnly = renderToStaticMarkup(
      <IqujiWorkbenchLayout center={<span>Center only</span>} />,
    );
    expect(centerOnly).toContain("Center only");
    expect(centerOnly).not.toContain('role="separator"');
  });

  test("折叠左侧保留挂载但退出布局与辅助技术", () => {
    const markup = renderToStaticMarkup(
      <IqujiWorkbenchLayout
        center={<span>Center</span>}
        left={<span>Left payload</span>}
        leftCollapsed
        leftResizeLabel="Resize left"
      />,
    );
    expect(markup).toContain("Left payload");
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("inert");
    expect(markup).not.toContain('aria-label="Resize left"');
  });

  test("分隔条支持键盘调整与边界", async () => {
    function Harness() {
      const [leftWidth, setLeftWidth] = useState(240);
      const [rightWidth, setRightWidth] = useState(420);
      return (
        <IqujiWorkbenchLayout
          center={<span>Center</span>}
          left={<span>Left</span>}
          leftResizeLabel="Resize left"
          leftWidth={leftWidth}
          onLeftWidthChange={setLeftWidth}
          right={<span>Right</span>}
          rightResizeLabel="Resize right"
          onRightWidthChange={setRightWidth}
          rightWidth={rightWidth}
        />
      );
    }

    await mount(<Harness />);
    const separators = () =>
      Array.from(document.querySelectorAll<HTMLElement>('[role="separator"]'));
    const left = required(separators()[0]);
    const right = required(separators()[1]);

    expect(left.getAttribute("aria-valuenow")).toBe("240");
    await press(left, "ArrowRight");
    expect(left.getAttribute("aria-valuenow")).toBe("256");
    await press(left, "Home");
    expect(left.getAttribute("aria-valuenow")).toBe("180");
    await press(left, "End");
    expect(left.getAttribute("aria-valuenow")).toBe("420");

    expect(right.getAttribute("aria-valuenow")).toBe("420");
    await press(right, "ArrowRight");
    expect(right.getAttribute("aria-valuenow")).toBe("404");
    await press(right, "ArrowLeft");
    expect(right.getAttribute("aria-valuenow")).toBe("420");
    await press(right, "Home");
    expect(right.getAttribute("aria-valuenow")).toBe("280");
  });

  test("折叠状态由调用方控制且中心区不受影响", async () => {
    function Harness() {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <div>
          <button
            onClick={() => setCollapsed((current) => !current)}
            type="button"
          >
            toggle left
          </button>
          <IqujiWorkbenchLayout
            center={<span>Center</span>}
            left={<span>Left</span>}
            leftCollapsed={collapsed}
            leftResizeLabel="Resize left"
          />
        </div>
      );
    }

    await mount(<Harness />);
    const leftPane = () =>
      required(
        document.querySelector<HTMLElement>(".iquji-workbench__pane--left"),
      );
    expect(leftPane().hasAttribute("aria-hidden")).toBe(false);
    await act(async () => {
      required(
        document.querySelector<HTMLButtonElement>("button"),
      ).click();
      await tick();
    });
    expect(leftPane().getAttribute("aria-hidden")).toBe("true");
    expect(leftPane().hasAttribute("inert")).toBe(true);
    expect(document.querySelector('[aria-label="Resize left"]')).toBeNull();
    expect(document.querySelector(".iquji-workbench__pane--center")).not.toBeNull();
  });

  test("实际宽度变化只报告一次且不覆盖用户设定", async () => {
    const widths = { leftWidth: 220, centerWidth: 480, rightWidth: 320 };
    const observers = mockLayout(widths);
    const updates: IqujiWorkbenchGeometry[] = [];
    const requestedChanges: number[] = [];
    await mount(
      <IqujiWorkbenchLayout
        center={<span>Center</span>}
        left={<span>Left</span>}
        leftWidth={280}
        onLayoutChange={(geometry) => updates.push(geometry)}
        onLeftWidthChange={(width) => requestedChanges.push(width)}
        onRightWidthChange={(width) => requestedChanges.push(width)}
        right={<span>Right</span>}
        rightWidth={480}
      />,
    );
    const observer = required(observers[0]);
    expect(observer.targets.size).toBe(3);
    expect(updates).toEqual([{ leftWidth: 220, centerWidth: 480, rightWidth: 320 }]);
    observer.notify();
    expect(updates).toHaveLength(1);
    widths.leftWidth = 260;
    widths.centerWidth = 620;
    widths.rightWidth = 400;
    observer.notify();
    observer.notify();
    expect(updates).toEqual([
      { leftWidth: 220, centerWidth: 480, rightWidth: 320 },
      { leftWidth: 260, centerWidth: 620, rightWidth: 400 },
    ]);
    const workbench = required(document.querySelector<HTMLElement>(".iquji-workbench"));
    expect(workbench.style.getPropertyValue("--iquji-workbench-left-width")).toBe("280px");
    expect(workbench.style.getPropertyValue("--iquji-workbench-right-width")).toBe("480px");
    expect(requestedChanges).toEqual([]);
  });

  test("折叠和移除侧栏报告零宽度并清理旧观察器", async () => {
    const observers = mockLayout({ leftWidth: 240, centerWidth: 600, rightWidth: 420 });
    const updates: IqujiWorkbenchGeometry[] = [];
    const report = (geometry: IqujiWorkbenchGeometry) => { updates.push(geometry); };
    function Harness() {
      const [mode, setMode] = useState(0);
      return (
        <>
          <button onClick={() => setMode((value) => (value + 1) % 3)} type="button">toggle</button>
          <IqujiWorkbenchLayout
            center={<span>Center</span>}
            left={mode === 2 ? undefined : <span>Left</span>}
            leftCollapsed={mode === 1}
            onLayoutChange={report}
            right={mode === 2 ? undefined : <span>Right</span>}
            rightCollapsed={mode === 1}
          />
        </>
      );
    }
    await mount(<Harness />);
    const original = required(observers[0]);
    const toggle = required(document.querySelector<HTMLButtonElement>("button"));
    await act(async () => { toggle.click(); });
    expect(updates.at(-1)).toEqual({ leftWidth: 0, centerWidth: 600, rightWidth: 0 });
    expect(original.disconnected).toBe(true);
    const count = updates.length;
    original.notify();
    expect(updates).toHaveLength(count);
    await act(async () => { toggle.click(); });
    expect(required(observers.at(-1)).targets.size).toBe(1);
    expect(updates).toHaveLength(count);
    await act(async () => { toggle.click(); });
    expect(updates.at(-1)).toEqual({ leftWidth: 240, centerWidth: 600, rightWidth: 420 });
    const current = required(observers.at(-1));
    const root = required(roots.pop());
    await act(async () => { root.unmount(); });
    expect(current.disconnected).toBe(true);
    expect(current.targets.size).toBe(0);
    const unmountedCount = updates.length;
    current.notify();
    expect(updates).toHaveLength(unmountedCount);
  });
});
