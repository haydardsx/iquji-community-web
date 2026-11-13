import { expect, test } from "bun:test";
import { createIqujiQueryClient, isAuthorizationQueryError } from "./index.js";

test("真实QueryClient对授权失败不重试，其余临时失败按预算重试", async () => {
  const client = createIqujiQueryClient({
    defaultOptions: { queries: { retryDelay: 0 } },
  });
  const denied = Object.assign(new Error("denied"), { status: 403 });
  let authorizationAttempts = 0;
  await expect(
    client.fetchQuery({
      queryKey: ["denied"],
      queryFn: () => {
        authorizationAttempts++;
        throw denied;
      },
    }),
  ).rejects.toBe(denied);
  expect(authorizationAttempts).toBe(1);
  let attempts = 0;
  expect(
    await client.fetchQuery<string>({
      queryKey: ["transient"],
      queryFn: () => {
        if (++attempts < 3) throw new Error("offline");
        return "ready";
      },
    }),
  ).toBe("ready");
  expect(attempts).toBe(3);
  expect(isAuthorizationQueryError({ response: { status: 401 } })).toBe(true);
  client.clear();
});

test("应用可覆盖查询默认值且不同client不共享数据缓存", () => {
  const first = createIqujiQueryClient({
    defaultOptions: { queries: { staleTime: 15 } },
  });
  const second = createIqujiQueryClient();
  first.setQueryData(["value"], 3);
  expect(first.getDefaultOptions().queries?.staleTime).toBe(15);
  expect(first.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  expect(first.getDefaultOptions().mutations?.retry).toBe(false);
  expect(second.getQueryData(["value"])).toBeUndefined();
  first.clear();
  second.clear();
});
