import type { ReactNode } from "react";

export const CATEGORIES = [
  "基础",
  "表单",
  "导航",
  "反馈",
  "浮层",
  "布局与桌面",
  "编辑器",
  "国际化",
  "图标",
  "动效",
  "网络",
  "查询",
  "主题",
] as const;

export type ComponentCategory = (typeof CATEGORIES)[number];

export const COMMUNITY_PACKAGES = [
  "component",
  "editor",
  "i18n",
  "icons",
  "motion",
  "network",
  "query",
  "theme",
] as const;

export type CommunityPackage = (typeof COMMUNITY_PACKAGES)[number];

export type CommunityPreviewCoverage = Readonly<
  Record<CommunityPackage, Readonly<Record<string, readonly string[]>>>
>;

const COMPONENT_PREVIEW_IDS = [
  "button",
  "icon-button",
  "button-link",
  "status-badge",
  "panel",
  "page-heading",
  "empty-state",
  "loading-state",
  "app-shell",
  "field",
  "input",
  "textarea",
  "select",
  "multi-select",
  "checkbox",
  "radio",
  "switch",
  "segmented-control",
  "calendar",
  "date-picker",
  "color-picker",
  "emoji-picker",
  "data-table",
  "tabs",
  "pagination",
  "form-steps",
  "settings-nav",
  "badge",
  "alert",
  "notification",
  "progress-bar",
  "timeline",
  "skeleton",
  "async-state-frame",
  "tooltip",
  "popover",
  "dropdown-menu",
  "dialog",
  "drawer",
  "confirm-dialog",
  "form-dialog",
  "search-dialog",
  "overlay-scope",
  "page-header",
  "table-frame",
  "data-table",
  "scroll-area",
  "workbench-layout",
  "settings-layout",
  "settings-content",
  "settings-section",
  "settings-row",
  "settings-switch-row",
  "settings-select-row",
  "settings-action-row",
  "desktop-shell",
  "desktop-titlebar",
  "desktop-tab-strip",
  "desktop-rail",
  "desktop-account-card",
  "desktop-account",
] as const;

export const COMMUNITY_PREVIEW_COVERAGE: CommunityPreviewCoverage = {
  component: {
    ".": COMPONENT_PREVIEW_IDS,
    "./styles.css": COMPONENT_PREVIEW_IDS,
  },
  editor: {
    ".": ["editor-presets"],
    "./text": ["editor-presets"],
    "./styles.css": ["editor-presets"],
  },
  i18n: { ".": ["i18n-provider"] },
  icons: { ".": ["icons-gallery"] },
  motion: { ".": ["motion-provider"] },
  network: {
    ".": ["network-transport"],
  },
  query: { ".": ["query-client"] },
  theme: {
    ".": ["theme-preferences"],
    "./tokens.css": ["theme-preferences"],
  },
};

export type ComponentPreview = {
  id: string;
  name: string;
  category: ComponentCategory;
  packageId?: CommunityPackage;
  packageName?: string;
  description: string;
  keywords: string;
  render: () => ReactNode;
};
