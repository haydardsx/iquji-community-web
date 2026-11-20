# @iquji-community/web-motion

[English](README.md)

提供动画预设和 React 动效上下文，支持系统的减少动态效果偏好。

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-motion
```

```tsx
import { IqujiMotionProvider } from "@iquji-community/web-motion";
import type { ReactNode } from "react";

export function Motion({ children }: { children: ReactNode }) {
  return <IqujiMotionProvider>{children}</IqujiMotionProvider>;
}
```
