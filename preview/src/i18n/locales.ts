import type { Locale, MessageCatalog } from "@iquji-community/web-i18n";
import type { IqujiIconName } from "@iquji-community/web-icons";
import type { ComponentCategory } from "../catalog";

export type PreviewMessageKey =
  | "brand.title"
  | "brand.subtitle"
  | "brand.community"
  | "document.title"
  | "nav.label"
  | "nav.overview"
  | "nav.components"
  | "nav.docs"
  | "nav.toggle"
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
  | "overview.stat.license"
  | "overview.filter.all"
  | "overview.filter.label"
  | "overview.card.viewDemo"
  | "overview.group.count"
  | "sidebar.overview"
  | "sidebar.all"
  | "sidebar.categories"
  | "sidebar.navigation"
  | "sidebar.close"
  | "sidebar.footer.count"
  | "detail.back"
  | "detail.prev"
  | "detail.next"
  | "detail.package"
  | "detail.category"
  | "detail.preview"
  | "detail.empty.title"
  | "detail.empty.desc"
  | "detail.empty.clear";

export const PREVIEW_LOCALES: Record<
  Locale,
  MessageCatalog<PreviewMessageKey>
> = {
  "zh-CN": {
    "brand.title": "Iquji Web",
    "brand.subtitle": "社区组件预览",
    "brand.community": "社区版",
    "document.title": "Iquji Web 能力预览",
    "nav.label": "主导航",
    "nav.overview": "总览",
    "nav.components": "组件与能力",
    "nav.docs": "源码与文档",
    "nav.toggle": "切换导航菜单",
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
    "overview.stat.license": "开源协议",
    "overview.filter.all": "全部",
    "overview.filter.label": "按分类筛选",
    "overview.card.viewDemo": "查看交互演示",
    "overview.group.count": "{count} 个能力",
    "sidebar.overview": "组件总览",
    "sidebar.all": "全部能力",
    "sidebar.categories": "能力分类",
    "sidebar.navigation": "组件导航",
    "sidebar.close": "关闭导航侧栏",
    "sidebar.footer.count": "{count} 个能力",
    "detail.back": "返回总览",
    "detail.prev": "上一个",
    "detail.next": "下一个",
    "detail.package": "所属包",
    "detail.category": "分类",
    "detail.preview": "{name}交互预览",
    "detail.empty.title": "未找到匹配能力",
    "detail.empty.desc": "请尝试更换搜索关键词或清除分类筛选。",
    "detail.empty.clear": "清除筛选",
  },
  "en-US": {
    "brand.title": "Iquji Web",
    "brand.subtitle": "Community Preview",
    "brand.community": "Community",
    "document.title": "Iquji Web Community Preview",
    "nav.label": "Main Navigation",
    "nav.overview": "Overview",
    "nav.components": "Components",
    "nav.docs": "Source & Docs",
    "nav.toggle": "Toggle navigation menu",
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
    "overview.stat.license": "License",
    "overview.filter.all": "All",
    "overview.filter.label": "Filter by category",
    "overview.card.viewDemo": "View Interactive Demo",
    "overview.group.count": "{count} capabilities",
    "sidebar.overview": "Overview",
    "sidebar.all": "All Capabilities",
    "sidebar.categories": "Categories",
    "sidebar.navigation": "Component navigation",
    "sidebar.close": "Close navigation sidebar",
    "sidebar.footer.count": "{count} capabilities",
    "detail.back": "Back to Overview",
    "detail.prev": "Previous",
    "detail.next": "Next",
    "detail.package": "Package",
    "detail.category": "Category",
    "detail.preview": "{name} interactive preview",
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
    descZh: "语言切换、词典与模板插值",
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
    descZh: "页面进场动画与减少动态效果偏好适配",
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
