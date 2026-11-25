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

`createTerminalConnection(path, { ticket }, onClose)` 返回用于连接终端视图的函数。
`path` 使用与当前网页同源的路径。WebSocket 打开后，首条 JSON 消息携带票据和终端的列数、行数。
终端输入和输出使用二进制帧，尺寸变更使用含 `cols` 和 `rows` 的 JSON 消息。
终端视图提供 `getSize`、`onData`、`onResize` 和 `write`。调用连接函数返回的清理函数，
即可取消订阅并关闭 WebSocket。
