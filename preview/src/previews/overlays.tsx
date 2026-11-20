import {
  IconButton,
  IqujiButton,
  IqujiConfirmDialog,
  IqujiDialog,
  IqujiDrawer,
  IqujiDropdownMenu,
  IqujiField,
  IqujiFormDialog,
  IqujiInput,
  IqujiOverlayProvider,
  IqujiOverlayScopeProvider,
  IqujiPopover,
  IqujiSearchDialog,
  type IqujiSearchDialogGroup,
  IqujiTooltip,
  IqujiTour,
  type IqujiTourStep,
  useIqujiOverlayContainer,
} from "@iquji-community/web-component";
import { IqujiIcon } from "@iquji-community/web-icons";
import { useRef, useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function DialogDemo() {
  const text = usePreviewText();
  const [open, setOpen] = useState(false);
  return (
    <>
      <IqujiButton onClick={() => setOpen(true)} variant="secondary">
        {text("打开对话框", "Open dialog")}
      </IqujiButton>
      <IqujiDialog
        actions={
          <>
            <IqujiButton onClick={() => setOpen(false)} variant="secondary">
              {text("返回", "Back")}
            </IqujiButton>
            <IqujiButton onClick={() => setOpen(false)}>
              {text("确认", "Confirm")}
            </IqujiButton>
          </>
        }
        closeLabel={text("关闭对话框", "Close dialog")}
        description={text(
          "弹窗主体和操作由调用方组合。",
          "Review your draft before saving.",
        )}
        onOpenChange={setOpen}
        open={open}
        title={text("保存更改？", "Save changes?")}
      >
        <p className="catalog-preview-copy">
          {text(
            "未保存的编辑会保留在草稿中。",
            "Unsaved changes are kept in your draft.",
          )}
        </p>
      </IqujiDialog>
    </>
  );
}

function DrawerDemo() {
  const text = usePreviewText();
  const [open, setOpen] = useState(false);
  return (
    <>
      <IqujiButton onClick={() => setOpen(true)} variant="secondary">
        {text("打开抽屉", "Open drawer")}
      </IqujiButton>
      <IqujiDrawer
        closeLabel={text("关闭详情", "Close details")}
        description={text(
          "展示辅助信息或次级任务。",
          "Review additional details for the selected task.",
        )}
        onOpenChange={setOpen}
        open={open}
        title={text("事项详情", "Task details")}
      >
        <p className="catalog-preview-copy">
          {text("抽屉内容由应用提供。", "The sample task is ready for review.")}
        </p>
      </IqujiDrawer>
    </>
  );
}

function ConfirmDemo() {
  const text = usePreviewText();
  const [open, setOpen] = useState(false);
  return (
    <>
      <IqujiButton onClick={() => setOpen(true)} variant="danger">
        {text("删除草稿", "Delete draft")}
      </IqujiButton>
      <IqujiConfirmDialog
        cancelLabel={text("取消", "Cancel")}
        closeLabel={text("关闭确认框", "Close confirmation")}
        confirmLabel={text("删除", "Delete")}
        description={text(
          "删除后无法恢复此草稿。",
          "Deleting the draft is permanent.",
        )}
        onConfirm={() => setOpen(false)}
        onOpenChange={setOpen}
        open={open}
        title={text("确认删除？", "Delete this draft?")}
      />
    </>
  );
}

function FormDialogDemo() {
  const text = usePreviewText();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <IqujiButton onClick={() => setOpen(true)} variant="secondary">
        {text("打开表单对话框", "Open form dialog")}
      </IqujiButton>
      <IqujiFormDialog
        closeLabel={text("关闭表单", "Close form")}
        collapseLabel={text("收起表单", "Collapse form")}
        description={text(
          "展开或收起时保留同一份编辑内容。",
          "Your edits are kept when the form expands or collapses.",
        )}
        expandLabel={text("展开表单", "Expand form")}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setExpanded(false);
        }}
        open={open}
        title={text("新建项目", "New project")}
      >
        <p className="catalog-preview-copy">
          {text(
            "在这里组合表单字段和操作。",
            "Compose the fields and actions for your form here.",
          )}
        </p>
      </IqujiFormDialog>
    </>
  );
}

function SearchDialogDemo() {
  const text = usePreviewText();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const groups: IqujiSearchDialogGroup[] = [
    {
      id: "workspace",
      label: text("工作区", "Workspace"),
      items: [
        {
          id: "create",
          title: text("新建项目", "New project"),
          keywords: text("创建", "create"),
        },
        {
          id: "settings",
          title: text("打开设置", "Open settings"),
          keywords: text("偏好设置", "preferences"),
        },
      ],
    },
    {
      id: "help",
      label: text("帮助", "Help"),
      items: [
        {
          id: "shortcuts",
          title: text("键盘快捷键", "Keyboard shortcuts"),
          description: text("查看常用操作", "View common shortcuts"),
        },
      ],
    },
  ];
  return (
    <div className="catalog-preview-stack">
      <IqujiButton onClick={() => setOpen(true)} variant="secondary">
        {text("搜索命令", "Search commands")}
      </IqujiButton>
      <p aria-live="polite" className="catalog-preview-copy">
        {text("当前选择：", "Current selection: ")}
        {groups
          .flatMap((group) => group.items)
          .find((item) => item.id === selected)?.title ??
          text("尚未选择", "Nothing selected")}
      </p>
      <IqujiSearchDialog
        closeLabel={text("关闭搜索", "Close search")}
        emptyLabel={text("没有匹配结果", "No results")}
        groups={groups}
        onOpenChange={setOpen}
        onSelect={(id) => {
          setSelected(id);
          setOpen(false);
        }}
        open={open}
        placeholder={text("搜索操作或页面", "Search actions or pages")}
        title={text("快速搜索", "Quick search")}
      />
    </div>
  );
}

