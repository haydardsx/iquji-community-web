import {
  AppShell,
  IconButton,
  IqujiButton,
  IqujiButtonLink,
  IqujiDataTable,
  IqujiEmptyState,
  IqujiLoadingState,
  IqujiPageHeading,
  IqujiPanel,
  StatusBadge,
} from "@iquji-web/web-component";
import { IqujiIcon } from "@iquji-web/web-icons";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";

function DataTablePreview() {
  const [empty, setEmpty] = useState(false);
  const [selected, setSelected] = useState("尚未选择");
  return (
    <div className="catalog-preview-stack">
      <IqujiButton
        variant="secondary"
        onClick={() => setEmpty((value) => !value)}
      >
        {empty ? "显示示例数据" : "查看空状态"}
      </IqujiButton>
      <IqujiDataTable
        label="成员示例"
        columns={[
          { accessorKey: "name", header: "名称" },
          { accessorKey: "status", header: "状态" },
        ]}
        data={
          empty
            ? []
            : [
                { id: "one", name: "设计助手", status: "待配置" },
                { id: "two", name: "审阅助手", status: "已配置" },
              ]
        }
        rowKey={(row) => row.id}
        onRowClick={(row) => setSelected(row.name)}
      />
      <p role="status">{selected}</p>
    </div>
  );
}

export const basicPreviews: readonly ComponentPreview[] = [
  {
    id: "data-table",
    name: "IqujiDataTable",
    category: "基础",
    description: "展示数据、空状态及键盘可操作的行选择。",
    keywords: "IqujiDataTable table 数据表",
    render: () => <DataTablePreview />,
  },
  {
    id: "button",
    name: "IqujiButton",
    category: "基础",
    description: "用于提交、确认和页面级操作，支持多种语义样式。",
    keywords: "按钮 primary secondary ghost danger loading disabled",
    render: () => (
      <div className="catalog-preview-stack">
        <div className="catalog-preview-grid">
          <IqujiButton>保存更改</IqujiButton>
          <IqujiButton variant="secondary">次要操作</IqujiButton>
          <IqujiButton variant="danger">删除项目</IqujiButton>
          <IqujiButton disabled>不可用</IqujiButton>
          <IqujiButton loading>正在保存</IqujiButton>
        </div>
        <p className="catalog-preview-copy">
          默认操作、次要操作、危险操作与加载状态。
        </p>
      </div>
    ),
  },
  {
    id: "icon-button",
    name: "IconButton",
    category: "基础",
    description: "只显示图标的紧凑操作，必须提供可访问名称。",
    keywords: "icon-button 图标按钮 tooltip accessible label",
    render: () => (
      <div className="catalog-preview-stack">
        <div className="catalog-preview-grid">
          <IconButton
            icon={<IqujiIcon decorative name="settings" />}
            label="设置"
          />
          <IconButton
            icon={<IqujiIcon decorative name="search" />}
            label="搜索"
          />
          <IconButton
            disabled
            icon={<IqujiIcon decorative name="trash" />}
            label="删除"
          />
        </div>
        <p className="catalog-preview-copy">悬停图标可查看操作名称。</p>
      </div>
    ),
  },
  {
    id: "button-link",
    name: "IqujiButtonLink",
    category: "基础",
    description: "保留链接导航语义，同时使用操作按钮外观。",
    keywords: "link navigation href disabled 链接",
    render: () => (
      <div className="catalog-preview-grid">
        <IqujiButtonLink href="#docs" variant="secondary">
          查看规范
        </IqujiButtonLink>
        <IqujiButtonLink
          aria-disabled="true"
          href="#disabled"
          variant="primary"
        >
          不可用链接
        </IqujiButtonLink>
      </div>
    ),
  },
  {
    id: "status-badge",
    name: "StatusBadge",
    category: "基础",
    description: "呈现简短、非交互的状态标记。",
    keywords: "status badge tone neutral positive warning critical",
    render: () => (
      <div className="catalog-preview-grid">
        <StatusBadge>草稿</StatusBadge>
        <StatusBadge tone="positive">已发布</StatusBadge>
        <StatusBadge tone="warning">待处理</StatusBadge>
        <StatusBadge tone="critical">失败</StatusBadge>
      </div>
    ),
  },
  {
    id: "panel",
    name: "IqujiPanel",
    category: "基础",
    description: "为局部内容提供共享面板结构。",
    keywords: "panel section header 面板容器",
    render: () => (
      <IqujiPanel header="项目概览" style={{ maxWidth: 520 }}>
        <div style={{ padding: 20 }}>
          <p style={{ marginTop: 0 }}>为共享内容提供一致的表面和边界。</p>
          <IqujiButton variant="secondary">打开项目</IqujiButton>
        </div>
      </IqujiPanel>
    ),
  },
  {
    id: "page-heading",
    name: "IqujiPageHeading",
    category: "基础",
    description: "组合页面提示、主标题、摘要和侧边操作。",
    keywords: "heading title kicker summary header 页面标题",
    render: () => (
      <IqujiPageHeading
        aside={<IqujiButton variant="secondary">新建条目</IqujiButton>}
        kicker="工作区 / 事项"
        summary="查看项目中的工作进展与负责人。"
        title="工作事项"
      />
    ),
  },
  {
    id: "empty-state",
    name: "IqujiEmptyState",
    category: "基础",
    description: "用明确说明和下一步操作表达空内容。",
    keywords: "empty state 空状态 no data action",
    render: () => (
      <IqujiEmptyState
        action={<IqujiButton variant="secondary">创建第一条</IqujiButton>}
        body="创建事项后，它们会显示在这里。"
        icon={<IqujiIcon decorative name="file-search" size={24} />}
        title="暂时没有事项"
      />
    ),
  },
  {
    id: "loading-state",
    name: "IqujiLoadingState",
    category: "基础",
    description: "为等待中的内容提供可访问的忙碌反馈。",
    keywords: "loading state progress status 加载",
    render: () => <IqujiLoadingState label="正在载入项目" />,
  },
  {
    id: "app-shell",
    name: "AppShell",
    category: "布局与桌面",
    description: "使用分组导航组织品牌、侧栏、页头和主体内容。",
    keywords: "shell app navigation groups layout 应用框架 分组",
    render: () => (
      <AppShell
        brand={<strong>团队空间</strong>}
        header={<strong>工作台</strong>}
        navigationLabel="主导航"
        navigation={[]}
        navigationGroups={[
          {
            id: "workspace",
            label: "工作台",
            items: [
              {
                id: "overview",
                label: "概览",
                href: "#overview",
                active: true,
              },
            ],
          },
          {
            id: "manage",
            label: "管理",
            items: [
              { id: "tasks", label: "事项", href: "#tasks" },
              { id: "disabled", label: "未开放", disabled: true },
            ],
          },
        ]}
        skipLinkLabel="跳到主内容"
      >
        <div style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>应用内容</h2>
          <p>侧栏与工作区框架由应用传入。</p>
        </div>
      </AppShell>
    ),
  },
];
