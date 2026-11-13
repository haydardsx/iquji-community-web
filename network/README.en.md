# @iquji-web/web-network

[简体中文](README.md) | English

HTTP transport abstraction layer for Iquji Web. Provides raw HTTP transport, typed JSON client adapters, injectable fetch implementations, unified timeout handling, and cancellation signals.

---

## Installation

```bash
npm install @iquji-web/web-network
```

---

## Usage

### 1. JSON Transport Client (`createJsonTransport`)

```ts
import { createJsonTransport, JsonTransportError } from "@iquji-web/web-network";

const api = createJsonTransport({
  baseUrl: "https://api.example.com",
  timeoutMs: 10000,
  resolveHeaders: () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  }),
});

try {
  const user = await api<{ id: string; name: string }>("/v1/user/profile", {
    method: "GET",
  });
  console.log(user.name);
} catch (error) {
  if (error instanceof JsonTransportError) {
    console.error(`HTTP failed with status: ${error.status}`);
  }
}
```

### 2. HTTP Transport (`createHttpTransport`)

Supports injecting custom fetch implementations (for test mocks or specialized runtime environments):

```ts
import { createHttpTransport, HttpTimeoutError } from "@iquji-web/web-network";

const transport = createHttpTransport({
  timeoutMs: 5000,
});

try {
  const response = await transport.request("https://api.example.com/health");
  console.log(response.status);
} catch (err) {
  if (err instanceof HttpTimeoutError) {
    console.warn("Request timed out");
  }
}
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
