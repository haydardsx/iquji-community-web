# @iquji-web/web-query

简体中文 | [English](README.en.md)

基于 TanStack React Query 的标准化查询状态管理客户端，提供合理的默认缓存策略、窗口聚焦抑制与针对认证失效（401/403）的不重试保护。

---

## 安装

```bash
npm install @iquji-web/web-query @tanstack/react-query
```

---

## 核心特性与使用

### 1. 创建 Client 与注入 Provider

```tsx
import { createIqujiQueryClient, IqujiQueryClientProvider } from "@iquji-web/web-query";

// 预设默认：staleTime=30s, gcTime=5m, 401/403 自动中断重试
const queryClient = createIqujiQueryClient();

export function App({ children }) {
  return (
    <IqujiQueryClientProvider client={queryClient}>
      {children}
    </IqujiQueryClientProvider>
  );
}
```

### 2. 重试策略判断函数

```tsx
import { shouldRetryIqujiQuery, isAuthorizationQueryError } from "@iquji-web/web-query";

// 自定义查询配置
const customClient = createIqujiQueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isAuthorizationQueryError(error)) return false;
        return failureCount < 3;
      },
    },
  },
});
```

---

## 开发与构建

```bash
bun install --frozen-lockfile
bun run build       # 编译打包到 dist/
bun run typecheck   # 类型校验
bun run test        # 单元测试
bun run check       # 自动化完整自检
```
