import { afterEach, describe, expect, test } from "bun:test";
import { IqujiIcon } from "@iquji-community/web-icons";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import {
  IqujiDesktopAccount,
  IqujiDesktopAccountCard,
} from "./desktop-account.js";
import { IqujiDesktopRail } from "./desktop-rail.js";
import { IqujiDesktopShell } from "./desktop-shell.js";
import { IqujiDesktopTabStrip } from "./desktop-tabs.js";
import { IqujiDesktopTitleBar } from "./desktop-titlebar.js";
import { IconButton, IqujiButton } from "./index.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const roots: Root[] = [];
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 30));

afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
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

async function click(element: HTMLElement) {
  await act(async () => {
    element.focus();
    element.click();
    await tick();
  });
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

describe("桌面壳正式行为", () => {
  test("标题栏图标在聚焦后显示同名提示，并保留菜单属性", async () => {
    await mount(
      <IqujiDesktopTitleBar
        actions={
          <IqujiButton
            aria-haspopup="menu"
            aria-label="更多"
            iconStart={<IqujiIcon decorative name="more" />}
            title="更多"
            variant="ghost"
          />
        }
        leading={<IconButton icon={<IqujiIcon decorative name="home" />} label="主页" />}
      />,
    );
    const trigger = required(document.querySelector<HTMLButtonElement>('[aria-label="更多"]'));
    expect(document.querySelectorAll("[data-iquji-titlebar-icon]")).toHaveLength(2);
    expect(trigger.hasAttribute("title")).toBe(false);
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    await act(async () => {
      trigger.focus();
      await tick();
    });
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe("更多");
    expect(trigger.hasAttribute("data-popup-open")).toBe(false);
    await press(trigger, "Escape");
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  test("渲染动态标题栏、标签条、图标栏与内容区", () => {
    const markup = renderToStaticMarkup(
      <IqujiDesktopShell
        rail={
          <IqujiDesktopRail
            footer={<span>Account</span>}
            items={[
              {
                active: true,
                href: "#home",
                icon: <IqujiIcon decorative name="home" />,
                id: "home",
                label: "Home",
              },
              {
                disabled: true,
                icon: <IqujiIcon decorative name="more" />,
                id: "more",
                label: "More",
              },
            ]}
            label="Workspace"
          />
        }
        skipLinkLabel="Skip to content"
        windowBar={
          <IqujiDesktopTitleBar
            actions={<span>Titlebar actions</span>}
            data-tauri-drag-region=""
            dragRegion
            leading={<span>Titlebar leading</span>}
            windowControls={<span>Caller controls</span>}
            windowControlsSpace={78}
          >
            <IqujiDesktopTabStrip
              activeTabId="one"
              addTabLabel="New tab"
              closeTabLabel={(tab) => `Close ${tab.id}`}
              label="Open tabs"
              onActiveTabChange={() => undefined}
              onTabAdd={() => undefined}
              onTabClose={() => undefined}
              tabs={[
                { id: "one", label: "First" },
                { dirty: true, id: "two", label: "Second" },
              ]}
            />
          </IqujiDesktopTitleBar>
        }
      >
        <span>Workspace content</span>
      </IqujiDesktopShell>,
    );

    expect(markup).toContain('href="#iquji-desktop-content"');
    expect(markup).toContain('id="iquji-desktop-content"');
    expect(markup).toContain('data-iquji-drag-region="true"');
    expect(markup).toContain('data-tauri-drag-region=""');
    expect(markup).toContain("padding-left:78px");
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="Open tabs"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('aria-label="Close one"');
    expect(markup).toContain('aria-label="Close two"');
    expect(markup).toContain('aria-label="New tab"');
    expect(markup).toContain('aria-label="Workspace"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('role="tooltip"');
    expect(markup).toContain("Workspace content");
  });

  test("账户卡提供用量进度、快捷键与禁用/危险操作", () => {
    const markup = renderToStaticMarkup(
      <IqujiDesktopAccountCard
        avatarLabel="P"
        avatarTone="positive"
        badge="Owner"
        name="Preview user"
        secondary="Standard plan"
        sections={[
          {
            items: [
              {
                icon: <IqujiIcon decorative name="settings" />,
                key: "settings",
                keyshortcuts: "Meta+,",
                label: "Settings",
                shortcut: "⌘,",
              },
              { disabled: true, key: "blocked", label: "Unavailable" },
            ],
            key: "main",
          },
          {
            items: [
              {
                key: "logout",
                label: "Sign out",
                tone: "danger",
                trailing: <span>›</span>,
              },
            ],
            key: "danger",
          },
        ]}
        usage={{
          label: "Usage",
          tone: "positive",
          value: 43,
          valueText: "43% remaining",
        }}
      />,
    );

    expect(markup).toContain('role="progressbar"');
    expect(markup).toContain('aria-valuenow="43"');
    expect(markup).toContain('aria-keyshortcuts="Meta+,"');
    expect(markup).toContain("43% remaining");
    expect(markup).toContain('data-tone="danger"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("Sign out");
  });

  test("账户入口默认触发器保留可访问名称", () => {
    const markup = renderToStaticMarkup(
      <IqujiDesktopAccount
        card={{ name: "Preview user", sections: [] }}
        triggerLabel="Account menu"
      />,
    );
    expect(markup).toContain('aria-label="Account menu"');
  });

  test("标签条支持方向键、Delete、关闭与新增", async () => {
    const changes: string[] = [];
    const closes: string[] = [];
    let added = 0;

    function Harness() {
      const [active, setActive] = useState("one");
      return (
        <IqujiDesktopTabStrip
          activeTabId={active}
          addTabLabel="New tab"
          closeTabLabel={(tab) => `Close ${tab.id}`}
          label="Tabs"
          onActiveTabChange={(id) => {
            changes.push(id);
            setActive(id);
          }}
          onTabAdd={() => {
            added += 1;
          }}
          onTabClose={(id) => {
            closes.push(id);
          }}
          tabs={[
            { id: "one", label: "One" },
            { id: "two", label: "Two" },
            { disabled: true, id: "three", label: "Three" },
          ]}
        />
      );
    }

    await mount(<Harness />);
    const tabs = () =>
      Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]'));
    const active = () =>
      required(
        document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]'),
      );

    expect(active().textContent).toContain("One");
    await click(required(tabs()[1]));
    expect(active().textContent).toContain("Two");
    await press(active(), "ArrowRight");
    expect(active().textContent).toContain("One");
    await press(active(), "Delete");
    expect(closes).toEqual(["one"]);
    await click(
      required(
        document.querySelector<HTMLButtonElement>(
          'button[aria-label="Close two"]',
        ),
      ),
    );
    expect(closes).toEqual(["one", "two"]);
    await click(
      required(
        document.querySelector<HTMLButtonElement>(
          'button[aria-label="New tab"]',
        ),
      ),
    );
    expect(added).toBe(1);
    expect(changes).toContain("one");
    expect(changes).toContain("two");
  });

  test("标签条支持前导主视图标签及键盘切换", async () => {
    const events: string[] = [];
    function Harness() {
      const [leadingActive, setLeadingActive] = useState(false);
      const [active, setActive] = useState("right-1");
      return (
        <IqujiDesktopTabStrip
          activeTabId={leadingActive ? null : active}
          label="Unified tabs"
          leadingTab={{
            active: leadingActive,
            id: "main",
            label: "主视图",
            onSelect: () => {
              events.push("main");
              setLeadingActive(true);
            },
          }}
          onActiveTabChange={(id) => {
            events.push(id);
            setLeadingActive(false);
            setActive(id);
          }}
          tabs={[
            { id: "right-1", label: "标签一" },
            { id: "right-2", label: "标签二" },
          ]}
        />
      );
    }

    await mount(<Harness />);
    const tabs = () =>
      Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]'));
    expect(tabs()).toHaveLength(3);
    expect(tabs()[1]?.getAttribute("aria-selected")).toBe("true");
    await press(required(tabs()[1]), "ArrowLeft");
    expect(tabs()[0]?.getAttribute("aria-selected")).toBe("true");
    expect(events).toContain("main");
  });
});
