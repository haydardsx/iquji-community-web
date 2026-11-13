# @iquji-web/web-query

[简体中文](README.md) | English

Standardized query state client built on TanStack React Query. Configured with resilient defaults, focus refetch suppression, and authentication-aware retry policies (suppressing retries on 401/403).

---

## Installation

```bash
npm install @iquji-web/web-query @tanstack/react-query
```

---

## Usage

### 1. Client Creation & Provider Setup

```tsx
import { createIqujiQueryClient, IqujiQueryClientProvider } from "@iquji-web/web-query";

// Default settings: staleTime=30s, gcTime=5m, retries suppressed for 401/403
const queryClient = createIqujiQueryClient();

export function App({ children }) {
  return (
    <IqujiQueryClientProvider client={queryClient}>
      {children}
    </IqujiQueryClientProvider>
  );
}
```

### 2. Custom Retry Configuration

```tsx
import { shouldRetryIqujiQuery, isAuthorizationQueryError } from "@iquji-web/web-query";

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

## Development & Build

```bash
bun install --frozen-lockfile
bun run build       # Compile dist/
bun run typecheck   # Typecheck
bun run test        # Unit tests
bun run check       # Complete test suite
```
