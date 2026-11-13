# @iquji-web/web-theme

简体中文 | [English](README.en.md)

Iquji Web 设计系统与主题机制，提供语义化 CSS Tokens、明暗主题与密度切换、持久化上下文 Provider 以及首帧无闪烁防闪脚本。

---

## 安装

```bash
npm install @iquji-web/web-theme
```

---

## 引入 Tokens 样式

在你的应用入口（如 `main.tsx` 或 `index.html`）优先引入：

```tsx
import "@iquji-web/web-theme/tokens.css";
```

CSS Tokens 支持通过 `[data-theme="light"]` 与 `[data-theme="dark"]` 动态适配：
- 基础颜色：`--iquji-color-canvas`, `--iquji-color-surface`, `--iquji-color-border`, `--iquji-color-text`, `--iquji-color-muted`
- 交互强调：`--iquji-color-accent`, `--iquji-color-action-primary`, `--iquji-color-action-danger`
- 间距与字号：`--iquji-space-1` 至 `--iquji-space-16`, `--iquji-font-size-*`
- 圆角与投影：`--iquji-radius-*`, `--iquji-shadow-*`

---

## 主题 Provider 与 Hook

```tsx
import { IqujiThemeProvider, useIqujiTheme } from "@iquji-web/web-theme";

export function App() {
  return (
    <IqujiThemeProvider defaultMode="system" storageKey="app.theme">
      <ThemeToggle />
    </IqujiThemeProvider>
  );
}

function ThemeToggle() {
  const { mode, resolvedTheme, setMode } = useIqujiTheme();

  return (
    <button onClick={() => setMode(resolvedTheme === "dark" ? "light" : "dark")}>
      当前主题: {resolvedTheme} (模式: {mode})
    </button>
  );
}
```

---

## 首帧防闪脚本 (Prepaint Script)

在服务端渲染 (SSR) 或 HTML `<head>` 注入 `IqujiThemePrepaintScript`，在 React 水合和页面首帧渲染前同步读取主题，彻底避免深色模式下的白色闪屏：

```tsx
import { IqujiThemePrepaintScript } from "@iquji-web/web-theme";

// 在 HTML <head> 中尽早执行
<head>
  <IqujiThemePrepaintScript storageKey="app.theme" defaultMode="system" />
</head>
```

---

## 开发与构建

```bash
bun install --frozen-lockfile
bun run build       # 编译打包到 dist/
bun run typecheck   # 类型检查
bun run test        # 单元测试
bun run check       # 完整检查
```
