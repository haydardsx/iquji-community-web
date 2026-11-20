# @iquji-community/web-motion

[简体中文](README.zh-CN.md)

Animation presets and a React provider that respects reduced motion preferences.

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
