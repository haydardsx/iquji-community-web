import type { Locale } from "@iquji-community/web-i18n";
import type { ComponentPreview, ComponentPreviewId } from "../catalog";
import { CATEGORY_METADATA } from "./locales";

type ComponentI18nInfo = {
  nameZh: string;
  nameEn: string;
  descEn: string;
};

const COMPONENT_I18N: Record<ComponentPreviewId, ComponentI18nInfo> = {
  "data-table": {
    nameZh: "数据表格",
    nameEn: "IqujiDataTable",
    descEn:
      "Data table with columns definition, empty states, and selectable rows.",
  },
  button: {
    nameZh: "按钮",
    nameEn: "IqujiButton",
    descEn:
      "Primary, secondary, ghost, and danger actions with loading and disabled states.",
  },
  "icon-button": {
    nameZh: "图标按钮",
    nameEn: "IconButton",
    descEn:
      "Compact icon-only actions with strict accessible label enforcement.",
  },
  "button-link": {
    nameZh: "链接按钮",
    nameEn: "IqujiButtonLink",
    descEn:
      "Button styling with hyperlink semantics and disabled navigation protection.",
  },
  "status-badge": {
    nameZh: "状态徽标",
    nameEn: "StatusBadge",
    descEn: "Concise non-interactive status indicator badge.",
  },
  panel: {
    nameZh: "内容面板",
    nameEn: "IqujiPanel",
    descEn: "Structured card panel layout for content grouping.",
  },
  "page-heading": {
    nameZh: "页面标题组",
    nameEn: "IqujiPageHeading",
    descEn: "Combines page badge, title, summary, and action bar.",
  },
  "empty-state": {
    nameZh: "空状态",
    nameEn: "IqujiEmptyState",
    descEn: "Clean empty state illustration, message, and call to action.",
  },
  "loading-state": {
    nameZh: "加载状态",
    nameEn: "IqujiLoadingState",
    descEn: "Accessible busy feedback and spinner for asynchronous content.",
  },
  "app-shell": {
    nameZh: "应用外壳",
    nameEn: "AppShell",
    descEn: "Standard application shell with responsive grouped navigation.",
  },
  field: {
    nameZh: "表单字段",
    nameEn: "IqujiField",
    descEn:
      "Form field wrapper with label, helper text, and validation error linking.",
  },
  input: {
    nameZh: "单行输入框",
    nameEn: "IqujiInput",
    descEn:
      "Single-line text input with controlled states and neutral focus border.",
  },
  textarea: {
    nameZh: "多行输入框",
    nameEn: "IqujiTextarea",
    descEn: "Multi-line text input for descriptions and notes.",
  },
  select: {
    nameZh: "单项选择器",
    nameEn: "IqujiSelect",
    descEn: "Accessible single-select dropdown menu.",
  },
  "multi-select": {
    nameZh: "多项选择器",
    nameEn: "IqujiMultiSelect",
    descEn:
      "Multi-select overlay with checkboxes, clear action, and disabled options.",
  },
  checkbox: {
    nameZh: "复选框",
    nameEn: "IqujiCheckbox",
    descEn: "Accessible binary checkbox with label and persistent description.",
  },
  radio: {
    nameZh: "单选框",
    nameEn: "IqujiRadio",
    descEn: "Radio group options for mutually exclusive selections.",
  },
  switch: {
    nameZh: "开关",
    nameEn: "IqujiSwitch",
    descEn: "Instant toggle switch with full-row click target.",
  },
  "segmented-control": {
    nameZh: "分段选择",
    nameEn: "IqujiSegmentedControl",
    descEn: "Compact segmented button group for switching between peer views.",
  },
  calendar: {
    nameZh: "日历",
    nameEn: "IqujiCalendar",
    descEn:
      "Inline calendar view with keyboard navigation and today shortcuts.",
  },
  "date-picker": {
    nameZh: "日期选择器",
    nameEn: "IqujiDatePicker",
    descEn: "Floating popover date picker with calendar and clear controls.",
  },
  "emoji-picker": {
    nameZh: "表情选择器",
    nameEn: "IqujiEmojiPicker",
    descEn: "Searchable emoji picker with category filtering and clear action.",
  },
  "color-picker": {
    nameZh: "颜色选择器",
    nameEn: "IqujiColorPicker",
    descEn: "Hex color picker with preset palette swatches and live preview.",
  },
  tabs: {
    nameZh: "标签页",
    nameEn: "IqujiTabs",
    descEn:
      "Controlled tab list supporting underline and segmented button styles.",
  },
  pagination: {
    nameZh: "分页器",
    nameEn: "IqujiPagination",
    descEn: "Controlled pagination contract with accessible page navigation.",
  },
  "form-steps": {
    nameZh: "步骤导航",
    nameEn: "IqujiFormSteps",
    descEn: "Shows form steps and reports navigation intent.",
  },
  "settings-nav": {
    nameZh: "设置导航",
    nameEn: "IqujiSettingsNav",
    descEn: "Searchable categorized settings navigation sidebar.",
  },
  badge: {
    nameZh: "徽标",
    nameEn: "IqujiBadge",
    descEn: "Lightweight category tag or notification count badge.",
  },
  alert: {
    nameZh: "行内提示",
    nameEn: "IqujiAlert",
    descEn: "Contextual inline warning and information callout banner.",
  },
  "progress-bar": {
    nameZh: "进度条",
    nameEn: "IqujiProgressBar",
    descEn:
      "Accessible progress bar with indeterminate and determinate states.",
  },
  timeline: {
    nameZh: "时间线",
    nameEn: "IqujiTimeline",
    descEn: "Vertical event timeline with status indicators.",
  },
  skeleton: {
    nameZh: "骨架屏",
    nameEn: "IqujiSkeleton",
    descEn: "Shimmering placeholder blocks for loading content skeletons.",
  },
  "async-state-frame": {
    nameZh: "异步状态容器",
    nameEn: "IqujiAsyncStateFrame",
    descEn:
      "Unified container switching between loading, error, empty, and ready.",
  },
  notification: {
    nameZh: "全局通知",
    nameEn: "IqujiNotification",
    descEn:
      "Global toast notifications with auto-dismiss, progress, and hover pause.",
  },
  "log-viewer": {
    nameZh: "日志查看器",
    nameEn: "IqujiLogViewer",
    descEn: "Search, filter, expand, and copy text or structured log entries.",
  },
  tooltip: {
    nameZh: "工具提示",
    nameEn: "IqujiTooltip",
    descEn: "Hover and focus accessible floating tooltip.",
  },
  popover: {
    nameZh: "气泡卡片",
    nameEn: "IqujiPopover",
    descEn: "Flexible anchored popover panel for custom controls.",
  },
  tour: {
    nameZh: "新手引导",
    nameEn: "IqujiTour",
    descEn:
      "Highlight controls in a guided tour through editing, saving, and reviewing the result.",
  },
  "dropdown-menu": {
    nameZh: "下拉菜单",
    nameEn: "IqujiDropdownMenu",
    descEn: "Accessible action dropdown menu with items and dividers.",
  },
  dialog: {
    nameZh: "对话框",
    nameEn: "IqujiDialog",
    descEn:
      "Modal dialog with overlay backdrop, focus trap, and Escape handling.",
  },
  drawer: {
    nameZh: "抽屉",
    nameEn: "IqujiDrawer",
    descEn: "Slide-out drawer panel from viewport edge with smooth exit.",
  },
  "confirm-dialog": {
    nameZh: "确认对话框",
    nameEn: "IqujiConfirmDialog",
    descEn: "Confirmation dialog with initial focus on Cancel for safety.",
  },
  "form-dialog": {
    nameZh: "表单对话框",
    nameEn: "IqujiFormDialog",
    descEn: "Expandable centered modal dialog for complex data entry.",
  },
  "search-dialog": {
    nameZh: "搜索对话框",
    nameEn: "IqujiSearchDialog",
    descEn: "Command palette search dialog with keyboard navigation.",
  },
  "overlay-scope": {
    nameZh: "浮层作用域",
    nameEn: "Overlay Scope",
    descEn: "Overlay provider managing nested stacking and container scoping.",
  },
  "page-header": {
    nameZh: "页面页头",
    nameEn: "IqujiPageHeader",
    descEn: "Page header with title, eyebrow, description, and actions.",
  },
  "table-frame": {
    nameZh: "表格容器",
    nameEn: "IqujiTableFrame",
    descEn:
      "Scrollable table wrapper with sticky header and accessibility frame.",
  },
  "scroll-area": {
    nameZh: "滚动区域",
    nameEn: "IqujiScrollArea",
    descEn: "Focusable named scrollable container for lists and logs.",
  },
  "workbench-layout": {
    nameZh: "工作台布局",
    nameEn: "IqujiWorkbenchLayout",
    descEn:
      "Three-pane responsive workbench with collapsible panels and splitters.",
  },
  "settings-layout": {
    nameZh: "设置布局",
    nameEn: "IqujiSettingsLayout",
    descEn: "Layout frame organizing settings navigation and content.",
  },
  "settings-content": {
    nameZh: "设置内容区",
    nameEn: "IqujiSettingsContent",
    descEn: "Settings view container for headers, sections, and rows.",
  },
  "settings-section": {
    nameZh: "设置分组",
    nameEn: "IqujiSettingsSection",
    descEn: "Grouped settings section with title and description boundary.",
  },
  "settings-row": {
    nameZh: "通用设置行",
    nameEn: "IqujiSettingsRow",
    descEn: "Settings row with left description and right control slot.",
  },
  "settings-switch-row": {
    nameZh: "开关设置行",
    nameEn: "IqujiSettingsSwitchRow",
    descEn: "Full-row clickable settings row with embedded switch.",
  },
  "settings-select-row": {
    nameZh: "选择设置行",
    nameEn: "IqujiSettingsSelectRow",
    descEn: "Settings row integrated with select dropdown control.",
  },
  "settings-action-row": {
    nameZh: "操作设置行",
    nameEn: "IqujiSettingsActionRow",
    descEn: "Settings row displaying current value and action button.",
  },
  "desktop-shell": {
    nameZh: "桌面外壳",
    nameEn: "IqujiDesktopShell",
    descEn: "Desktop window container with title bar, icon rail, and canvas.",
  },
  "desktop-titlebar": {
    nameZh: "桌面标题栏",
    nameEn: "IqujiDesktopTitleBar",
    descEn:
      "Window title bar supporting navigation and custom window controls.",
  },
  "desktop-tab-strip": {
    nameZh: "桌面标签栏",
    nameEn: "IqujiDesktopTabStrip",
    descEn: "Desktop tab strip with close, add, and dirty state.",
  },
  "desktop-rail": {
    nameZh: "桌面图标栏",
    nameEn: "IqujiDesktopRail",
    descEn: "Vertical icon rail navigation with tooltips and active states.",
  },
  "desktop-account-card": {
    nameZh: "桌面账户卡片",
    nameEn: "IqujiDesktopAccountCard",
    descEn: "Account profile card showing usage quota and quick actions.",
  },
  "desktop-account": {
    nameZh: "桌面账户菜单",
    nameEn: "IqujiDesktopAccount",
    descEn: "Popover menu trigger wrapping desktop account card.",
  },
  "editor-presets": {
    nameZh: "源码与富文本编辑器",
    nameEn: "Editor Presets",
    descEn:
      "CodeMirror syntax presets (Markdown, JSON, YAML, TOML) & rich text editor.",
  },
  "i18n-provider": {
    nameZh: "国际化状态",
    nameEn: "i18n Provider",
    descEn:
      "Internationalization state, language toggle, and dictionary interpolation.",
  },
  "icons-gallery": {
    nameZh: "图标与可访问性",
    nameEn: "Icons Gallery",
    descEn: "Complete vector icon catalog with accessibility attributes.",
  },
  "motion-provider": {
    nameZh: "动效设置",
    nameEn: "Motion Provider",
    descEn: "Standard motion timing presets and reduced-motion compliance.",
  },
  "network-transport": {
    nameZh: "网络传输",
    nameEn: "Network Transport",
    descEn: "HTTP transport, typed JSON client, timeouts, and cancellation.",
  },
  "query-client": {
    nameZh: "查询客户端与重试",
    nameEn: "Query Client",
    descEn:
      "React Query defaults, caching policies, and error retry strategies.",
  },
  "theme-preferences": {
    nameZh: "主题与首帧脚本",
    nameEn: "Theme Preferences",
    descEn: "Theme mode switching, semantic CSS tokens, and prepaint script.",
  },
};

export function getPreviewText(preview: ComponentPreview, locale: Locale) {
  const { nameZh, nameEn, descEn } = COMPONENT_I18N[preview.id];
  return locale === "zh-CN"
    ? { name: nameZh, description: preview.description }
    : { name: nameEn, description: descEn };
}

export function matchesPreviewSearch(preview: ComponentPreview, query: string) {
  const { nameZh, nameEn, descEn } = COMPONENT_I18N[preview.id];
  const category = CATEGORY_METADATA[preview.category];
  return [
    nameZh,
    nameEn,
    preview.name,
    preview.id,
    category.nameZh,
    category.nameEn,
    preview.description,
    descEn,
    preview.keywords,
  ]
    .join(" ")
    .toLocaleLowerCase()
    .includes(query);
}
