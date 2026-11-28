import { afterEach, describe, expect, test } from "bun:test";
import { IqujiIcon } from "@iquji-community/web-icons";
import { act, type ReactNode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiButton } from "./index.js";
import { IqujiDesktopWorkbench } from "./desktop-workbench.js";

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

describe("IqujiDesktopWorkbench 四态三分布局", () => {
  test("在形态 1-4 之间切换并保留输入草稿与操作区位置", async () => {
    function Harness() {
      const [rightOpen, setRightOpen] = useState(false);
      const [rightFullscreen, setRightFullscreen] = useState(false);
      const [fullscreenTarget, setFullscreenTarget] = useState<
        "center" | "right"
      >("right");
      const [tabs, setTabs] = useState([
        {
          id: "agents",
          label: "子智能体",
          content: <input aria-label="右栏草稿" defaultValue="" />,
        },
        {
          id: "notes",
          label: "说明文档",
          content: <div>说明正文</div>,
        },
      ]);
      const [activeTab, setActiveTab] = useState<string | null>("agents");
      return (
        <IqujiDesktopWorkbench
          activeRightTabId={activeTab}
          addRightTabLabel="新增标签"
          center={<input aria-label="中心草稿" defaultValue="" />}
          centerActions={
            <IqujiButton compact variant="ghost">
              文档动作
            </IqujiButton>
          }
          centerIcon={<IqujiIcon decorative name="folder" />}
          centerTabLabel="项目主视图"
          centerTitle={<span>项目主视图<button type="button">编辑标题</button></span>}
          closeRightTabLabel={(tab) => `关闭 ${String(tab.label)}`}
          enterFullscreenLabel="全屏查看"
          exitFullscreenLabel="退出全屏视图"
          restoreSplitLabel="恢复分屏视图"
          fullscreenTarget={fullscreenTarget}
          historyNavigation={{
            backLabel: "后退",
            canGoBack: true,
            canGoForward: false,
            forwardLabel: "前进",
            onBack: () => undefined,
            onForward: () => undefined,
          }}
          left={<div>左侧目录</div>}
          onActiveRightTabChange={setActiveTab}
          onFullscreenTargetChange={setFullscreenTarget}
          onRightFullscreenChange={setRightFullscreen}
          onRightOpenChange={setRightOpen}
          onRightTabAdd={() => {
            const nextId = `tab-${tabs.length + 1}`;
            setTabs((prev) => [
              ...prev,
              { id: nextId, label: "新标签", content: <div>新内容</div> },
            ]);
            setActiveTab(nextId);
          }}
          onRightTabClose={(id) => {
            const next = tabs.filter((item) => item.id !== id);
            setTabs(next);
            if (activeTab === id) setActiveTab(next[0]?.id ?? null);
            if (next.length === 0) setRightOpen(false);
          }}
          railItems={[
            {
              active: true,
              icon: <IqujiIcon decorative name="home" />,
              id: "home",
              label: "首页",
            },
          ]}
          rightFullscreen={rightFullscreen}
          rightOpen={rightOpen}
          rightTabs={tabs}
          rightToggleLabel="切换右栏"
          sidebarToggleLabel="切换左栏"
          windowControlsSpace={80}
        />
      );
    }

    await mount(<Harness />);

    // 形态 1：左 + 中，右栏折叠，操作按钮在顶栏，panel-left 在左上角
    const singleTitle = required(
      document.querySelector(".iquji-desktop-workbench__title-single"),
    );
    expect(singleTitle.textContent).toContain("文档动作");
    const centerActionButton = required(
      Array.from(singleTitle.querySelectorAll("button")).find((button) =>
        button.textContent?.includes("文档动作"),
      ),
    );
    expect(
      document
        .querySelector(".iquji-workbench__pane--right")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
    const centerInput = required(
      document.querySelector<HTMLInputElement>('[aria-label="中心草稿"]'),
    );
    centerInput.value = "中心内容";

    // 进入形态 2：左 + 中 + 右多标签，且保持中心栏动作按钮 DOM 节点稳定
    await click(
      required(
        document.querySelector<HTMLButtonElement>(
          'button[aria-label="切换右栏"]',
        ),
      ),
    );
    expect(centerActionButton.isConnected).toBe(true);
    expect(
      document.querySelector(".iquji-desktop-workbench__title-center")
        ?.textContent,
    ).toContain("文档动作");
    expect(
      document.querySelector(".iquji-desktop-workbench__title-right"),
    ).not.toBeNull();
    const rightInput = required(
      document.querySelector<HTMLInputElement>('[aria-label="右栏草稿"]'),
    );
    rightInput.value = "右栏输入";
    expect(
      document.querySelector('button[aria-label="新增标签"]'),
    ).not.toBeNull();

    // 进入形态 3：右栏全屏且当前显示右栏标签
    await click(
      required(
        document.querySelector<HTMLButtonElement>(
          'button[aria-label="全屏查看"]',
        ),
      ),
    );
    expect(
      document.querySelector(".iquji-desktop-workbench__title-unified"),
    ).not.toBeNull();
    expect(
      document.querySelector(".iquji-desktop-workbench__exit-fullscreen")
        ?.textContent,
    ).toContain("退出全屏视图");
    expect(
      document
        .querySelector(".iquji-workbench__pane--center")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(
      document.querySelector(
        ".iquji-desktop-workbench__center-floating-actions",
      ),
    ).toBeNull();

    // 进入形态 4：全屏态下切回主视图标签，中间栏动作移入正文右上角
    const leadingTab = required(
      document.querySelector<HTMLButtonElement>(
        ".iquji-desktop-tab--leading button",
      ),
    );
    expect(leadingTab.textContent).toBe("项目主视图");
    expect(leadingTab.querySelector("button")).toBeNull();
    await click(required(leadingTab.querySelector<HTMLElement>(".iquji-desktop-tab__label")));
    expect(leadingTab.getAttribute("aria-selected")).toBe("true");
    expect(
      document
        .querySelector(".iquji-workbench__pane--right")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(
      document.querySelector(
        ".iquji-desktop-workbench__center-floating-actions",
      )?.textContent,
    ).toContain("文档动作");
    expect(
      document.querySelector<HTMLInputElement>('[aria-label="中心草稿"]')?.value,
    ).toBe("中心内容");

    // 退出全屏回到形态 2，草稿仍保留
    await click(
      required(
        document.querySelector<HTMLButtonElement>(
          '[aria-label="恢复分屏视图"]',
        ),
      ),
    );
    expect(
      document.querySelector(".iquji-desktop-workbench__title-right"),
    ).not.toBeNull();
    expect(
      document.querySelector<HTMLInputElement>('[aria-label="右栏草稿"]')?.value,
    ).toBe("右栏输入");
  });
});
