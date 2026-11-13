import {
  IqujiButton,
  IqujiDesktopAccount,
  IqujiDesktopAccountCard,
  IqujiDesktopRail,
  IqujiDesktopShell,
  IqujiDesktopTabStrip,
  IqujiDesktopTitleBar,
  IqujiPageHeader,
  IqujiScrollArea,
  IqujiSettingsActionRow,
  IqujiSettingsContent,
  IqujiSettingsLayout,
  IqujiSettingsRow,
  IqujiSettingsSection,
  IqujiSettingsSelectRow,
  IqujiSettingsSwitchRow,
  IqujiTableFrame,
  IqujiWorkbenchLayout,
} from "@iquji-web/web-component";
import { IqujiIcon } from "@iquji-web/web-icons";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";

export const layoutPreviews: readonly ComponentPreview[] = [
  {
    id: "scroll-area",
    name: "IqujiScrollArea",
    category: "布局与桌面",
    description: "为日志、长列表和宽表提供可聚焦的命名滚动区域。",
    keywords: "scroll area overflow region 滚动",
    render: () => (
      <IqujiScrollArea
        label="预览滚动区域"
        maxHeight={180}
        style={{ width: 360 }}
      >
        <div className="catalog-preview-stack" style={{ paddingRight: 12 }}>
          {Array.from(
            { length: 20 },
            (_, index) =>
              `第 ${index + 1} 行：滚动区域保持内容可访问，并由调用方提供名称。`,
          ).map((line) => (
            <p className="catalog-preview-copy" key={line}>
              {line}
            </p>
          ))}
        </div>
      </IqujiScrollArea>
    ),
  },
  {
    id: "page-header",
    name: "IqujiPageHeader",
    category: "布局与桌面",
    description: "统一页面标题、说明和操作区的排布。",
    keywords: "page header title actions eyebrow",
    render: () => (
      <IqujiPageHeader
        actions={<IqujiButton variant="secondary">导出</IqujiButton>}
        description="集中查看项目进展、成员与最近活动。"
        eyebrow="项目空间"
        title="项目概览"
      />
    ),
  },
  {
    id: "table-frame",
    name: "IqujiTableFrame",
    category: "布局与桌面",
    description: "为可横向滚动的数据表提供工具栏和无障碍边界。",
    keywords: "table frame scroll toolbar data table",
    render: () => (
      <IqujiTableFrame
        label="项目成员列表"
        toolbar={<IqujiButton variant="secondary">筛选</IqujiButton>}
      >
        <table
          style={{ borderCollapse: "collapse", minWidth: 540, width: "100%" }}
        >
          <thead>
            <tr>
              <th>成员</th>
              <th>角色</th>
              <th>最近活动</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>林小满</td>
              <td>维护者</td>
              <td>刚刚</td>
            </tr>
            <tr>
              <td>周知行</td>
              <td>成员</td>
              <td>昨天</td>
            </tr>
          </tbody>
        </table>
      </IqujiTableFrame>
    ),
  },
  {
    id: "workbench-layout",
    name: "IqujiWorkbenchLayout",
    category: "布局与桌面",
    description: "创建可拖动调整宽度的三栏工作区。",
    keywords: "workbench split pane resizable 三栏布局",
    render: () => (
      <div style={{ height: 300, overflow: "hidden" }}>
        <IqujiWorkbenchLayout
          center={
            <div style={{ padding: 16 }}>
              <h3>正文</h3>
              <p>中心内容保留最小宽度。</p>
            </div>
          }
          left={
            <div style={{ padding: 12 }}>
              目录
              <br />
              第一节
              <br />
              第二节
            </div>
          }
          leftResizeLabel="调整目录宽度"
          right={<div style={{ padding: 12 }}>属性面板</div>}
          rightResizeLabel="调整属性面板宽度"
        />
      </div>
    ),
  },
  {
    id: "settings-layout",
    name: "IqujiSettingsLayout",
    category: "布局与桌面",
    description: "组合设置页的导航栏与内容区。",
    keywords: "settings layout navigation 设置页面",
    render: () => (
      <div style={{ height: 360, overflow: "hidden" }}>
        <IqujiSettingsLayout
          navigation={<div style={{ padding: 16 }}>设置导航</div>}
        >
          <IqujiSettingsContent title="常规设置" description="管理工作区偏好。">
            <IqujiSettingsSection title="偏好">
              <IqujiSettingsActionRow label="语言" value="简体中文" />
            </IqujiSettingsSection>
          </IqujiSettingsContent>
        </IqujiSettingsLayout>
      </div>
    ),
  },
  {
    id: "settings-content",
    name: "IqujiSettingsContent",
    category: "布局与桌面",
    description: "组织设置页标题、简介、分组和行内容。",
    keywords: "settings content section settings-section",
    render: () => (
      <IqujiSettingsContent title="账户" description="管理个人信息和安全选项。">
        <p>页面正文由应用按设置分区组合。</p>
      </IqujiSettingsContent>
    ),
  },
  {
    id: "settings-section",
    name: "IqujiSettingsSection",
    category: "布局与桌面",
    description: "为相关设置行提供分区标题、说明与边界。",
    keywords: "settings section rows header",
    render: () => (
      <IqujiSettingsSection title="个人资料" description="供团队成员识别你。">
        <IqujiSettingsActionRow
          label="姓名"
          value="林小满"
          action={<IqujiButton variant="secondary">编辑</IqujiButton>}
        />
      </IqujiSettingsSection>
    ),
  },
  {
    id: "settings-row",
    name: "IqujiSettingsRow",
    category: "布局与桌面",
    description: "通用设置行，左侧说明，右侧由调用方提供控件。",
    keywords: "settings row control label description",
    render: () => (
      <IqujiSettingsRow
        description="更新后对所有成员生效。"
        label="工作区名称"
        control={<IqujiButton variant="secondary">编辑</IqujiButton>}
      />
    ),
  },
  {
    id: "settings-switch-row",
    name: "IqujiSettingsSwitchRow",
    category: "布局与桌面",
    description: "让设置说明与开关组成一致、整行可操作的控件。",
    keywords: "settings switch row toggle",
    render: () => (
      <IqujiSettingsSwitchRow
        checked
        label="邮件通知"
        description="有新活动时接收通知。"
        onChange={() => undefined}
      />
    ),
  },
  {
    id: "settings-select-row",
    name: "IqujiSettingsSelectRow",
    category: "布局与桌面",
    description: "将设置行标签和说明与选择器的无障碍名称关联。",
    keywords: "settings select row options",
    render: () => (
      <IqujiSettingsSelectRow
        label="语言"
        value="zh"
        options={[
          { label: "简体中文", value: "zh" },
          { label: "English", value: "en" },
        ]}
        onValueChange={() => undefined}
      />
    ),
  },
  {
    id: "settings-action-row",
    name: "IqujiSettingsActionRow",
    category: "布局与桌面",
    description: "呈现当前值、说明和关联操作。",
    keywords: "settings action row value path",
    render: () => (
      <IqujiSettingsActionRow
        label="本地数据目录"
        description="当前项目文件保存位置。"
        value="~/Documents/Iquji"
        action={<IqujiButton variant="secondary">打开</IqujiButton>}
      />
    ),
  },
  {
    id: "desktop-shell",
    name: "IqujiDesktopShell",
    category: "布局与桌面",
    description: "提供桌面工作区的窗口栏、图标栏和内容框架。",
    keywords: "desktop shell window bar rail",
    render: () => (
      <div style={{ height: 300, overflow: "hidden" }}>
        <IqujiDesktopShell
          rail={
            <IqujiDesktopRail
              label="主导航"
              items={[
                {
                  id: "home",
                  label: "首页",
                  icon: <IqujiIcon decorative name="home" />,
                  active: true,
                },
              ]}
            />
          }
          windowBar={<IqujiDesktopTitleBar>工作区</IqujiDesktopTitleBar>}
          skipLinkLabel="跳到内容"
        >
          <div style={{ padding: 24 }}>桌面工作区内容</div>
        </IqujiDesktopShell>
      </div>
    ),
  },
  {
    id: "desktop-titlebar",
    name: "IqujiDesktopTitleBar",
    category: "布局与桌面",
    description: "承载窗口导航、页签和两侧操作。",
    keywords: "desktop title bar window controls drag",
    render: () => (
      <IqujiDesktopTitleBar
        leading={<IqujiButton variant="ghost">返回</IqujiButton>}
        actions={<IqujiButton variant="secondary">更多操作</IqujiButton>}
      >
        标题栏内容
      </IqujiDesktopTitleBar>
    ),
  },
  {
    id: "desktop-tab-strip",
    name: "IqujiDesktopTabStrip",
    category: "布局与桌面",
    description: "支持激活、关闭和新增的桌面工作区页签。",
    keywords: "desktop tabs tab strip close add dirty",
    render: () => <TabStripExample />,
  },
  {
    id: "desktop-rail",
    name: "IqujiDesktopRail",
    category: "布局与桌面",
    description: "以图标栏呈现主导航，并为图标提供提示。",
    keywords: "desktop rail sidebar icon navigation",
    render: () => (
      <IqujiDesktopRail
        label="主导航"
        items={[
          {
            id: "home",
            label: "首页",
            icon: <IqujiIcon decorative name="home" />,
            active: true,
          },
          {
            id: "settings",
            label: "设置",
            icon: <IqujiIcon decorative name="settings" />,
          },
          {
            id: "disabled",
            label: "即将开放",
            icon: <IqujiIcon decorative name="sparkles" />,
            disabled: true,
          },
        ]}
      />
    ),
  },
  {
    id: "desktop-account-card",
    name: "IqujiDesktopAccountCard",
    category: "布局与桌面",
    description: "展示账户信息、使用情况和分组操作。",
    keywords: "desktop account card avatar usage section",
    render: () => (
      <IqujiDesktopAccountCard
        avatarLabel="林"
        name="林小满"
        secondary="个人工作区"
        usage={{
          label: "本月用量",
          value: 64,
          valueText: "64%",
          tone: "positive",
        }}
        sections={[
          {
            key: "account",
            items: [
              {
                key: "settings",
                label: "账户设置",
                icon: <IqujiIcon decorative name="settings" />,
              },
            ],
          },
        ]}
      />
    ),
  },
  {
    id: "desktop-account",
    name: "IqujiDesktopAccount",
    category: "布局与桌面",
    description: "以弹出菜单承载账户卡和账户操作。",
    keywords: "desktop account popover trigger",
    render: () => (
      <IqujiDesktopAccount
        card={{
          avatarLabel: "预",
          name: "预览用户",
          secondary: "团队成员",
          sections: [
            {
              key: "account",
              items: [
                {
                  key: "profile",
                  label: "个人资料",
                  icon: <IqujiIcon decorative name="user" />,
                },
              ],
            },
          ],
        }}
        triggerLabel="账户菜单"
      />
    ),
  },
];

function TabStripExample() {
  const [active, setActive] = useState("overview");
  return (
    <IqujiDesktopTabStrip
      activeTabId={active}
      label="打开的标签页"
      onActiveTabChange={setActive}
      tabs={[
        {
          id: "overview",
          label: "概览",
          icon: <IqujiIcon decorative name="home" />,
        },
        {
          id: "tasks",
          label: "事项",
          icon: <IqujiIcon decorative name="check-circle" />,
          dirty: true,
        },
        {
          id: "settings",
          label: "设置",
          icon: <IqujiIcon decorative name="settings" />,
          disabled: true,
        },
      ]}
    />
  );
}
