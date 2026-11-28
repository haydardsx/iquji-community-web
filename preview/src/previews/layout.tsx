import {
  IconButton,
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
  IqujiTitleBarActions,
  IqujiWorkbenchLayout,
} from "@iquji-community/web-component";
import { IqujiIcon } from "@iquji-community/web-icons";
import { useState } from "react";
import { createPortal } from "react-dom";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function ScrollAreaExample() {
  const text = usePreviewText();
  return (
    <IqujiScrollArea
      label={text("预览滚动区域", "Sample scroll area")}
      maxHeight={180}
      style={{ width: 360 }}
    >
      <div className="catalog-preview-stack" style={{ paddingRight: 12 }}>
        {Array.from({ length: 20 }, (_, index) =>
          text(
            `第 ${index + 1} 行：滚动区域保持内容可访问，并由调用方提供名称。`,
            `Row ${index + 1}: The labeled scroll area keeps this content accessible.`,
          ),
        ).map((line) => (
          <p className="catalog-preview-copy" key={line}>
            {line}
          </p>
        ))}
      </div>
    </IqujiScrollArea>
  );
}

function PageHeaderExample() {
  const text = usePreviewText();
  return (
    <IqujiPageHeader
      actions={
        <IqujiButton variant="secondary">{text("导出", "Export")}</IqujiButton>
      }
      description={text(
        "集中查看项目进展、成员与最近活动。",
        "See project progress, members, and recent activity.",
      )}
      eyebrow={text("项目空间", "Project space")}
      title={text("项目概览", "Project overview")}
    />
  );
}

