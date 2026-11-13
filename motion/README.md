# @iquji-web/web-motion

简体中文 | [English](README.en.md)

Iquji Web 动效原语库，基于 Framer Motion 精简封装，提供控制级、浮层级及路由级的标准过渡时长、缓动曲线与 Variants，原生适配操作系统的 `prefers-reduced-motion` 偏好。

---

## 安装

```bash
npm install @iquji-web/web-motion framer-motion
```

---

## 核心特性与使用

### 1. Provider 包装

在应用外层配置 `IqujiMotionProvider`：

```tsx
import { IqujiMotionProvider } from "@iquji-web/web-motion";

export function App({ children }) {
  return (
    <IqujiMotionProvider reducedMotion="user">
      {children}
    </IqujiMotionProvider>
  );
}
```

### 2. 页面与元素进场动效

```tsx
import { IqujiMotion, iqujiMotionPresets, iqujiMotionVariants } from "@iquji-web/web-motion";

export function PageTransition({ children }) {
  return (
    <IqujiMotion.div
      initial={iqujiMotionVariants.route.initial}
      animate={iqujiMotionVariants.route.enter}
      transition={iqujiMotionPresets.route}
    >
      {children}
    </IqujiMotion.div>
  );
}
```

---

## 预设与时长标准

- **控件级 (`control`)**：时长 `0.14s`，用于按钮、选择器微交互。
- **浮层级 (`overlay`)**：时长 `0.19s`，用于弹窗、抽屉进入与退出。
- **路由级 (`route`)**：时长 `0.24s`，用于页面切换平滑位移。

---

## 开发与构建

```bash
bun install --frozen-lockfile
bun run build       # 编译打包到 dist/
bun run typecheck   # 类型校验
bun run test        # 单元测试
bun run check       # 完整校验
```
