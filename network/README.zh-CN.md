# @iquji-community/web-network

[English](README.md)

提供 HTTP 请求和带类型的 JSON 响应，支持超时、取消和注入 fetch。

```sh
npm install @iquji-community/web-network
```

```ts
import { createJsonTransport } from "@iquji-community/web-network";

const request = createJsonTransport({ baseUrl: "https://api.example.com" });
export const getStatus = () => request<{ status: string }>("/status");
```