function OverlayScopeContent() {
  const text = usePreviewText();
  const container = useIqujiOverlayContainer();
  return (
    <div className="catalog-preview-stack">
      <IqujiDropdownMenu
        ariaLabel={text("局部浮层菜单", "Scoped overlay menu")}
        items={[
          { key: "copy", label: text("复制本地链接", "Copy local link") },
          { key: "archive", label: text("移到归档", "Move to archive") },
        ]}
        trigger={
          <IqujiButton variant="secondary">
            {text("打开局部菜单", "Open scoped menu")}
          </IqujiButton>
        }
      />
      <span className="catalog-preview-copy">
        {text("门户容器：", "Portal container: ")}
        {container
          ? text("已绑定本地预览区域", "Attached to this preview")
          : text("等待宿主提供容器", "Waiting for a container")}
      </span>
    </div>
  );
}

function OverlayScopeDemo() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <IqujiOverlayProvider>
      <div className="catalog-preview-overlay-scope" ref={setContainer}>
        <IqujiOverlayScopeProvider container={container}>
          <OverlayScopeContent />
        </IqujiOverlayScopeProvider>
      </div>
    </IqujiOverlayProvider>
  );
}

function AnchoredPopoverDemo() {
  const text = usePreviewText();
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  return (
    <div className="catalog-demo-stack">
      <div ref={setAnchor}>{text("独立锚定区域", "Separate anchor area")}</div>
      <IqujiPopover
        anchor={anchor}
        align="start"
        popupStyle={{ maxWidth: 260 }}
        trigger={
          <IqujiButton variant="secondary">
            {text("查看锚定说明", "Show anchor details")}
          </IqujiButton>
        }
      >
        <div className="catalog-popover-content">
          <strong>{text("独立锚点", "Separate anchor")}</strong>
          <span>
            {text(
              "浮层围绕指定区域定位，触发按钮保留打开、关闭和焦点返回语义。",
              "The popover is positioned next to the anchor. The button opens and closes it and receives focus when it closes.",
            )}
          </span>
        </div>
      </IqujiPopover>
    </div>
  );
}

function TourDemo() {
  const text = usePreviewText();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const saveButton = useRef<HTMLButtonElement>(null);
  const result = useRef<HTMLParagraphElement>(null);
  const steps: [IqujiTourStep, IqujiTourStep, IqujiTourStep] = [
    {
      id: "name",
      target: () => input.current,
      title: text("给清单起个名字", "Name the checklist"),
      description: text(
        "在高亮输入框中填写名称，例如“示例清单”，然后继续。",
        "Enter a name such as “Sample checklist” in the highlighted field, then continue.",
      ),
    },
    {
      id: "save",
      target: () => saveButton.current,
      title: text("保存刚才的填写", "Save the checklist"),
      description: text(
        "点击高亮的“保存清单”按钮，保存成功后教程会继续。",
        "Click the highlighted Save checklist button to continue the tour.",
      ),
    },
    {
      id: "result",
      target: () => result.current,
      title: text("查看保存结果", "Review your checklist"),
      description: text(
        "这里会显示刚保存的名称。可以结束教程并继续编辑。",
        "The saved name appears here. Finish the tour to continue editing.",
      ),
    },
  ];
  return (
    <div className="catalog-preview-stack">
      <IqujiButton
        onClick={() => {
          setStepIndex(0);
          setOpen(true);
          input.current?.focus();
        }}
        variant="secondary"
      >
        {text("体验浮层教程", "Start guided tour")}
      </IqujiButton>
      <IqujiField label={text("清单名称", "Checklist name")}>
        <IqujiInput
          onChange={(event) => setName(event.currentTarget.value)}
          placeholder={text("例如：示例清单", "For example, Sample checklist")}
          ref={input}
          value={name}
        />
      </IqujiField>
      <IqujiButton
        disabled={!name.trim()}
        onClick={() => {
          setSavedName(name.trim());
          if (open) setStepIndex(2);
        }}
        ref={saveButton}
      >
        {text("保存清单", "Save checklist")}
      </IqujiButton>
      <p aria-live="polite" className="catalog-preview-copy" ref={result}>
        {savedName
          ? text(`已保存“${savedName}”`, `Saved “${savedName}”`)
          : text("保存后在这里查看结果", "Save the checklist to see it here")}
      </p>
      <IqujiTour
        actions={
          stepIndex === 0 ? (
            <IqujiButton
              disabled={!name.trim()}
              onClick={() => setStepIndex(1)}
            >
              {text("下一步", "Next")}
            </IqujiButton>
          ) : stepIndex === 2 ? (
            <IqujiButton onClick={() => setOpen(false)}>
              {text("完成教程", "Finish tour")}
            </IqujiButton>
          ) : undefined
        }
        closeLabel={text("退出教程，保留填写", "Exit tour and keep edits")}
        onClose={() => setOpen(false)}
        open={open}
        progress={text(
          `第 ${stepIndex + 1} 步，共 3 步`,
          `Step ${stepIndex + 1} of 3`,
        )}
        step={steps[stepIndex] ?? steps[0]}
      />
    </div>
  );
}

