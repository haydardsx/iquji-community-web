import { afterEach, expect, mock, test } from "bun:test";
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { IqujiTerminal, type IqujiTerminalSurface } from "./index.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;

afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
  document.body.replaceChildren();
});

function mountRoot() {
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  return { host, view: root };
}

test("终端传输 UTF-8 输入和输出，更新标签时保留会话，卸载时断开", async () => {
  const { host, view } = mountRoot();
  const input: number[][] = [];
  const disconnect = mock();
  let connectCount = 0;
  let attach: (surface: IqujiTerminalSurface) => void;
  let fail: (error: Error) => void;
  const attached = new Promise<IqujiTerminalSurface>((resolve, reject) => {
    attach = resolve;
    fail = reject;
  });
  const onError = () => fail(new Error("终端初始化失败"));
  const connect = (surface: IqujiTerminalSurface) => {
    connectCount++;
    const unsubscribe = surface.onData((data) => input.push([...data]));
    attach(surface);
    return () => {
      unsubscribe();
      disconnect();
    };
  };
  const render = async (label: string) => {
    await act(async () => {
      view.render(
        <StrictMode>
          <IqujiTerminal label={label} connect={connect} onError={onError} />
        </StrictMode>,
      );
    });
  };

  await render("示例终端");
  const surface = await attached;
  expect(connectCount).toBe(1);
  expect(surface.getSize().cols).toBeGreaterThan(0);
  expect(surface.getSize().rows).toBeGreaterThan(0);
  const textarea = host.querySelector("textarea");
  expect(textarea?.getAttribute("aria-label")).toBe("示例终端");
  expect(textarea?.getAttribute("aria-keyshortcuts")).toBe("Shift+Tab");

  const clipboardData = new DataTransfer();
  clipboardData.setData("text/plain", "你好");
  textarea?.dispatchEvent(
    new ClipboardEvent("paste", { bubbles: true, clipboardData }),
  );
  expect(input).toEqual([[228, 189, 160, 229, 165, 189]]);

  const rows = host.querySelector(".xterm-rows");
  if (!rows) throw new Error("缺少终端输出区域");
  const output = new Promise<string>((resolve) => {
    const observer = new MutationObserver(() => {
      const content = rows.textContent;
      if (!content?.includes("终端输出")) return;
      observer.disconnect();
      resolve(content);
    });
    observer.observe(rows, { childList: true, subtree: true });
  });
  surface.write(new TextEncoder().encode("终端输出"));
  expect(await output).toContain("终端输出");

  await render("重新命名的终端");
  expect(textarea?.getAttribute("aria-label")).toBe("重新命名的终端");
  expect(connectCount).toBe(1);
  await act(async () => view.unmount());
  root = undefined;
  expect(disconnect).toHaveBeenCalledTimes(1);
  expect(host.querySelector("textarea")).toBeNull();
});

test("建立连接失败时清理终端并通知调用方", async () => {
  const { host, view } = mountRoot();
  let onError: () => void;
  const failed = new Promise<void>((resolve) => {
    onError = resolve;
  });
  const connect = mock(() => {
    throw new Error("连接失败");
  });
  await act(async () => {
    view.render(
      <IqujiTerminal label="示例终端" connect={connect} onError={onError} />,
    );
  });
  await failed;
  expect(connect).toHaveBeenCalledTimes(1);
  expect(host.querySelector("textarea")).toBeNull();
});
