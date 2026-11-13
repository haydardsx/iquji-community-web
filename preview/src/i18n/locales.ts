import type { Locale, MessageCatalog } from "@iquji-web/web-i18n";
import type { IqujiIconName } from "@iquji-web/web-icons";
import type { ComponentCategory } from "../catalog";

export type PreviewMessageKey =
  | "brand.title"
  | "brand.subtitle"
  | "nav.overview"
  | "nav.components"
  | "nav.docs"
  | "search.placeholder"
  | "search.clear"
  | "lang.toggle"
  | "theme.light"
  | "theme.dark"
  | "theme.system"
  | "overview.hero.title"
  | "overview.hero.subtitle"
  | "overview.stat.components"
  | "overview.stat.packages"
  | "overview.stat.coverage"
  | "overview.stat.license"
  | "overview.filter.all"
  | "overview.card.viewDemo"
  | "overview.group.count"
  | "sidebar.overview"
  | "sidebar.all"
  | "sidebar.categories"
  | "sidebar.footer.count"
  | "detail.back"
  | "detail.prev"
  | "detail.next"
  | "detail.package"
  | "detail.category"
  | "detail.empty.title"
  | "detail.empty.desc"
  | "detail.empty.clear";

export const PREVIEW_LOCALES: Record<
  Locale,
  MessageCatalog<PreviewMessageKey>
> = {
  "zh-CN": {
    "brand.title": "Iquji Web",
    "brand.subtitle": "Community 预览",
    "nav.overview": "总览",
    "nav.components": "组件与能力",
    "nav.docs": "源码与文档",
    "search.placeholder": "搜索组件与能力... (⌘K)",
    "search.clear": "清空搜索",
    "lang.toggle": "English",
    "theme.light": "浅色模式",
    "theme.dark": "深色模式",
    "theme.system": "跟随系统",
    "overview.hero.title": "Iquji Web 组件与能力总览",
    "overview.hero.subtitle":
      "现代、模块化、高可访问性的 Web 前端基础组件与工具套件，开箱即用。",
    "overview.stat.components": "核心组件与能力",
    "overview.stat.packages": "独立正式包",
    "overview.stat.coverage": "导出覆盖率",
    "overview.stat.license": "开源协议",
    "overview.filter.all": "全部",
    "overview.card.viewDemo": "查看交互演示",
    "overview.group.count": "{count} 个能力",
    "sidebar.overview": "组件总览",
    "sidebar.all": "全部能力",
    "sidebar.categories": "能力分类",
    "sidebar.footer.count": "{count} 个能力",
    "detail.back": "返回总览",
    "detail.prev": "上一个",
    "detail.next": "下一个",
    "detail.package": "所属包",
    "detail.category": "分类",
    "detail.empty.title": "未找到匹配能力",
    "detail.empty.desc": "请尝试更换搜索关键词或清除分类筛选。",
    "detail.empty.clear": "清除筛选",
  },
  "en-US": {
    "brand.title": "Iquji Web",
    "brand.subtitle": "Community Preview",
    "nav.overview": "Overview",
    "nav.components": "Components",
    "nav.docs": "Source & Docs",
    "search.placeholder": "Search components... (⌘K)",
    "search.clear": "Clear search",
    "lang.toggle": "简体中文",
    "theme.light": "Light Mode",
    "theme.dark": "Dark Mode",
    "theme.system": "System Theme",
    "overview.hero.title": "Iquji Web Components & Capabilities",
    "overview.hero.subtitle":
      "A modern, modular, accessible Web UI toolkit and foundation suite, ready to build.",
    "overview.stat.components": "Components & Features",
    "overview.stat.packages": "Standalone Packages",
    "overview.stat.coverage": "Export Coverage",
    "overview.stat.license": "License",
    "overview.filter.all": "All",
    "overview.card.viewDemo": "View Interactive Demo",
    "overview.group.count": "{count} capabilities",
    "sidebar.overview": "Overview",
    "sidebar.all": "All Capabilities",
    "sidebar.categories": "Categories",
    "sidebar.footer.count": "{count} capabilities",
    "detail.back": "Back to Overview",
    "detail.prev": "Previous",
    "detail.next": "Next",
    "detail.package": "Package",
    "detail.category": "Category",
    "detail.empty.title": "No capabilities found",
    "detail.empty.desc":
      "Try searching for different keywords or clear your filters.",
    "detail.empty.clear": "Clear Filters",
  },
};

