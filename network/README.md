# @iquji-community/web-network

[简体中文](README.zh-CN.md)

HTTP requests and typed JSON responses with timeouts, cancellation and injectable fetch.

```sh
npm install @iquji-community/web-network
```

```ts
import { createJsonTransport } from "@iquji-community/web-network";

const request = createJsonTransport({ baseUrl: "https://api.example.com" });
export const getStatus = () => request<{ status: string }>("/status");
```
