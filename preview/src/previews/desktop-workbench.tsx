import {
  IconButton,
  IqujiDesktopNewTabPage,
  IqujiDesktopWorkbench,
} from "@iquji-community/web-component";
import { IqujiIcon } from "@iquji-community/web-icons";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function usePanelChoices() {
  const text = usePreviewText();
  return [
    {
      id: "notes",
      label: text("笔记", "Notes"),
      icon: <IqujiIcon decorative name="book-open" />,
      content: text(
        "记录下一次评审需要讨论的问题。",
        "Discuss open questions at the next review.",
      ),
    },
    {
      id: "activity",
      label: text("活动", "Activity"),
      icon: <IqujiIcon decorative name="activity" />,
      content: text("已保存项目笔记。", "Project notes saved."),
    },
  ];
}

function NewTabPageExample() {
  const text = usePreviewText();
  const choices = usePanelChoices();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <>
      <IqujiDesktopNewTabPage
        heading={text("打开面板", "Open a panel")}
        items={choices}
        onSelect={setSelected}
      />
      <p aria-live="polite" className="catalog-preview-copy">
        {choices.find((choice) => choice.id === selected)?.content}
      </p>
    </>
  );
}

function DesktopWorkbenchExample() {
  const text = usePreviewText();
  const choices = usePanelChoices();
  const [openPanels, setOpenPanels] = useState(["notes"]);
  const [active, setActive] = useState("notes");
  const [rightOpen, setRightOpen] = useState(true);
  const [summary, setSummary] = useState(false);
  const [page, setPage] = useState("plan");
  const isPlan = page === "plan";
  const planTitle = text("评审计划", "Review plan");
  const checklistTitle = text("评审清单", "Review checklist");
  const newTab = "new-tab";
  const openChoice = (id: string) => {
    setOpenPanels((panels) =>
      [...new Set([...panels, id])].filter((panel) => panel !== newTab),
    );
    setActive(id);
  };
  const tabs = openPanels.map((id) => {
    const choice = choices.find((item) => item.id === id);
    if (choice)
      return {
        ...choice,
        content: <div style={{ padding: 16 }}>{choice.content}</div>,
      };
    return {
      id: newTab,
      label: text("新标签页", "New tab"),
      icon: <IqujiIcon decorative name="plus" />,
      content: (
        <IqujiDesktopNewTabPage
          heading={text("打开面板", "Open a panel")}
          items={choices}
          onSelect={openChoice}
        />
      ),
    };
  });
  const showNewTab = () => {
    setOpenPanels((panels) =>
      panels.includes(newTab) ? panels : [...panels, newTab],
    );
    setActive(newTab);
    setRightOpen(true);
  };
  return (
    <div style={{ height: 360, overflow: "hidden" }}>
      <IqujiDesktopWorkbench
        activeRightTabId={active}
        addRightTabLabel={text("新增标签", "Add tab")}
        center={
          <div style={{ padding: 16 }}>
            <h3>{isPlan ? planTitle : checklistTitle}</h3>
            {summary && (
              <p>
                {text(
                  "本次评审包含两节内容。",
                  "The review covers two sections.",
                )}
              </p>
            )}
          </div>
        }
        centerActions={
          <IconButton
            compact
            aria-pressed={summary}
            icon={<IqujiIcon decorative name="list-details" />}
            label={text("摘要", "Summary")}
            onClick={() => setSummary(!summary)}
          />
        }
        centerIcon={<IqujiIcon decorative name="folder" />}
        centerTitle={text("文档", "Document")}
        centerTabLabel={text("文档", "Document")}
        centerMinWidth={160}
        closeRightTabLabel={(tab) =>
          text(`关闭 ${String(tab.label)}`, `Close ${String(tab.label)}`)
        }
        defaultLeftWidth={140}
        defaultRightWidth={220}
        enterFullscreenLabel={text("全屏查看", "Full view")}
        exitFullscreenLabel={text("退出全屏", "Exit full view")}
        historyNavigation={{
          backLabel: text("上一页", "Previous page"),
          canGoBack: !isPlan,
          canGoForward: isPlan,
          forwardLabel: text("下一页", "Next page"),
          onBack: () => setPage("plan"),
          onForward: () => setPage("checklist"),
        }}
        railLabel={text("页面", "Pages")}
        railShowDivider
        railItems={[
          {
            id: "plan",
            label: planTitle,
            icon: <IqujiIcon decorative name="home" />,
            active: isPlan,
            onSelect: () => setPage("plan"),
          },
          {
            id: "checklist",
            label: checklistTitle,
            icon: <IqujiIcon decorative name="check" />,
            active: !isPlan,
            onSelect: () => setPage("checklist"),
          },
        ]}
        left={<div style={{ padding: 12 }}>{text("目录", "Contents")}</div>}
        leftMinWidth={80}
        leftResizeLabel={text("调整目录宽度", "Resize contents")}
        onActiveRightTabChange={setActive}
        onRightOpenChange={(open) => {
          if (open && !tabs.length) showNewTab();
          else setRightOpen(open);
        }}
        onRightTabAdd={showNewTab}
        onRightTabClose={(id) => {
          const next = openPanels.filter((panel) => panel !== id);
          setOpenPanels(next);
          if (active === id) setActive(next.at(-1) ?? newTab);
          if (!next.length) setRightOpen(false);
        }}
        restoreSplitLabel={text("恢复分栏", "Restore split view")}
        rightAvailable
        rightMinWidth={120}
        rightOpen={rightOpen}
        rightResizeLabel={text("调整面板宽度", "Resize panel")}
        rightTabs={tabs}
        rightTabsLabel={text("面板标签", "Panel tabs")}
        rightToggleLabel={text("切换面板", "Toggle panel")}
        sidebarToggleLabel={text("切换目录", "Toggle contents")}
      />
    </div>
  );
}

export const desktopWorkbenchPreviews: readonly ComponentPreview[] = [
  {
    id: "desktop-workbench",
    name: "IqujiDesktopWorkbench",
    category: "布局与桌面",
    description: "折叠或调整左右栏，添加标签并在分栏和全屏视图间切换。",
    keywords: "desktop workbench tabs fullscreen three pane 三栏工作台",
    render: () => <DesktopWorkbenchExample />,
  },
  {
    id: "desktop-new-tab",
    name: "IqujiDesktopNewTabPage",
    category: "布局与桌面",
    description: "在新标签页的卡片列表中选择要打开的面板。",
    keywords: "desktop new tab page panel 新标签页 面板",
    render: () => <NewTabPageExample />,
  },
];