function TableFrameExample() {
  const text = usePreviewText();
  return (
    <IqujiTableFrame
      label={text("项目成员列表", "Project members")}
      toolbar={
        <IqujiButton variant="secondary">{text("筛选", "Filter")}</IqujiButton>
      }
    >
      <table
        style={{ borderCollapse: "collapse", minWidth: 540, width: "100%" }}
      >
        <thead>
          <tr>
            <th>{text("成员", "Member")}</th>
            <th>{text("角色", "Role")}</th>
            <th>{text("最近活动", "Recent activity")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{text("示例维护者", "Sample maintainer")}</td>
            <td>{text("维护者", "Maintainer")}</td>
            <td>{text("刚刚", "Just now")}</td>
          </tr>
          <tr>
            <td>{text("示例成员", "Sample member")}</td>
            <td>{text("成员", "Member")}</td>
            <td>{text("昨天", "Yesterday")}</td>
          </tr>
        </tbody>
      </table>
    </IqujiTableFrame>
  );
}

function WorkbenchLayoutExample() {
  const text = usePreviewText();
  return (
    <div style={{ height: 300, overflow: "hidden" }}>
      <IqujiWorkbenchLayout
        center={
          <div style={{ padding: 16 }}>
            <h3>{text("正文", "Document")}</h3>
            <p>
              {text(
                "中心内容保留最小宽度。",
                "The center pane maintains a minimum width.",
              )}
            </p>
          </div>
        }
        left={
          <div style={{ padding: 12 }}>
            {text("目录", "Contents")}
            <br />
            {text("第一节", "Section one")}
            <br />
            {text("第二节", "Section two")}
          </div>
        }
        leftResizeLabel={text("调整目录宽度", "Resize contents pane")}
        right={
          <div style={{ padding: 12 }}>{text("属性面板", "Properties")}</div>
        }
        rightResizeLabel={text("调整属性面板宽度", "Resize properties pane")}
      />
    </div>
  );
}

function SettingsLayoutExample() {
  const text = usePreviewText();
  return (
    <div style={{ height: 360, overflow: "hidden" }}>
      <IqujiSettingsLayout
        navigation={
          <div style={{ padding: 16 }}>
            {text("设置导航", "Settings navigation")}
          </div>
        }
      >
        <IqujiSettingsContent
          title={text("常规设置", "General settings")}
          description={text(
            "管理工作区偏好。",
            "Manage workspace preferences.",
          )}
        >
          <IqujiSettingsSection title={text("偏好", "Preferences")}>
            <IqujiSettingsActionRow
              label={text("语言", "Language")}
              value={text("简体中文", "English")}
            />
          </IqujiSettingsSection>
        </IqujiSettingsContent>
      </IqujiSettingsLayout>
    </div>
  );
}

function SettingsContentExample() {
  const text = usePreviewText();
  return (
    <IqujiSettingsContent
      title={text("账户", "Account")}
      description={text(
        "管理个人信息和安全选项。",
        "Manage your profile and security options.",
      )}
    >
      <p>
        {text(
          "页面正文由应用按设置分区组合。",
          "Organize settings into sections.",
        )}
      </p>
    </IqujiSettingsContent>
  );
}

function SettingsSectionExample() {
  const text = usePreviewText();
  return (
    <IqujiSettingsSection
      title={text("个人资料", "Profile")}
      description={text(
        "供团队成员识别你。",
        "Help team members recognize you.",
      )}
    >
      <IqujiSettingsActionRow
        label={text("姓名", "Name")}
        value={text("示例维护者", "Sample maintainer")}
        action={
          <IqujiButton variant="secondary">{text("编辑", "Edit")}</IqujiButton>
        }
      />
    </IqujiSettingsSection>
  );
}

function SettingsRowExample() {
  const text = usePreviewText();
  return (
    <IqujiSettingsRow
      description={text(
        "更新后对所有成员生效。",
        "Changes apply to all members.",
      )}
      label={text("工作区名称", "Workspace name")}
      control={
        <IqujiButton variant="secondary">{text("编辑", "Edit")}</IqujiButton>
      }
    />
  );
}

function SettingsSwitchRowExample() {
  const text = usePreviewText();
  return (
    <IqujiSettingsSwitchRow
      checked
      label={text("邮件通知", "Email notifications")}
      description={text(
        "有新活动时接收通知。",
        "Receive notifications for new activity.",
      )}
      onChange={() => undefined}
    />
  );
}

function SettingsSelectRowExample() {
  const text = usePreviewText();
  return (
    <IqujiSettingsSelectRow
      label={text("语言", "Language")}
      value="zh"
      options={[
        { label: text("简体中文", "Simplified Chinese"), value: "zh" },
        { label: text("英语", "English"), value: "en" },
      ]}
      onValueChange={() => undefined}
    />
  );
}

function SettingsActionRowExample() {
  const text = usePreviewText();
  return (
    <IqujiSettingsActionRow
      label={text("本地数据目录", "Local data directory")}
      description={text(
        "当前项目文件保存位置。",
        "The folder where project files are saved.",
      )}
      value="./sample-data"
      action={
        <IqujiButton variant="secondary">{text("打开", "Open")}</IqujiButton>
      }
    />
  );
}

function DesktopShellExample() {
  const text = usePreviewText();
  return (
    <div style={{ height: 300, overflow: "hidden" }}>
      <IqujiDesktopShell
        rail={
          <IqujiDesktopRail
            label={text("主导航", "Main navigation")}
            items={[
              {
                id: "home",
                label: text("首页", "Home"),
                icon: <IqujiIcon decorative name="home" />,
                active: true,
              },
            ]}
          />
        }
        windowBar={
          <IqujiDesktopTitleBar>
            {text("工作区", "Workspace")}
          </IqujiDesktopTitleBar>
        }
        skipLinkLabel={text("跳到内容", "Skip to content")}
      >
        <div style={{ padding: 24 }}>
          {text("桌面工作区内容", "Desktop workspace content")}
        </div>
      </IqujiDesktopShell>
    </div>
  );
}

function DesktopTitlebarExample() {
  const text = usePreviewText();
  const [actionSlot, setActionSlot] = useState<HTMLDivElement | null>(null);
  return (
    <>
      <IqujiDesktopTitleBar
        leading={
          <IqujiButton variant="ghost">{text("返回", "Back")}</IqujiButton>
        }
        actions={<div ref={setActionSlot} />}
      >
        {text("标题栏内容", "Title bar content")}
      </IqujiDesktopTitleBar>
      {actionSlot &&
        createPortal(
          <IqujiTitleBarActions>
            <IconButton
              compact
              icon={<IqujiIcon decorative name="more" />}
              label={text("更多操作", "More actions")}
            />
          </IqujiTitleBarActions>,
          actionSlot,
        )}
    </>
  );
}

function DesktopRailExample() {
  const text = usePreviewText();
  return (
    <IqujiDesktopRail
      label={text("主导航", "Main navigation")}
      items={[
        {
          id: "home",
          label: text("首页", "Home"),
          icon: <IqujiIcon decorative name="home" />,
          active: true,
        },
        {
          id: "settings",
          label: text("设置", "Settings"),
          icon: <IqujiIcon decorative name="settings" />,
        },
        {
          id: "disabled",
          label: text("即将开放", "Coming soon"),
          icon: <IqujiIcon decorative name="sparkles" />,
          disabled: true,
        },
      ]}
    />
  );
}

function DesktopAccountCardExample() {
  const text = usePreviewText();
  return (
    <IqujiDesktopAccountCard
      avatarLabel={text("示", "S")}
      name={text("示例维护者", "Sample maintainer")}
      secondary={text("个人工作区", "Personal workspace")}
      usage={{
        label: text("本月用量", "Monthly usage"),
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
              label: text("账户设置", "Account settings"),
              icon: <IqujiIcon decorative name="settings" />,
            },
          ],
        },
      ]}
    />
  );
}

function DesktopAccountExample() {
  const text = usePreviewText();
  return (
    <IqujiDesktopAccount
      card={{
        avatarLabel: text("预", "S"),
        name: text("预览用户", "Sample user"),
        secondary: text("团队成员", "Team member"),
        sections: [
          {
            key: "account",
            items: [
              {
                key: "profile",
                label: text("个人资料", "Profile"),
                icon: <IqujiIcon decorative name="user" />,
              },
            ],
          },
        ],
      }}
      triggerLabel={text("账户菜单", "Account menu")}
    />
  );
}

