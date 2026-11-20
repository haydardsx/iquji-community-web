import {
  IqujiBadge,
  IqujiFormSteps,
  IqujiPagination,
  IqujiSettingsNav,
  IqujiTabs,
} from "@iquji-community/web-component";
import { IqujiIcon } from "@iquji-community/web-icons";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function TabsPreview() {
  const text = usePreviewText();
  const [value, setValue] = useState("overview");
  const content = {
    overview: text(
      "项目概况与当前状态。",
      "Project summary and current status.",
    ),
    activity: text("最近发生的项目活动。", "Recent project activity."),
    members: text(
      "项目成员与访问权限。",
      "Project members and access permissions.",
    ),
  }[value];
  return (
    <div className="catalog-preview-stack">
      <IqujiTabs
        id="preview-navigation"
        label={text("项目页面", "Project pages")}
        onChange={setValue}
        panelId="preview-navigation-panel"
        tabs={[
          { label: text("概况", "Overview"), value: "overview" },
          { label: text("活动", "Activity"), value: "activity" },
          { label: text("成员", "Members"), value: "members" },
        ]}
        value={value}
      />
      <section
        aria-labelledby={`preview-navigation-${value}`}
        aria-live="polite"
        className="catalog-preview-copy"
        id="preview-navigation-panel"
        role="tabpanel"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: 没有可聚焦子项时，面板本身需进入键盘顺序。
        tabIndex={0}
      >
        {content}
      </section>
    </div>
  );
}

function PaginationPreview() {
  const text = usePreviewText();
  const [page, setPage] = useState(2);
  return (
    <IqujiPagination
      label={text("示例数据分页", "Sample data pagination")}
      nextLabel={text("下一页", "Next page")}
      onPageChange={setPage}
      page={page}
      pageSize={10}
      previousLabel={text("上一页", "Previous page")}
      summary={(total, [start, end]) =>
        text(
          `显示 ${start}–${end} 条，共 ${total} 条`,
          `Showing ${start}–${end} of ${total}`,
        )
      }
      total={87}
    />
  );
}

function FormStepsPreview() {
  const text = usePreviewText();
  const [step, setStep] = useState("details");
  const steps = [
    {
      id: "details",
      label: text("基本信息", "Project details"),
      description: text("名称与简介", "Name and description"),
    },
    {
      id: "members",
      label: text("添加成员", "Add members"),
      completed: step === "members",
    },
    { id: "confirm", label: text("确认创建", "Confirm") },
  ];
  return (
    <div className="catalog-preview-stack">
      <IqujiFormSteps
        completedLabel={text("已完成", "Completed")}
        label={text("新建项目进度", "Project setup progress")}
        onChange={setStep}
        steps={steps}
        value={step}
      />
      <p className="catalog-preview-copy" aria-live="polite">
        {text("当前步骤：", "Current step: ")}
        {steps.find((item) => item.id === step)?.label}
      </p>
    </div>
  );
}

function SettingsNavPreview() {
  const text = usePreviewText();
  const [active, setActive] = useState("profile");
  const [query, setQuery] = useState("");
  const entries = [
    {
      key: "profile",
      label: text("个人资料", "Profile"),
      icon: <IqujiIcon decorative name="user" />,
    },
    {
      key: "security",
      label: text("安全与登录", "Security and sign-in"),
      icon: <IqujiIcon decorative name="shield" />,
    },
    {
      key: "notifications",
      label: text("通知偏好", "Notification preferences"),
      icon: <IqujiIcon decorative name="bell" />,
      trailing: <IqujiBadge tone="info">2</IqujiBadge>,
    },
  ];
  const keyword = query.trim().toLowerCase();
  return (
    <div className="catalog-preview-settings-nav">
      <IqujiSettingsNav
        emptyLabel={text("没有匹配的设置项", "No matching settings")}
        groups={[
          {
            key: "account",
            label: text("账户", "Account"),
            items: entries
              .filter((item) => item.label.toLowerCase().includes(keyword))
              .map((item) => ({
                ...item,
                active: active === item.key,
                onSelect: () => setActive(item.key),
              })),
          },
        ]}
        header={<strong>{text("设置", "Settings")}</strong>}
        label={text("账户设置", "Account settings")}
        search={{
          label: text("搜索设置项", "Search settings"),
          placeholder: text("搜索设置", "Search settings"),
          value: query,
          onChange: setQuery,
        }}
      />
      <p className="catalog-preview-copy" aria-live="polite">
        {text("当前页面：", "Current page: ")}
        {entries.find((entry) => entry.key === active)?.label}
      </p>
    </div>
  );
}

export const navigationPreviews: readonly ComponentPreview[] = [
  {
    id: "tabs",
    name: "IqujiTabs 标签页",
    category: "导航",
    description: "受控切换同一视图内的相关内容。",
    keywords: "IqujiTabs tablist 键盘 导航",
    render: () => <TabsPreview />,
  },
  {
    id: "pagination",
    name: "IqujiPagination 分页",
    category: "导航",
    description: "报告页码与范围，分页数据由调用方管理。",
    keywords: "IqujiPagination 页码 总数 上一页 下一页",
    render: () => <PaginationPreview />,
  },
  {
    id: "form-steps",
    name: "IqujiFormSteps 步骤导航",
    category: "导航",
    description: "展示流程步骤并上报导航意图，不替代表单校验。",
    keywords: "IqujiFormSteps 流程 向导 进度",
    render: () => <FormStepsPreview />,
  },
  {
    id: "settings-nav",
    name: "IqujiSettingsNav 设置导航",
    category: "导航",
    description: "组合可搜索的分组导航和活动项目。",
    keywords: "IqujiSettingsNav 搜索 分组 设置",
    render: () => <SettingsNavPreview />,
  },
];
