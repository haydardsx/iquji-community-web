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
} from "@iquji-community/web-component";
import { IqujiIcon } from "@iquji-community/web-icons";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function DataTablePreview() {
  const text = usePreviewText();
  const [empty, setEmpty] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const rows = [
    {
      id: "one",
      name: text("设计助手", "Design assistant"),
      status: text("待配置", "Pending setup"),
    },
    {
      id: "two",
      name: text("审阅助手", "Review assistant"),
      status: text("已配置", "Configured"),
    },
  ];
  return (
    <div className="catalog-preview-stack">
      <IqujiButton
        variant="secondary"
        onClick={() => setEmpty((value) => !value)}
      >
        {empty
          ? text("显示示例数据", "Show sample data")
          : text("查看空状态", "Show empty state")}
      </IqujiButton>
      <IqujiDataTable
        label={text("成员示例", "Sample members")}
        columns={[
          { accessorKey: "name", header: text("名称", "Name") },
          { accessorKey: "status", header: text("状态", "Status") },
        ]}
        data={empty ? [] : rows}
        emptyTitle={text("暂无数据", "No data yet")}
        emptyBody={text(
          "当前筛选没有结果。",
          "No rows match the current filter.",
        )}
        rowKey={(row) => row.id}
        onRowClick={(row) => setSelected(row.id)}
      />
      <p role="status">
        {rows.find((row) => row.id === selected)?.name ??
          text("尚未选择", "Nothing selected")}
      </p>
    </div>
  );
}

function ButtonExample() {
  const text = usePreviewText();
  return (
    <div className="catalog-preview-stack">
      <div className="catalog-preview-grid">
        <IqujiButton>{text("保存更改", "Save changes")}</IqujiButton>
        <IqujiButton variant="secondary">
          {text("次要操作", "Secondary action")}
        </IqujiButton>
        <IqujiButton variant="danger">
          {text("删除项目", "Delete project")}
        </IqujiButton>
        <IqujiButton disabled>{text("不可用", "Unavailable")}</IqujiButton>
        <IqujiButton loading>{text("正在保存", "Saving")}</IqujiButton>
      </div>
      <p className="catalog-preview-copy">
        {text(
          "默认操作、次要操作、危险操作与加载状态。",
          "Primary and secondary actions, destructive actions, and loading states.",
        )}
      </p>
    </div>
  );
}

function IconButtonExample() {
  const text = usePreviewText();
  return (
    <div className="catalog-preview-stack">
      <div className="catalog-preview-grid">
        <IconButton
          icon={<IqujiIcon decorative name="settings" />}
          label={text("设置", "Settings")}
        />
        <IconButton
          icon={<IqujiIcon decorative name="search" />}
          label={text("搜索", "Search")}
        />
        <IconButton
          disabled
          icon={<IqujiIcon decorative name="trash" />}
          label={text("删除", "Delete")}
        />
      </div>
      <p className="catalog-preview-copy">
        {text(
          "悬停图标可查看操作名称。",
          "Hover over an icon to see its action.",
        )}
      </p>
    </div>
  );
}

function ButtonLinkExample() {
  const text = usePreviewText();
  return (
    <div className="catalog-preview-grid">
      <IqujiButtonLink href="#docs" variant="secondary">
        {text("查看规范", "View guidelines")}
      </IqujiButtonLink>
      <IqujiButtonLink aria-disabled="true" href="#disabled" variant="primary">
        {text("不可用链接", "Unavailable link")}
      </IqujiButtonLink>
    </div>
  );
}

function StatusBadgeExample() {
  const text = usePreviewText();
  return (
    <div className="catalog-preview-grid">
      <StatusBadge>{text("草稿", "Draft")}</StatusBadge>
      <StatusBadge tone="positive">{text("已发布", "Published")}</StatusBadge>
      <StatusBadge tone="warning">{text("待处理", "Pending")}</StatusBadge>
      <StatusBadge tone="critical">{text("失败", "Failed")}</StatusBadge>
    </div>
  );
}

function PanelExample() {
  const text = usePreviewText();
  return (
    <IqujiPanel
      header={text("项目概览", "Project overview")}
      style={{ maxWidth: 520 }}
    >
      <div style={{ padding: 20 }}>
        <p style={{ marginTop: 0 }}>
          {text(
            "为共享内容提供一致的表面和边界。",
            "Group related content in a single panel.",
          )}
        </p>
        <IqujiButton variant="secondary">
          {text("打开项目", "Open project")}
        </IqujiButton>
      </div>
    </IqujiPanel>
  );
}