export type CategoryMeta = {
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  iconName: IqujiIconName;
};

export const CATEGORY_METADATA: Record<ComponentCategory, CategoryMeta> = {
  基础: {
    nameZh: "基础",
    nameEn: "General",
    descZh: "按钮、通用页面标题、通用状态标记与空白占位",
    descEn: "Buttons, page headings, status badges, and empty placeholders",
    iconName: "boxes",
  },
  表单: {
    nameZh: "表单",
    nameEn: "Forms",
    descZh: "字段容器、输入框、选择器、日历与颜色选择",
    descEn: "Fields, inputs, selects, pickers, and checkboxes",
    iconName: "sliders-horizontal",
  },
  导航: {
    nameZh: "导航",
    nameEn: "Navigation",
    descZh: "标签页切换、分页器与数字步骤条",
    descEn: "Tabs, pagination, steps, and settings navigation",
    iconName: "list-ordered",
  },
  反馈: {
    nameZh: "反馈",
    nameEn: "Feedback",
    descZh: "全局通知、行内警告、骨架屏与进度条",
    descEn: "Toast notifications, alerts, skeletons, and progress bars",
    iconName: "bell",
  },
  浮层: {
    nameZh: "浮层",
    nameEn: "Overlays",
    descZh: "对话框、抽屉、确认框、搜索弹窗与气泡卡片",
    descEn:
      "Dialogs, drawers, confirmation modals, search dialogs, and popovers",
    iconName: "panel-bottom",
  },
  布局与桌面: {
    nameZh: "布局与桌面",
    nameEn: "Layout & Desktop",
    descZh: "应用外壳、工作台三栏布局、表格容器与桌面窗体",
    descEn: "App shells, workbench layout, table frames, and desktop chrome",
    iconName: "layout-dashboard",
  },
  编辑器: {
    nameZh: "编辑器",
    nameEn: "Editor",
    descZh: "代码语法高亮预设与富文本编辑器",
    descEn: "Syntax presets and rich-text editors",
    iconName: "pencil",
  },
  国际化: {
    nameZh: "国际化",
    nameEn: "i18n",
    descZh: "轻量语言 Provider 与动态模板插值",
    descEn: "Lightweight locale provider and template interpolation",
    iconName: "languages",
  },
  图标: {
    nameZh: "图标",
    nameEn: "Icons",
    descZh: "矢量图标、语义标记与无障碍约束",
    descEn: "Vector icons with accessibility attributes",
    iconName: "sparkles",
  },
  动效: {
    nameZh: "动效",
    nameEn: "Motion",
    descZh: "页面进场动画原语与 reduced-motion 适配",
    descEn: "Route entrance animations and reduced-motion",
    iconName: "play",
  },
  网络: {
    nameZh: "网络",
    nameEn: "Network",
    descZh: "HTTP 传输、可注入 Fetch 与超时取消",
    descEn: "HTTP transport, injectable fetch, and timeouts",
    iconName: "network",
  },
  查询: {
    nameZh: "查询",
    nameEn: "Query",
    descZh: "React Query 客户端与认证感知重试策略",
    descEn: "React Query client and retry policies",
    iconName: "refresh",
  },
  主题: {
    nameZh: "主题",
    nameEn: "Theme",
    descZh: "设计系统变量、明暗模式与首帧防闪",
    descEn: "Design tokens, theme modes, and prepaint scripts",
    iconName: "sun",
  },
};

export type ComponentI18nInfo = {
  nameEn: string;
  descEn: string;
};

