# Web network

`@iquji-web/web-network` 提供通用 HTTP 传输，不包含认证、业务错误、重试或响应数据协议。它由 Community Web 子仓维护，包名与正式出口保持稳定。

安装使用本目录锁文件，运行 `bun install --frozen-lockfile` 和 `bun run check`。正式入口只导出 `dist` 中的 JavaScript、类型声明，不要求消费者编译本包源码。

`@iquji-web/web-network/test-support` 单独提供可注入 FetchRecorder，不从生产主入口导出。

```ts
import { createHttpTransport } from "@iquji-web/web-network";

const request = createHttpTransport({ timeoutMs: 15_000 });
const controller = new AbortController();
const response = await request("/api/status", {
  method: "GET",
  credentials: "include",
  signal: controller.signal,
});
```

`createHttpTransport({ fetchImplementation?, timeoutMs? })` 返回接受 `RequestInfo | URL` 和 `RequestInit & { timeoutMs?: number }` 的请求函数。它保留请求地址、正文、头部与 fetch 选项，直接返回原始 `Response`，包括非成功状态、响应头、重定向地址和未读取的响应流；状态判断与正文解析由消费者负责。

默认不设置超时。实例与逐请求 `timeoutMs` 接受 0 到 2147483647 的有限毫秒值；逐请求设置覆盖实例，0 关闭超时。超时覆盖等待响应头的阶段，随后清理定时器，不读取消费者正文。超时中止底层信号并抛出 `HttpTimeoutError`，其 `name` 为 `TimeoutError`、`timeoutMs` 为实际设置。调用方取消保留原始原因；请求返回后，调用方取消仍可传递给底层响应流。正文读取的时限由消费者管理。

`fetchImplementation` 可注入浏览器 fetch、测试替身或宿主原生传输，并应遵守 fetch 的 `AbortSignal` 语义。代理连接由宿主原生或服务端适配器执行，本包不提供 `proxy` 配置。浏览器 fetch 使用浏览器自身的网络环境，不能通过请求选项指定自定义代理。

`createJsonTransport` 在共享原始传输上保留现有合同：规范化 `baseUrl` 与相对路径、合并默认和请求头、序列化 JSON 正文、传递凭据及缓存设置。非成功状态抛出只含状态码的 `JsonTransportError`，成功状态解析 JSON；不读取失败响应正文。该适配器也接受实例与逐请求 `timeoutMs`。