function TabStripExample() {
  const text = usePreviewText();
  const [active, setActive] = useState("overview");
  return (
    <IqujiDesktopTabStrip
      activeTabId={active}
      label={text("打开的标签页", "Open tabs")}
      onActiveTabChange={setActive}
      tabs={[
        {
          id: "overview",
          label: text("概览", "Overview"),
          icon: <IqujiIcon decorative name="home" />,
        },
        {
          id: "tasks",
          label: text("事项", "Tasks"),
          icon: <IqujiIcon decorative name="check-circle" />,
          dirty: true,
        },
        {
          id: "settings",
          label: text("设置", "Settings"),
          icon: <IqujiIcon decorative name="settings" />,
          disabled: true,
        },
      ]}
    />
  );
}

export const layoutPreviews: readonly ComponentPreview[] = [
  {
    id: "scroll-area",
    name: "IqujiScrollArea",
    category: "布局与桌面",
    description: "为日志、长列表和宽表提供可聚焦的命名滚动区域。",
    keywords: "scroll area overflow region 滚动",
    render: () => <ScrollAreaExample />,
  },
  {
    id: "page-header",
    name: "IqujiPageHeader",
    category: "布局与桌面",
    description: "统一页面标题、说明和操作区的排布。",
    keywords: "page header title actions eyebrow",
    render: () => <PageHeaderExample />,
  },
  {
    id: "table-frame",
    name: "IqujiTableFrame",
    category: "布局与桌面",
    description: "为可横向滚动的数据表提供工具栏和无障碍边界。",
    keywords: "table frame scroll toolbar data table",
    render: () => <TableFrameExample />,
  },
  {
    id: "workbench-layout",
    name: "IqujiWorkbenchLayout",
    category: "布局与桌面",
    description: "创建可拖动调整宽度的三栏工作区。",
    keywords: "workbench split pane resizable 三栏布局",
    render: () => <WorkbenchLayoutExample />,
  },
  {
    id: "settings-layout",
    name: "IqujiSettingsLayout",
    category: "布局与桌面",
    description: "组合设置页的导航栏与内容区。",
    keywords: "settings layout navigation 设置页面",
    render: () => <SettingsLayoutExample />,
  },
  {
    id: "settings-content",
    name: "IqujiSettingsContent",
    category: "布局与桌面",
    description: "组织设置页标题、简介、分组和行内容。",
    keywords: "settings content section settings-section",
    render: () => <SettingsContentExample />,
  },
  {
    id: "settings-section",
    name: "IqujiSettingsSection",
    category: "布局与桌面",
    description: "为相关设置行提供分区标题、说明与边界。",
    keywords: "settings section rows header",
    render: () => <SettingsSectionExample />,
  },
  {
    id: "settings-row",
    name: "IqujiSettingsRow",
    category: "布局与桌面",
    description: "通用设置行，左侧说明，右侧由调用方提供控件。",
    keywords: "settings row control label description",
    render: () => <SettingsRowExample />,
  },
  {
    id: "settings-switch-row",
    name: "IqujiSettingsSwitchRow",
    category: "布局与桌面",
    description: "让设置说明与开关组成一致、整行可操作的控件。",
    keywords: "settings switch row toggle",
    render: () => <SettingsSwitchRowExample />,
  },
  {
    id: "settings-select-row",
    name: "IqujiSettingsSelectRow",
    category: "布局与桌面",
    description: "将设置行标签和说明与选择器的无障碍名称关联。",
    keywords: "settings select row options",
    render: () => <SettingsSelectRowExample />,
  },
  {
    id: "settings-action-row",
    name: "IqujiSettingsActionRow",
    category: "布局与桌面",
    description: "呈现当前值、说明和关联操作。",
    keywords: "settings action row value path",
    render: () => <SettingsActionRowExample />,
  },
  {
    id: "desktop-shell",
    name: "IqujiDesktopShell",
    category: "布局与桌面",
    description: "提供桌面工作区的窗口栏、图标栏和内容框架。",
    keywords: "desktop shell window bar rail",
    render: () => <DesktopShellExample />,
  },
  {
    id: "desktop-titlebar",
    name: "IqujiDesktopTitleBar",
    category: "布局与桌面",
    description: "承载窗口导航、页签和两侧操作。",
    keywords: "desktop title bar window controls drag",
    render: () => <DesktopTitlebarExample />,
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
    render: () => <DesktopRailExample />,
  },
  {
    id: "desktop-account-card",
    name: "IqujiDesktopAccountCard",
    category: "布局与桌面",
    description: "展示账户信息、使用情况和分组操作。",
    keywords: "desktop account card avatar usage section",
    render: () => <DesktopAccountCardExample />,
  },
  {
    id: "desktop-account",
    name: "IqujiDesktopAccount",
    category: "布局与桌面",
    description: "以弹出菜单承载账户卡和账户操作。",
    keywords: "desktop account popover trigger",
    render: () => <DesktopAccountExample />,
  },
];
