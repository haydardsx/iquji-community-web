import { expect, test } from "bun:test";
import { createHttpTransport, HttpTimeoutError } from "./index.js";

const testUrl = new URL("https://example.invalid/upload");

test("原始传输保留 Request、请求选项和失败 Response，不读取响应正文", async () => {
  const input = new Request(testUrl);
  const body = new FormData();
  body.set("attachment", new Blob(["内容"]), "test.txt");
  const response = new Response("业务错误", {
    status: 422,
    headers: { "x-result": "preserved" },
  });
  const options: RequestInit = {
    method: "PATCH",
    body,
    headers: { "x-request": "value" },
    credentials: "include",
    cache: "no-store",
    redirect: "manual",
    mode: "cors",
  };
  const request = createHttpTransport({
    fetchImplementation: async (actualInput, actualOptions) => {
      expect(actualInput).toBe(input);
      expect(actualOptions).toEqual(options);
      expect(actualOptions?.body).toBe(body);
      return response;
    },
  });
  const result = await request(input, options);
  expect(result).toBe(response);
  expect(result.bodyUsed).toBe(false);
  expect(result.status).toBe(422);
  expect(result.headers.get("x-result")).toBe("preserved");
  expect(await result.text()).toBe("业务错误");
});

test("默认 fetch 可用，URL 与未解析的流响应沿正式出口返回", async () => {
  const request = createHttpTransport();
  const response = await request(new URL("data:text/plain,raw-response"));
  expect(response.bodyUsed).toBe(false);
  expect(await response.text()).toBe("raw-response");
});

test("传输失败保持调用方错误实例", async () => {
  const failure = new TypeError("连接不可用");
  const request = createHttpTransport({
    fetchImplementation: async () => {
      throw failure;
    },
  });
  await expect(request(testUrl)).rejects.toBe(failure);
});

test("请求超时覆盖实例设置、取消底层传输并携带正式超时错误", async () => {
  let capturedSignal: AbortSignal | null | undefined;
  const request = createHttpTransport({
    timeoutMs: 1_000,
    fetchImplementation: async (_input, init) => {
      capturedSignal = init?.signal;
      return new Promise<Response>(() => {});
    },
  });
  try {
    await request(testUrl, { timeoutMs: 5 });
    throw new Error("请求应超时");
  } catch (error) {
    expect(error).toBeInstanceOf(HttpTimeoutError);
    expect((error as HttpTimeoutError).name).toBe("TimeoutError");
    expect((error as HttpTimeoutError).timeoutMs).toBe(5);
    expect(capturedSignal?.aborted).toBe(true);
    expect(capturedSignal?.reason).toBe(error);
  }
});

test("逐请求设为零可以关闭实例超时且不向 fetch 传递私有选项", async () => {
  const request = createHttpTransport({
    timeoutMs: 5,
    fetchImplementation: async (_input, init) => {
      expect(init).toEqual({});
      await new Promise((resolve) => setTimeout(resolve, 15));
      return new Response(null, { status: 204 });
    },
  });
  expect((await request(testUrl, { timeoutMs: 0 })).status).toBe(204);
});

test("未启用超时时保留取消信号，取消原因沿注入边界返回", async () => {
  const controller = new AbortController();
  const reason = new Error("用户取消");
  const request = createHttpTransport({
    fetchImplementation: async (_input, init) => {
      expect(init?.signal).toBe(controller.signal);
      return new Promise<Response>(() => {});
    },
  });
  const pending = request(testUrl, { signal: controller.signal });
  controller.abort(reason);
  await expect(pending).rejects.toBe(reason);
});

test("请求已经取消时不会调用底层 fetch", async () => {
  const signal = AbortSignal.abort();
  let invoked = false;
  const request = createHttpTransport({
    fetchImplementation: async () => {
      invoked = true;
      return new Response();
    },
  });
  await expect(request(testUrl, { signal })).rejects.toBe(signal.reason);
  expect(invoked).toBe(false);
});

test("Request 自带的取消信号也可中断等待", async () => {
  const controller = new AbortController();
  const reason = new Error("取消 Request");
  const request = createHttpTransport({
    fetchImplementation: async () => new Promise<Response>(() => {}),
  });
  const pending = request(new Request(testUrl, { signal: controller.signal }));
  controller.abort(reason);
  await expect(pending).rejects.toBe(reason);
});

test("收到响应后清理超时，调用方取消仍传播到底层信号", async () => {
  const controller = new AbortController();
  let capturedSignal: AbortSignal | null | undefined;
  const request = createHttpTransport({
    timeoutMs: 5,
    fetchImplementation: async (_input, init) => {
      capturedSignal = init?.signal;
      return new Response("未读取的正文");
    },
  });
  const response = await request(testUrl, { signal: controller.signal });
  await new Promise((resolve) => setTimeout(resolve, 15));
  expect(capturedSignal?.aborted).toBe(false);
  expect(response.bodyUsed).toBe(false);
  controller.abort();
  expect(capturedSignal?.aborted).toBe(true);
  expect(capturedSignal?.reason).toBe(controller.signal.reason);
});

test("不合法的超时在发送前失败", async () => {
  for (const timeoutMs of [-1, Number.NaN, Infinity, 2_147_483_648]) {
    expect(() => createHttpTransport({ timeoutMs })).toThrow(RangeError);
    const request = createHttpTransport({
      fetchImplementation: async () => {
        throw new Error("不应发送请求");
      },
    });
    await expect(request(testUrl, { timeoutMs })).rejects.toBeInstanceOf(
      RangeError,
    );
  }
});
