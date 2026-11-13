import { expect, test } from "bun:test";
import {
  createJsonTransport,
  HttpTimeoutError,
  JsonTransportError,
} from "./index.js";
import { createFetchRecorder } from "./test-support.js";

const testOrigin = new URL("https://example.invalid");

test("可注入传输规范化地址并保留调用方凭据缓存和JSON请求", async () => {
  const recorder = createFetchRecorder(() => Response.json({ ready: true }));
  const request = createJsonTransport({
    baseUrl: new URL("/api///", testOrigin).href,
    fetchImplementation: recorder.fetchImplementation,
    credentials: "include",
    cache: "no-store",
    resolveHeaders: async () => ({
      "x-source": "default",
      "x-preserved": "value",
    }),
  });
  expect(
    await request<{ ready: boolean }>("/status", {
      method: "POST",
      body: { value: 3 },
      headers: { "x-source": "request" },
    }),
  ).toEqual({ ready: true });
  const recorded = recorder.records[0]?.request;
  expect(recorded?.url).toBe("https://example.invalid/api/status");
  expect(recorded?.credentials).toBe("include");
  expect(recorded?.cache).toBe("no-store");
  expect(recorded?.method).toBe("POST");
  expect(recorded?.headers.get("x-source")).toBe("request");
  expect(recorded?.headers.get("x-preserved")).toBe("value");
  expect(recorded?.headers.get("content-type")).toBe("application/json");
  expect(recorded?.headers.has("Authorization")).toBe(false);
  expect(await recorded?.json()).toEqual({ value: 3 });
});

test("取消信号与取消失败沿可注入fetch边界传递", async () => {
  const controller = new AbortController();
  let notifyStarted: (() => void) | undefined;
  const started = new Promise<void>((resolve) => {
    notifyStarted = resolve;
  });
  const request = createJsonTransport({
    baseUrl: testOrigin.href,
    fetchImplementation: async (_input, init) => {
      expect(init?.signal).toBe(controller.signal);
      notifyStarted?.();
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          "abort",
          () => reject(init.signal?.reason),
          {
            once: true,
          },
        );
      });
    },
  });
  const pending = request("status", { signal: controller.signal });
  await started;
  controller.abort();
  await expect(pending).rejects.toBeInstanceOf(DOMException);
});

test("失败状态只公开状态码，响应内容不进入错误", async () => {
  const request = createJsonTransport({
    baseUrl: testOrigin.href,
    fetchImplementation: async () =>
      new Response("私有响应内容", { status: 403 }),
  });
  try {
    await request("status");
    throw new Error("请求应失败");
  } catch (error) {
    expect(error).toBeInstanceOf(JsonTransportError);
    expect((error as JsonTransportError).status).toBe(403);
    expect((error as Error).message).not.toContain("私有响应内容");
  }
});

test("JSON 适配器使用共享传输的逐请求超时", async () => {
  const request = createJsonTransport({
    baseUrl: testOrigin.href,
    fetchImplementation: async () => new Promise<Response>(() => {}),
  });
  await expect(request("status", { timeoutMs: 5 })).rejects.toBeInstanceOf(
    HttpTimeoutError,
  );
});
