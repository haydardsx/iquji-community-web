# @iquji-web/web-component

简体中文 | [English](README.en.md)

Iquji Web 核心 UI 组件库，基于 Base UI 与 WAI-ARIA 规范构建，涵盖常用表单控件、数据展示、导航、反馈通知、浮层对话框、三栏工作台及桌面端应用外壳。

---

## 安装

```bash
npm install @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons
```

> **注意**：组件库要求消费应用提供 `react`、`react-dom` (>= 19) 及 Base UI 依赖，并显式引入样式：
> ```tsx
> import "@iquji-web/web-theme/tokens.css";
> import "@iquji-web/web-component/styles.css";
> ```

---

## 核心组件分类

### 1. 基础与操作 (General)
- **`IqujiButton` / `IconButton` / `IqujiButtonLink`**：支持 `primary`、`secondary`、`ghost`、`danger` 等语义样式，提供原生 `disabled` 与 `loading` 防重防失焦保护。
- **`StatusBadge` / `IqujiBadge`**：用于状态标识与数量徽标。
- **`IqujiEmptyState` / `IqujiLoadingState`**：空白与加载占位视图。

### 2. 表单控件 (Forms)
- **`IqujiField`**：表单字段容器，自动关联 `label`、必填标记、辅助说明、校验错误与 `aria-describedby`。
- **输入与选择**：`IqujiInput`、`IqujiTextarea`、`IqujiSelect`、`IqujiMultiSelect`、`IqujiCheckbox`、`IqujiRadio`、`IqujiSwitch`、`IqujiSegmentedControl`。
- **时间与特殊输入**：`IqujiCalendar`、`IqujiDatePicker`、`IqujiColorPicker`、`IqujiEmojiPicker`。

### 3. 导航与步骤 (Navigation)
- **`IqujiTabs`**：下划线或分段按钮样式的标签页切换，支持方向键导航与受控状态。
- **`IqujiPagination`**：标准受控分页组件。
- **`IqujiFormSteps`**：清晰的数字步骤导航。
- **`IqujiSettingsNav`**：设置中心侧边分类导航。

### 4. 浮层与对话框 (Overlays)
- **`IqujiOverlayProvider`**：应用级浮层容器上下文，统筹层级与焦点。
- **`IqujiDialog` / `IqujiDrawer`**：受控模态弹窗与抽屉，具备优雅的进入/退出动画和焦点管理。
- **`IqujiConfirmDialog`**：二次确认弹窗，默认安全聚焦取消操作，防止误触危险操作。
- **`IqujiFormDialog`**：支持居中放大展开的沉浸式表单对话框。
- **`IqujiSearchDialog`**：跨组过滤、键盘快捷操作的通用全局搜索框。
- **`IqujiTooltip` / `IqujiPopover` / `IqujiDropdownMenu`**：轻量定位弹出层。

### 5. 反馈与通知 (Feedback)
- **`IqujiNotificationProvider` & `useIqujiNotification`**：全局非阻塞轻量通知，支持自动关闭、同 key 更新、视觉倒计时进度与鼠标悬停暂停。
- **`IqujiAlert`**：内嵌行内提醒，用于页面级或区块级提示。
- **`IqujiProgressBar` / `IqujiSkeleton` / `IqujiTimeline`**：进度条、骨架屏与时间线。

### 6. 布局与工作台 (Layout & Desktop)
- **`AppShell`**：经典应用外框与侧栏导航分组。
- **`IqujiWorkbenchLayout`**：经典三栏自适应工作台（左侧栏、中央主屏、右侧栏，支持折叠与分隔线拖拽）。
- **`IqujiDesktopShell`**：适用于 Electron / Tauri 的桌面端窗口外壳（支持自定义标题栏、标签条与侧栏）。
- **`IqujiDataTable` / `IqujiTableFrame`**：统一的数据表格与滚动容器。

---

## 快速使用示例

```tsx
import { useState } from "react";
import {
  IqujiOverlayProvider,
  IqujiButton,
  IqujiDialog,
  IqujiField,
  IqujiInput
} from "@iquji-web/web-component";

export function Example() {
  const [open, setOpen] = useState(false);

  return (
    <IqujiOverlayProvider>
      <IqujiButton onClick={() => setOpen(true)}>打开对话框</IqujiButton>

      <IqujiDialog
        open={open}
        onOpenChange={setOpen}
        title="编辑配置"
        description="修改项目的基本设置并保存。"
        closeLabel="关闭"
        actions={
          <>
            <IqujiButton onClick={() => setOpen(false)}>保存</IqujiButton>
            <IqujiButton variant="secondary" onClick={() => setOpen(false)}>取消</IqujiButton>
          </>
        }
      >
        <IqujiField label="项目名称" required>
          <IqujiInput placeholder="输入项目名称" />
        </IqujiField>
      </IqujiDialog>
    </IqujiOverlayProvider>
  );
}
```

---

## 开发与构建

```bash
bun install --frozen-lockfile
bun run build       # 编译构建到 dist/
bun run typecheck   # TypeScript 类型校验
bun run test        # 单元测试与无障碍测试
bun run check       # 全量自检
```