function TooltipExample() {
  const text = usePreviewText();
  return (
    <IqujiTooltip
      content={text("刷新当前数据", "Refresh current data")}
      placement="top"
    >
      <IconButton
        icon={<IqujiIcon decorative name="refresh" />}
        label={text("刷新", "Refresh")}
      />
    </IqujiTooltip>
  );
}

function PopoverExample() {
  const text = usePreviewText();
  return (
    <>
      <IqujiPopover
        popupStyle={{ maxWidth: 260 }}
        trigger={
          <IqujiButton variant="secondary">
            {text("查看说明", "Show details")}
          </IqujiButton>
        }
      >
        <div className="catalog-popover-content">
          <strong>{text("自动保存", "Autosave")}</strong>
          <span>
            {text(
              "编辑内容每隔几秒会保存在本地。",
              "Changes are saved locally every few seconds.",
            )}
          </span>
        </div>
      </IqujiPopover>
      <AnchoredPopoverDemo />
    </>
  );
}

function DropdownMenuExample() {
  const text = usePreviewText();
  return (
    <IqujiDropdownMenu
      ariaLabel={text("文档操作", "Document actions")}
      items={[
        {
          key: "rename",
          label: text("重命名", "Rename"),
          icon: <IqujiIcon decorative name="pencil" />,
          shortcut: "⌘R",
        },
        {
          key: "copy",
          label: text("复制链接", "Copy link"),
          icon: <IqujiIcon decorative name="link" />,
        },
        { key: "divider", kind: "separator" },
        {
          key: "archive",
          label: text("移到归档", "Move to archive"),
          disabled: true,
        },
      ]}
      trigger={
        <IqujiButton variant="secondary">
          {text("更多操作", "More actions")}
        </IqujiButton>
      }
    />
  );
}

export const overlayPreviews: readonly ComponentPreview[] = [
  {
    id: "tooltip",
    name: "IqujiTooltip",
    category: "浮层",
    description: "为图标等精简控件补充上下文说明。",
    keywords: "文字提示 hover focus",
    render: () => <TooltipExample />,
  },
  {
    id: "popover",
    name: "IqujiPopover",
    category: "浮层",
    description: "围绕触发操作显示轻量补充内容。",
    keywords: "气泡卡片 浮层",
    render: () => <PopoverExample />,
  },
  {
    id: "tour",
    name: "IqujiTour",
    category: "浮层",
    description: "聚光高亮真实控件，通过填写、保存与结果三步体验新手教程。",
    keywords: "新手教程 引导 高亮 聚光 spotlight onboarding tour",
    render: () => <TourDemo />,
  },
  {
    id: "dropdown-menu",
    name: "IqujiDropdownMenu",
    category: "浮层",
    description: "组织与当前对象相关的操作菜单。",
    keywords: "下拉菜单 shortcut separator submenu",
    render: () => <DropdownMenuExample />,
  },
  {
    id: "dialog",
    name: "IqujiDialog",
    category: "浮层",
    description: "承载重要且需要用户决策的内容。",
    keywords: "对话框 modal 弹窗",
    render: () => <DialogDemo />,
  },
  {
    id: "drawer",
    name: "IqujiDrawer",
    category: "浮层",
    description: "从侧边展示可延后处理的详细内容。",
    keywords: "抽屉 面板",
    render: () => <DrawerDemo />,
  },
  {
    id: "confirm-dialog",
    name: "IqujiConfirmDialog",
    category: "浮层",
    description: "为不可逆或重要操作提供清晰的确认步骤。",
    keywords: "确认框 危险 删除",
    render: () => <ConfirmDemo />,
  },
  {
    id: "form-dialog",
    name: "IqujiFormDialog",
    category: "浮层",
    description: "为较复杂的编辑表单提供可展开空间。",
    keywords: "表单对话框 resize expand",
    render: () => <FormDialogDemo />,
  },
  {
    id: "search-dialog",
    name: "IqujiSearchDialog",
    category: "浮层",
    description: "支持键盘导航的分组快速搜索。",
    keywords: "搜索弹窗 command palette",
    render: () => <SearchDialogDemo />,
  },
  {
    id: "overlay-scope",
    name: "浮层提供器与局部容器",
    category: "浮层",
    description: "将菜单浮层限制在指定容器中，并统一管理共享层级。",
    keywords: "overlay provider scope portal container",
    render: () => <OverlayScopeDemo />,
  },
];
