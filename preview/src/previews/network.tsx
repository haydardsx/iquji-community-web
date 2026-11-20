import { IqujiButton } from "@iquji-community/web-component";
import {
  createHttpTransport,
  createJsonTransport,
  type FetchImplementation,
  HttpTimeoutError,
  JsonTransportError,
} from "@iquji-community/web-network";
import { useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

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
      if (!signal) return reject(new Error("Missing abort signal"));
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

type RequestAction =
  | "raw"
  | "rawError"
  | "json"
  | "jsonError"
  | "timeout"
  | "cancel";
type RequestResult =
  | { action: RequestAction; status: "pending" }
  | { action: RequestAction; status: "success"; value: unknown }
  | { action: RequestAction; status: "error"; error: unknown };

function NetworkDemo() {
  const text = usePreviewText();
  const [result, setResult] = useState<RequestResult>();
  const [cancelController, setCancelController] =
    useState<AbortController | null>(null);
  const labels: Record<RequestAction, string> = {
    raw: text("原始响应", "Raw response"),
    rawError: text("原始错误状态", "Raw error status"),
    json: text("JSON 请求", "JSON request"),
    jsonError: text("JSON 错误", "JSON error"),
    timeout: text("超时", "Timeout"),
    cancel: text("调用方取消", "Caller cancellation"),
  };
  const run = async (
    action: RequestAction,
    request: () => Promise<unknown>,
  ) => {
    setResult({ action, status: "pending" });
    try {
      setResult({ action, status: "success", value: await request() });
    } catch (error) {
      setResult({ action, status: "error", error });
    }
  };
  const errorDetails = (error: unknown) => {
    if (error instanceof HttpTimeoutError) {
      return text(
        `请求在 ${error.timeoutMs} 毫秒后超时`,
        `Timed out after ${error.timeoutMs} ms`,
      );
    }
    if (error instanceof JsonTransportError) return `HTTP ${error.status}`;
    if (error instanceof Error && error.name === "AbortError") {
      return text("请求已取消", "Request canceled");
    }
    return text("请求失败", "Request failed");
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
              "raw",
              async () => (await raw("https://preview.invalid/status")).status,
            )
          }
          variant="secondary"
        >
          {text("读取原始响应", "Read raw response")}
        </IqujiButton>
        <IqujiButton
          onClick={() =>
            void run(
              "rawError",
              async () =>
                (await raw("https://preview.invalid/raw-error")).status,
            )
          }
          variant="secondary"
        >
          {text("保留 503 响应", "Keep the 503 response")}
        </IqujiButton>
        <IqujiButton
          onClick={() =>
            void run("json", () =>
              requestJson("items", {
                method: "POST",
                body: { source: "preview" },
              }),
            )
          }
          variant="secondary"
        >
          {text("发送 JSON", "Send JSON")}
        </IqujiButton>
        <IqujiButton
          onClick={() => void run("jsonError", () => requestJson("json-error"))}
          variant="secondary"
        >
          {text("检查错误状态", "Inspect error status")}
        </IqujiButton>
        <IqujiButton
          onClick={() =>
            void run("timeout", () =>
              createHttpTransport({
                fetchImplementation: previewFetch,
                timeoutMs: 40,
              })("https://preview.invalid/timeout"),
            )
          }
          variant="secondary"
        >
          {text("触发超时", "Trigger a timeout")}
        </IqujiButton>
        <IqujiButton
          onClick={() => {
            const controller = new AbortController();
            setCancelController(controller);
            void run("cancel", () =>
              raw("https://preview.invalid/cancel", {
                signal: controller.signal,
              }),
            ).finally(() => {
              setCancelController(null);
            });
          }}
          variant="secondary"
        >
          {text("开始可取消请求", "Start a cancelable request")}
        </IqujiButton>
        <IqujiButton
          disabled={!cancelController}
          onClick={() => cancelController?.abort()}
          variant="secondary"
        >
          {text("取消请求", "Cancel request")}
        </IqujiButton>
      </div>
      <p aria-live="polite" className="catalog-preview-value">
        {result ? (
          <>
            {labels[result.action]} ·{" "}
            {result.status === "pending"
              ? text("请求中", "In progress")
              : result.status === "success"
                ? JSON.stringify(result.value)
                : errorDetails(result.error)}
          </>
        ) : (
          text("尚未发起请求", "No requests yet")
        )}
      </p>
      <p className="catalog-preview-copy">
        {text(
          "所有请求都在本地模拟。原始传输保留响应对象，JSON 适配器检查状态并解析数据。",
          "All requests are simulated locally. The raw transport retains the response object, and the JSON adapter checks the status and parses the data.",
        )}
      </p>
    </div>
  );
}

export const networkPreviews: readonly ComponentPreview[] = [
  {
    id: "network-transport",
    name: "HTTP 与 JSON 传输",
    packageId: "network",
    packageName: "@iquji-community/web-network",
    category: "网络",
    description: "用可注入 fetch 体验原始响应、JSON 错误、超时和调用方取消。",
    keywords: "network http json fetch timeout abort transport",
    render: () => <NetworkDemo />,
  },
];
