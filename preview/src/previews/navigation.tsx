import {
  IqujiBadge,
  IqujiFormSteps,
  IqujiPagination,
  IqujiSettingsNav,
  IqujiTabs,
} from "@iquji-cloud/web-component";
import { IqujiIcon } from "@iquji-cloud/web-icons";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";

function TabsPreview() {
  const [value, setValue] = useState("overview");
  const content = {
    overview: "项目概况与当前状态。",
    activity: "最近发生的项目活动。",
    members: "项目成员与访问权限。",
  }[value];
  return (
    <div className="catalog-preview-stack">
      <IqujiTabs
        id="preview-navigation"
        label="项目页面"
        onChange={setValue}
        panelId="preview-navigation-panel"
        tabs={[
          { label: "概况", value: "overview" },
          { label: "活动", value: "activity" },
          { label: "成员", value: "members" },
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
  const [page, setPage] = useState(2);
  return (
    <IqujiPagination
      label="示例数据分页"
      nextLabel="下一页"
      onPageChange={setPage}
      page={page}
      pageSize={10}
      previousLabel="上一页"
      summary={(total, [start, end]) =>
        `显示 ${start}–${end} 条，共 ${total} 条`
      }
      total={87}
    />
  );
}

function FormStepsPreview() {
  const [step, setStep] = useState("details");
  return (
    <div className="catalog-preview-stack">
      <IqujiFormSteps
        completedLabel="已完成"
        label="新建项目进度"
        onChange={setStep}
        steps={[
          { id: "details", label: "基本信息", description: "名称与简介" },
          { id: "members", label: "添加成员", completed: step === "members" },
          { id: "confirm", label: "确认创建" },
        ]}
        value={step}
      />
      <p className="catalog-preview-copy" aria-live="polite">
        当前步骤：{step}
      </p>
    </div>
  );
}

function SettingsNavPreview() {
  const [active, setActive] = useState("profile");
  const [query, setQuery] = useState("");
  const entries = [
    {
      key: "profile",
      label: "个人资料",
      icon: <IqujiIcon decorative name="user" />,
    },
    {
      key: "security",
      label: "安全与登录",
      icon: <IqujiIcon decorative name="shield" />,
    },
    {
      key: "notifications",
      label: "通知偏好",
      icon: <IqujiIcon decorative name="bell" />,
      trailing: <IqujiBadge tone="info">2</IqujiBadge>,
    },
  ].filter((item) => String(item.label).includes(query));
  return (
    <div className="catalog-preview-settings-nav">
      <IqujiSettingsNav
        emptyLabel="没有匹配的设置项"
        groups={[
          {
            key: "account",
            label: "账户",
            items: entries.map((item) => ({
              ...item,
              active: active === item.key,
              onSelect: () => setActive(item.key),
            })),
          },
        ]}
        header={<strong>设置</strong>}
        label="账户设置"
        search={{
          label: "搜索设置项",
          placeholder: "搜索设置",
          value: query,
          onChange: setQuery,
        }}
      />
      <p className="catalog-preview-copy" aria-live="polite">
        当前页面：{active}
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
