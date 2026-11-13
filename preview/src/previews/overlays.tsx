import {
  IconButton,
  IqujiButton,
  IqujiConfirmDialog,
  IqujiDialog,
  IqujiDrawer,
  IqujiDropdownMenu,
  IqujiFormDialog,
  IqujiOverlayProvider,
  IqujiOverlayScopeProvider,
  IqujiPopover,
  IqujiSearchDialog,
  IqujiTooltip,
  useIqujiOverlayContainer,
} from "@iquji-cloud/web-component";
import { IqujiIcon } from "@iquji-cloud/web-icons";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IqujiButton onClick={() => setOpen(true)} variant="secondary">
        打开对话框
      </IqujiButton>
      <IqujiDialog
        actions={
          <>
            <IqujiButton onClick={() => setOpen(false)} variant="secondary">
              返回
            </IqujiButton>
            <IqujiButton onClick={() => setOpen(false)}>确认</IqujiButton>
          </>
        }
        closeLabel="关闭对话框"
        description="弹窗主体和操作由调用方组合。"
        onOpenChange={setOpen}
        open={open}
        title="保存更改？"
      >
        <p className="catalog-preview-copy">未保存的编辑会保留在草稿中。</p>
      </IqujiDialog>
    </>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IqujiButton onClick={() => setOpen(true)} variant="secondary">
        打开抽屉
      </IqujiButton>
      <IqujiDrawer
        closeLabel="关闭详情"
        description="展示辅助信息或次级任务。"
        onOpenChange={setOpen}
        open={open}
        title="事项详情"
      >
        <p className="catalog-preview-copy">抽屉内容由应用提供。</p>
      </IqujiDrawer>
    </>
  );
}

function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IqujiButton onClick={() => setOpen(true)} variant="danger">
        删除草稿
      </IqujiButton>
      <IqujiConfirmDialog
        cancelLabel="取消"
        closeLabel="关闭确认框"
        confirmLabel="删除"
        description="删除后无法恢复此草稿。"
        onConfirm={() => setOpen(false)}
        onOpenChange={setOpen}
        open={open}
        title="确认删除？"
      />
    </>
  );
}

function FormDialogDemo() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <IqujiButton onClick={() => setOpen(true)} variant="secondary">
        打开表单对话框
      </IqujiButton>
      <IqujiFormDialog
        closeLabel="关闭表单"
        collapseLabel="收起表单"
        description="展开或收起时保留同一份编辑内容。"
        expandLabel="展开表单"
        expanded={expanded}
        onExpandedChange={setExpanded}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setExpanded(false);
        }}
        open={open}
        title="新建项目"
      >
        <p className="catalog-preview-copy">在这里组合表单字段和操作。</p>
      </IqujiFormDialog>
    </>
  );
}

function SearchDialogDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("尚未选择");
  return (
    <div className="catalog-preview-stack">
      <IqujiButton onClick={() => setOpen(true)} variant="secondary">
        搜索命令
      </IqujiButton>
      <p aria-live="polite" className="catalog-preview-copy">
        当前选择：{selected}
      </p>
      <IqujiSearchDialog
        closeLabel="关闭搜索"
        emptyLabel="没有匹配结果"
        groups={[
          {
            id: "workspace",
            label: "工作区",
            items: [
              { id: "create", title: "新建项目", keywords: "创建 project" },
              { id: "settings", title: "打开设置", keywords: "偏好设置" },
            ],
          },
          {
            id: "help",
            label: "帮助",
            items: [
              {
                id: "shortcuts",
                title: "键盘快捷键",
                description: "查看常用操作",
              },
            ],
          },
        ]}
        onOpenChange={setOpen}
        onSelect={(id) => {
          setSelected(id);
          setOpen(false);
        }}
        open={open}
        placeholder="搜索操作或页面"
        title="快速搜索"
      />
    </div>
  );
}

function OverlayScopeContent() {
  const container = useIqujiOverlayContainer();
  return (
    <div className="catalog-preview-stack">
      <IqujiDropdownMenu
        ariaLabel="局部浮层菜单"
        items={[
          { key: "copy", label: "复制本地链接" },
          { key: "archive", label: "移到归档" },
        ]}
        trigger={<IqujiButton variant="secondary">打开局部菜单</IqujiButton>}
      />
      <span className="catalog-preview-copy">
        门户容器：{container ? "已绑定本地预览区域" : "等待宿主提供容器"}
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
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  return (
    <div className="catalog-demo-stack">
      <div ref={setAnchor}>独立锚定区域</div>
      <IqujiPopover
        anchor={anchor}
        align="start"
        popupStyle={{ maxWidth: 260 }}
        trigger={<IqujiButton variant="secondary">查看锚定说明</IqujiButton>}
      >
        <div className="catalog-popover-content">
          <strong>独立锚点</strong>
          <span>
            浮层围绕指定区域定位，触发按钮保留打开、关闭和焦点返回语义。
          </span>
        </div>
      </IqujiPopover>
    </div>
  );
}

export const overlayPreviews: readonly ComponentPreview[] = [
  {
    id: "tooltip",
    name: "IqujiTooltip",
    category: "浮层",
    description: "为图标等精简控件补充上下文说明。",
    keywords: "文字提示 hover focus",
    render: () => (
      <IqujiTooltip content="刷新当前数据" placement="top">
        <IconButton
          icon={<IqujiIcon decorative name="refresh" />}
          label="刷新"
        />
      </IqujiTooltip>
    ),
  },
  {
    id: "popover",
    name: "IqujiPopover",
    category: "浮层",
    description: "围绕触发操作显示轻量补充内容。",
    keywords: "气泡卡片 浮层",
    render: () => (
      <>
        <IqujiPopover
          popupStyle={{ maxWidth: 260 }}
          trigger={<IqujiButton variant="secondary">查看说明</IqujiButton>}
        >
          <div className="catalog-popover-content">
            <strong>自动保存</strong>
            <span>编辑内容每隔几秒会保存在本地。</span>
          </div>
        </IqujiPopover>
        <AnchoredPopoverDemo />
      </>
    ),
  },
  {
    id: "dropdown-menu",
    name: "IqujiDropdownMenu",
    category: "浮层",
    description: "组织与当前对象相关的操作菜单。",
    keywords: "下拉菜单 shortcut separator submenu",
    render: () => (
      <IqujiDropdownMenu
        ariaLabel="文档操作"
        items={[
          {
            key: "rename",
            label: "重命名",
            icon: <IqujiIcon decorative name="pencil" />,
            shortcut: "⌘R",
          },
          {
            key: "copy",
            label: "复制链接",
            icon: <IqujiIcon decorative name="link" />,
          },
          { key: "divider", kind: "separator" },
          { key: "archive", label: "移到归档", disabled: true },
        ]}
        trigger={<IqujiButton variant="secondary">更多操作</IqujiButton>}
      />
    ),
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
    name: "浮层 Provider 与局部容器",
    category: "浮层",
    description: "将菜单浮层限制在注入的容器中，并通过 Provider 管理共享层级。",
    keywords: "overlay provider scope portal container",
    render: () => <OverlayScopeDemo />,
  },
];
