# @iquji-community/web-theme

[简体中文](README.zh-CN.md)

CSS tokens, a React theme provider and light, dark and system modes.

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