export const COMPONENT_I18N: Record<string, ComponentI18nInfo> = {
  "data-table": {
    nameEn: "IqujiDataTable",
    descEn:
      "Data table with columns definition, empty states, and selectable rows.",
  },
  button: {
    nameEn: "IqujiButton",
    descEn:
      "Primary, secondary, ghost, and danger actions with loading and disabled states.",
  },
  "icon-button": {
    nameEn: "IconButton",
    descEn:
      "Compact icon-only actions with strict accessible label enforcement.",
  },
  "button-link": {
    nameEn: "IqujiButtonLink",
    descEn:
      "Button styling with hyperlink semantics and disabled navigation protection.",
  },
  "status-badge": {
    nameEn: "StatusBadge",
    descEn: "Concise non-interactive status indicator badge.",
  },
  panel: {
    nameEn: "IqujiPanel",
    descEn: "Structured card panel layout for content grouping.",
  },
  "page-heading": {
    nameEn: "IqujiPageHeading",
    descEn: "Combines page badge, title, summary, and action bar.",
  },
  "empty-state": {
    nameEn: "IqujiEmptyState",
    descEn: "Clean empty state illustration, message, and call to action.",
  },
  "loading-state": {
    nameEn: "IqujiLoadingState",
    descEn: "Accessible busy feedback and spinner for asynchronous content.",
  },
  "app-shell": {
    nameEn: "AppShell",
    descEn: "Standard application shell with responsive grouped navigation.",
  },
  field: {
    nameEn: "IqujiField",
    descEn:
      "Form field wrapper with label, helper text, and validation error linking.",
  },
  input: {
    nameEn: "IqujiInput",
    descEn:
      "Single-line text input with controlled states and neutral focus border.",
  },
  textarea: {
    nameEn: "IqujiTextarea",
    descEn: "Multi-line text input for descriptions and notes.",
  },
  select: {
    nameEn: "IqujiSelect",
    descEn: "Accessible single-select dropdown menu.",
  },
  "multi-select": {
    nameEn: "IqujiMultiSelect",
    descEn:
      "Multi-select overlay with checkboxes, clear action, and disabled options.",
  },
  checkbox: {
    nameEn: "IqujiCheckbox",
    descEn: "Accessible binary checkbox with label and persistent description.",
  },
  radio: {
    nameEn: "IqujiRadio",
    descEn: "Radio group options for mutually exclusive selections.",
  },
  switch: {
    nameEn: "IqujiSwitch",
    descEn: "Instant toggle switch with full-row click target.",
  },
  "segmented-control": {
    nameEn: "IqujiSegmentedControl",
    descEn: "Compact segmented button group for switching between peer views.",
  },
  calendar: {
    nameEn: "IqujiCalendar",
    descEn:
      "Inline calendar view with keyboard navigation and today shortcuts.",
  },
  "date-picker": {
    nameEn: "IqujiDatePicker",
    descEn: "Floating popover date picker with calendar and clear controls.",
  },
  "emoji-picker": {
    nameEn: "IqujiEmojiPicker",
    descEn: "Searchable emoji picker with category filtering and clear action.",
  },
  "color-picker": {
    nameEn: "IqujiColorPicker",
    descEn: "Hex color picker with preset palette swatches and live preview.",
  },
  tabs: {
    nameEn: "IqujiTabs",
    descEn:
      "Controlled tab list supporting underline and segmented button styles.",
  },
  pagination: {
    nameEn: "IqujiPagination",
    descEn: "Controlled pagination contract with accessible page navigation.",
  },
  "form-steps": {
    nameEn: "IqujiFormSteps",
    descEn: "Numbered multi-step form process navigation.",
  },
  "settings-nav": {
    nameEn: "IqujiSettingsNav",
    descEn: "Searchable categorized settings navigation sidebar.",
  },
  badge: {
    nameEn: "IqujiBadge",
    descEn: "Lightweight category tag or notification count badge.",
  },
  alert: {
    nameEn: "IqujiAlert",
    descEn: "Contextual inline warning and information callout banner.",
  },
  "progress-bar": {
    nameEn: "IqujiProgressBar",
    descEn:
      "Accessible progress bar with indeterminate and determinate states.",
  },
  timeline: {
    nameEn: "IqujiTimeline",
    descEn: "Vertical event timeline with status indicators.",
  },
  skeleton: {
    nameEn: "IqujiSkeleton",
    descEn: "Shimmering placeholder blocks for loading content skeletons.",
  },
  "async-state-frame": {
    nameEn: "IqujiAsyncStateFrame",
    descEn:
      "Unified container switching between loading, error, empty, and ready.",
  },
  notification: {
    nameEn: "IqujiNotification",
    descEn:
      "Global toast notifications with auto-dismiss, progress, and hover pause.",
  },
  tooltip: {
    nameEn: "IqujiTooltip",
    descEn: "Hover and focus accessible floating tooltip.",
  },
  popover: {
    nameEn: "IqujiPopover",
    descEn: "Flexible anchored popover panel for custom controls.",
  },
  "dropdown-menu": {
    nameEn: "IqujiDropdownMenu",
    descEn: "Accessible action dropdown menu with items and dividers.",
  },
  dialog: {
    nameEn: "IqujiDialog",
    descEn:
      "Modal dialog with overlay backdrop, focus trap, and Escape handling.",
  },
  drawer: {
    nameEn: "IqujiDrawer",
    descEn: "Slide-out drawer panel from viewport edge with smooth exit.",
  },
  "confirm-dialog": {
    nameEn: "IqujiConfirmDialog",
    descEn: "Confirmation dialog with initial focus on Cancel for safety.",
  },
  "form-dialog": {
    nameEn: "IqujiFormDialog",
    descEn: "Expandable centered modal dialog for complex data entry.",
  },
  "search-dialog": {
    nameEn: "IqujiSearchDialog",
    descEn: "Command palette search dialog with keyboard navigation.",
  },
  "overlay-scope": {
    nameEn: "Overlay Scope",
    descEn: "Overlay provider managing nested stacking and container scoping.",
  },
  "page-header": {
    nameEn: "IqujiPageHeader",
    descEn: "Page header with title, eyebrow, description, and actions.",
  },
  "table-frame": {
    nameEn: "IqujiTableFrame",
    descEn:
      "Scrollable table wrapper with sticky header and accessibility frame.",
  },
  "scroll-area": {
    nameEn: "IqujiScrollArea",
    descEn: "Focusable named scrollable container for lists and logs.",
  },
  "workbench-layout": {
    nameEn: "IqujiWorkbenchLayout",
    descEn:
      "Three-pane responsive workbench with collapsible panels and splitters.",
  },
  "settings-layout": {
    nameEn: "IqujiSettingsLayout",
    descEn: "Layout frame organizing settings navigation and content.",
  },
  "settings-content": {
    nameEn: "IqujiSettingsContent",
    descEn: "Settings view container for headers, sections, and rows.",
  },
  "settings-section": {
    nameEn: "IqujiSettingsSection",
    descEn: "Grouped settings section with title and description boundary.",
  },
  "settings-row": {
    nameEn: "IqujiSettingsRow",
    descEn: "Settings row with left description and right control slot.",
  },
  "settings-switch-row": {
    nameEn: "IqujiSettingsSwitchRow",
    descEn: "Full-row clickable settings row with embedded switch.",
  },
  "settings-select-row": {
    nameEn: "IqujiSettingsSelectRow",
    descEn: "Settings row integrated with select dropdown control.",
  },
  "settings-action-row": {
    nameEn: "IqujiSettingsActionRow",
    descEn: "Settings row displaying current value and action button.",
  },
  "desktop-shell": {
    nameEn: "IqujiDesktopShell",
    descEn: "Desktop window container with title bar, icon rail, and canvas.",
  },
  "desktop-titlebar": {
    nameEn: "IqujiDesktopTitleBar",
    descEn:
      "Window title bar supporting navigation and custom window controls.",
  },
  "desktop-tab-strip": {
    nameEn: "IqujiDesktopTabStrip",
    descEn: "Desktop tab strip with close, add, and dirty state.",
  },
  "desktop-rail": {
    nameEn: "IqujiDesktopRail",
    descEn: "Vertical icon rail navigation with tooltips and active states.",
  },
  "desktop-account-card": {
    nameEn: "IqujiDesktopAccountCard",
    descEn: "Account profile card showing usage quota and quick actions.",
  },
  "desktop-account": {
    nameEn: "IqujiDesktopAccount",
    descEn: "Popover menu trigger wrapping desktop account card.",
  },
  "editor-presets": {
    nameEn: "Editor Presets",
    descEn:
      "CodeMirror syntax presets (Markdown, JSON, YAML, TOML) & rich text editor.",
  },
  "i18n-provider": {
    nameEn: "i18n Provider",
    descEn:
      "Internationalization state, language toggle, and dictionary interpolation.",
  },
  "icons-gallery": {
    nameEn: "Icons Gallery",
    descEn: "Complete vector icon catalog with accessibility attributes.",
  },
  "motion-provider": {
    nameEn: "Motion Provider",
    descEn: "Standard motion timing presets and reduced-motion compliance.",
  },
  "network-transport": {
    nameEn: "Network Transport",
    descEn: "HTTP transport, typed JSON client, timeouts, and cancellation.",
  },
  "query-client": {
    nameEn: "Query Client",
    descEn:
      "React Query defaults, caching policies, and error retry strategies.",
  },
  "theme-preferences": {
    nameEn: "Theme Preferences",
    descEn: "Theme mode switching, semantic CSS tokens, and prepaint script.",
  },
};
