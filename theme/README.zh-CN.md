# @iquji-community/web-theme

[English](README.md)

提供 CSS 主题变量和 React 主题上下文，支持浅色、深色和跟随系统。

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-theme
```

```tsx
import "@iquji-community/web-theme/tokens.css";
import { IqujiThemeProvider } from "@iquji-community/web-theme";
import type { ReactNode } from "react";

export function Theme({ children }: { children: ReactNode }) {
  return <IqujiThemeProvider defaultMode="system">{children}</IqujiThemeProvider>;
}
```