function PageHeadingExample() {
  const text = usePreviewText();
  return (
    <IqujiPageHeading
      aside={
        <IqujiButton variant="secondary">
          {text("新建条目", "New entry")}
        </IqujiButton>
      }
      kicker={text("工作区 / 事项", "Workspace / Tasks")}
      summary={text(
        "查看项目中的工作进展与负责人。",
        "See project progress and task owners.",
      )}
      title={text("工作事项", "Tasks")}
    />
  );
}

function EmptyStateExample() {
  const text = usePreviewText();
  return (
    <IqujiEmptyState
      action={
        <IqujiButton variant="secondary">
          {text("创建第一条", "Create first task")}
        </IqujiButton>
      }
      body={text(
        "创建事项后，它们会显示在这里。",
        "Tasks will appear here after you create them.",
      )}
      icon={<IqujiIcon decorative name="file-search" size={24} />}
      title={text("暂时没有事项", "No tasks yet")}
    />
  );
}

function AppShellExample() {
  const text = usePreviewText();
  return (
    <AppShell
      brand={<strong>{text("团队空间", "Team space")}</strong>}
      header={<strong>{text("工作台", "Workspace")}</strong>}
      navigationLabel={text("主导航", "Main navigation")}
      navigation={[]}
      navigationGroups={[
        {
          id: "workspace",
          label: text("工作台", "Workspace"),
          items: [
            {
              id: "overview",
              label: text("概览", "Overview"),
              href: "#overview",
              active: true,
            },
          ],
        },
        {
          id: "manage",
          label: text("管理", "Manage"),
          items: [
            { id: "tasks", label: text("事项", "Tasks"), href: "#tasks" },
            {
              id: "disabled",
              label: text("未开放", "Coming soon"),
              disabled: true,
            },
          ],
        },
      ]}
      skipLinkLabel={text("跳到主内容", "Skip to main content")}
    >
      <div style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>
          {text("应用内容", "Application content")}
        </h2>
        <p>
          {text(
            "侧栏与工作区框架由应用传入。",
            "The application supplies the sidebar and workspace content.",
          )}
        </p>
      </div>
    </AppShell>
  );
}

function LoadingStateExample() {
  const text = usePreviewText();
  return <IqujiLoadingState label={text("正在载入项目", "Loading project")} />;
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
    render: () => <ButtonExample />,
  },
  {
    id: "icon-button",
    name: "IconButton",
    category: "基础",
    description: "只显示图标的紧凑操作，必须提供可访问名称。",
    keywords: "icon-button 图标按钮 tooltip accessible label",
    render: () => <IconButtonExample />,
  },
  {
    id: "button-link",
    name: "IqujiButtonLink",
    category: "基础",
    description: "保留链接导航语义，同时使用操作按钮外观。",
    keywords: "link navigation href disabled 链接",
    render: () => <ButtonLinkExample />,
  },
  {
    id: "status-badge",
    name: "StatusBadge",
    category: "基础",
    description: "呈现简短、非交互的状态标记。",
    keywords: "status badge tone neutral positive warning critical",
    render: () => <StatusBadgeExample />,
  },
  {
    id: "panel",
    name: "IqujiPanel",
    category: "基础",
    description: "为局部内容提供共享面板结构。",
    keywords: "panel section header 面板容器",
    render: () => <PanelExample />,
  },
  {
    id: "page-heading",
    name: "IqujiPageHeading",
    category: "基础",
    description: "组合页面提示、主标题、摘要和侧边操作。",
    keywords: "heading title kicker summary header 页面标题",
    render: () => <PageHeadingExample />,
  },
  {
    id: "empty-state",
    name: "IqujiEmptyState",
    category: "基础",
    description: "用明确说明和下一步操作表达空内容。",
    keywords: "empty state 空状态 no data action",
    render: () => <EmptyStateExample />,
  },
  {
    id: "loading-state",
    name: "IqujiLoadingState",
    category: "基础",
    description: "为等待中的内容提供可访问的忙碌反馈。",
    keywords: "loading state progress status 加载",
    render: () => <LoadingStateExample />,
  },
  {
    id: "app-shell",
    name: "AppShell",
    category: "布局与桌面",
    description: "使用分组导航组织品牌、侧栏、页头和主体内容。",
    keywords: "shell app navigation groups layout 应用框架 分组",
    render: () => <AppShellExample />,
  },
];
