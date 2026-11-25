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

`createTerminalConnection(path, { ticket }, onClose)` returns a connector for a
terminal surface. Pass a same-origin path. Opening the socket sends the ticket,
columns and rows in its first JSON message. Terminal input and output use
binary frames, and resize messages carry `cols` and `rows` as JSON. The surface
supplies `getSize`, `onData`, `onResize` and `write`. Call the cleanup function
returned by the connector to remove the subscriptions and close the socket.
