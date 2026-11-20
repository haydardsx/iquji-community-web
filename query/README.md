# @iquji-community/web-query

[简体中文](README.zh-CN.md)

A TanStack Query client and React provider with configurable retry behavior.

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
