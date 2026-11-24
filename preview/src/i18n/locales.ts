import type { IqujiIconName } from "@iquji-community/web-icons";
import type { ComponentCategory } from "../catalog";

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
