# @iquji-web/web-network

简体中文 | [English](README.en.md)

Iquji Web 网络传输抽象层，提供原生 HTTP 传输器、JSON 适配器、可注入 Fetch 实现、统一超时控制与取消信号。

---

## 安装

```bash
npm install @iquji-web/web-network
```

---

## 核心特性与使用

### 1. JSON 传输客户端 (`createJsonTransport`)

```ts
import { createJsonTransport, JsonTransportError } from "@iquji-web/web-network";

const api = createJsonTransport({
  baseUrl: "https://api.example.com",
  timeoutMs: 10000,
  resolveHeaders: () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  }),
});

// 发起强类型 JSON 请求
try {
  const user = await api<{ id: string; name: string }>("/v1/user/profile", {
    method: "GET",
  });
  console.log(user.name);
} catch (error) {
  if (error instanceof JsonTransportError) {
    console.error(`HTTP 错误响应码: ${error.status}`);
  }
}
```

### 2. 底层 HTTP 传输器 (`createHttpTransport`)

支持注入自定义 fetch（例如在测试替身或 Node.js 环境中）：

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
    console.warn("请求超时");
  }
}
```

---

## 开发与构建

```bash
bun install --frozen-lockfile
bun run build       # 编译构建到 dist/
bun run typecheck   # 类型校验
bun run test        # 单元测试
bun run check       # 完整自检
```
