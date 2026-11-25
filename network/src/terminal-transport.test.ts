import { afterEach, beforeEach, expect, test } from "bun:test";
import { createTerminalConnection, type TerminalSize } from "./index.js";

class TestSocket extends EventTarget {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 3;
  static instances: TestSocket[] = [];

  binaryType = "blob";
  readyState = TestSocket.CONNECTING;
  frames: (string | Uint8Array)[] = [];

  constructor(readonly url: string) {
    super();
    TestSocket.instances.push(this);
  }

  open() {
    this.readyState = TestSocket.OPEN;
    this.dispatchEvent(new Event("open"));
  }

  send(data: string | Uint8Array) {
    expect(this.readyState).toBe(TestSocket.OPEN);
    this.frames.push(data);
  }

  receive(data: unknown) {
    this.dispatchEvent(new MessageEvent("message", { data }));
  }

  close(reason = "") {
    this.readyState = TestSocket.CLOSED;
    this.dispatchEvent(new CloseEvent("close", { reason }));
  }
}

const originals = Object.getOwnPropertyDescriptors(globalThis);
beforeEach(() => {
  TestSocket.instances = [];
  Object.defineProperty(globalThis, "WebSocket", {
    configurable: true,
    value: TestSocket,
  });
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: new URL("https://example.invalid/app"),
  });
});
afterEach(() => {
  for (const key of ["WebSocket", "location"] as const) {
    const original = originals[key];
    if (original) Object.defineProperty(globalThis, key, original);
    else Reflect.deleteProperty(globalThis, key);
  }
});

function createSurface() {
  let onData: ((data: Uint8Array) => void) | undefined;
  let onResize: ((size: TerminalSize) => void) | undefined;
  const output: Uint8Array[] = [];
  return {
    output,
    send: (data: Uint8Array) => onData?.(data),
    resize: (size: TerminalSize) => onResize?.(size),
    listening: () => Boolean(onData || onResize),
    surface: {
      getSize: () => ({ cols: 91, rows: 26 }),
      onData(listener: (data: Uint8Array) => void) {
        onData = listener;
        return () => {
          onData = undefined;
        };
      },
      onResize(listener: (size: TerminalSize) => void) {
        onResize = listener;
        return () => {
          onResize = undefined;
        };
      },
      write(data: Uint8Array) {
        output.push(data);
      },
    },
  };
}

function captureClose() {
  const events: CloseEvent[] = [];
  return { events, onClose: (event: CloseEvent) => events.push(event) };
}

test("终端首帧发送票据与尺寸，输入输出和尺寸变化使用各自的帧类型", () => {
  const ui = createSurface();
  const connect = createTerminalConnection(
    "/terminal",
    { ticket: "example" },
    () => {},
  );
  expect(TestSocket.instances).toHaveLength(0);
  const dispose = connect(ui.surface);
  const socket = TestSocket.instances[0]!;
  expect(socket.url).toBe("wss://example.invalid/terminal");
  expect(socket.binaryType).toBe("arraybuffer");
  expect(ui.listening()).toBe(false);

  socket.open();
  expect(socket.frames).toEqual([
    JSON.stringify({ ticket: "example", cols: 91, rows: 26 }),
  ]);
  const limit = 64 * 1024;
  const input = new Uint8Array(limit + 1).fill(27);
  input[limit] = 255;
  ui.send(input);
  ui.resize({ cols: 100, rows: 40 });
  expect(socket.frames.slice(1)).toEqual([
    input.slice(0, limit),
    new Uint8Array([255]),
    JSON.stringify({ cols: 100, rows: 40 }),
  ]);

  socket.receive("非终端帧");
  socket.receive(new Uint8Array([0, 255]).buffer);
  expect(ui.output).toEqual([new Uint8Array([0, 255])]);
  dispose();
});

test("主动清理在连接前后均能关闭通道并取消订阅", () => {
  const ui = createSurface();
  const { events, onClose } = captureClose();
  for (const open of [false, true]) {
    const dispose = createTerminalConnection(
      "/terminal",
      { ticket: "example" },
      onClose,
    )(ui.surface);
    const socket = TestSocket.instances.at(-1)!;
    if (open) socket.open();
    dispose();
    dispose();
    socket.receive(new Uint8Array([1]).buffer);
    expect(socket.readyState).toBe(TestSocket.CLOSED);
    expect(ui.listening()).toBe(false);
    expect(ui.output).toEqual([]);
    expect(events).toEqual([]);
  }
});

test("远端关闭时释放订阅并传递原始关闭事件", () => {
  const ui = createSurface();
  const { events, onClose } = captureClose();
  const dispose = createTerminalConnection(
    "/terminal",
    { ticket: "example" },
    onClose,
  )(ui.surface);
  const socket = TestSocket.instances[0]!;
  socket.open();
  socket.close("SESSION_ENDED");
  dispose();
  expect(ui.listening()).toBe(false);
  expect(events.map((event) => event.reason)).toEqual(["SESSION_ENDED"]);
});

test("票据仅经同源路径发送", () => {
  const ui = createSurface();
  for (const path of [
    "//other.invalid/terminal",
    "/\\other.invalid/terminal",
  ]) {
    const connect = createTerminalConnection(
      path,
      { ticket: "example" },
      () => {},
    );
    expect(() => connect(ui.surface)).toThrow(TypeError);
  }
  expect(TestSocket.instances).toHaveLength(0);
});
