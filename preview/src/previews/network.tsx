import { IqujiButton } from "@iquji-cloud/web-component";
import {
  createHttpTransport,
  createJsonTransport,
  type FetchImplementation,
  HttpTimeoutError,
  JsonTransportError,
} from "@iquji-cloud/web-network";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";

const previewFetch: FetchImplementation = async (input, init) => {
  const request = new Request(input, init);
  const path = new URL(request.url).pathname;
  if (path === "/raw-error") return new Response("offline", { status: 503 });
  if (path === "/api/json-error") {
    return Response.json({ message: "local failure" }, { status: 422 });
  }
  if (path === "/timeout" || path === "/cancel") {
    return new Promise((_resolve, reject) => {
      const signal = init?.signal;
      if (!signal) return reject(new Error("缺少取消信号"));
      const rejectOnAbort = () => reject(signal.reason);
      if (signal.aborted) rejectOnAbort();
      else signal.addEventListener("abort", rejectOnAbort, { once: true });
    });
  }
  return Response.json({
    method: request.method,
    path,
    body: request.body ? await request.text() : null,
  });
};

function NetworkDemo() {
  const [result, setResult] = useState("尚未发起请求");
  const [cancelController, setCancelController] =
    useState<AbortController | null>(null);
  const run = async (label: string, action: () => Promise<unknown>) => {
    setResult(`${label}：请求中`);
    try {
      const value = await action();
      setResult(`${label}：${JSON.stringify(value)}`);
    } catch (error) {
      const details =
        error instanceof HttpTimeoutError
          ? `${error.name}（${error.timeoutMs} ms）`
          : error instanceof JsonTransportError
            ? `${error.name}（HTTP ${error.status}）`
            : error instanceof Error
              ? `${error.name}：${error.message}`
              : String(error);
      setResult(`${label}：${details}`);
    }
  };
  const raw = createHttpTransport({ fetchImplementation: previewFetch });
  const requestJson = createJsonTransport({
    baseUrl: "https://preview.invalid/api",
    fetchImplementation: previewFetch,
  });
  return (
    <div className="catalog-preview-stack catalog-preview-wide">
      <div className="catalog-preview-grid">
        <IqujiButton
          onClick={() =>
            void run(
              "原始响应",
              async () => (await raw("https://preview.invalid/status")).status,
            )
          }
          variant="secondary"
        >
          读取原始响应
        </IqujiButton>
        <IqujiButton
          onClick={() =>
            void run(
              "原始错误状态",
              async () =>
                (await raw("https://preview.invalid/raw-error")).status,
            )
          }
          variant="secondary"
        >
          保留 503 响应
        </IqujiButton>
        <IqujiButton
          onClick={() =>
            void run("JSON 请求", () =>
              requestJson("items", {
                method: "POST",
                body: { source: "preview" },
              }),
            )
          }
          variant="secondary"
        >
          发送 JSON
        </IqujiButton>
        <IqujiButton
          onClick={() => void run("JSON 错误", () => requestJson("json-error"))}
          variant="secondary"
        >
          检查错误状态
        </IqujiButton>
        <IqujiButton
          onClick={() =>
            void run("超时", () =>
              createHttpTransport({
                fetchImplementation: previewFetch,
                timeoutMs: 40,
              })("https://preview.invalid/timeout"),
            )
          }
          variant="secondary"
        >
          触发超时
        </IqujiButton>
        <IqujiButton
          onClick={() => {
            const controller = new AbortController();
            setCancelController(controller);
            void run("调用方取消", () =>
              raw("https://preview.invalid/cancel", {
                signal: controller.signal,
              }),
            ).finally(() => {
              setCancelController(null);
            });
          }}
          variant="secondary"
        >
          开始可取消请求
        </IqujiButton>
        <IqujiButton
          disabled={!cancelController}
          onClick={() => cancelController?.abort()}
          variant="secondary"
        >
          取消请求
        </IqujiButton>
      </div>
      <p aria-live="polite" className="catalog-preview-value">
        {result}
      </p>
      <p className="catalog-preview-copy">
        所有请求都由本地 fetch 替身处理；原始传输返回 Response，JSON
        适配器负责状态判断和解析。
      </p>
    </div>
  );
}

export const networkPreviews: readonly ComponentPreview[] = [
  {
    id: "network-transport",
    name: "HTTP 与 JSON 传输",
    packageId: "network",
    packageName: "@iquji-cloud/web-network",
    category: "网络",
    description: "用可注入 fetch 体验原始响应、JSON 错误、超时和调用方取消。",
    keywords: "network http json fetch timeout abort transport",
    render: () => <NetworkDemo />,
  },
];
