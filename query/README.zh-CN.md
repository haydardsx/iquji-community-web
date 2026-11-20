# @iquji-community/web-query

[English](README.md)

提供 TanStack Query 客户端和 React 上下文，可配置重试行为。

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-query
```

```tsx
import { createIqujiQueryClient, IqujiQueryProvider } from "@iquji-community/web-query";
import type { ReactNode } from "react";

const client = createIqujiQueryClient();

export function Queries({ children }: { children: ReactNode }) {
  return <IqujiQueryProvider client={client}>{children}</IqujiQueryProvider>;
}
```
