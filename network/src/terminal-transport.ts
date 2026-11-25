export type TerminalSize = { cols: number; rows: number };

export interface TerminalConnectionSurface {
  getSize(): TerminalSize;
  onData(listener: (data: Uint8Array) => void): () => void;
  onResize(listener: (size: TerminalSize) => void): () => void;
  write(data: Uint8Array): void;
}

export type TerminalConnection = (
  surface: TerminalConnectionSurface,
) => () => void;

const maxFrameBytes = 64 * 1024;

function terminalUrl(path: string): string {
  const page = new URL(globalThis.location.href);
  const url = new URL(path, page);
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.origin !== page.origin ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new TypeError("A same-origin terminal path is required");
  }
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.href;
}

export function createTerminalConnection(
  path: string,
  { ticket }: Readonly<{ ticket: string }>,
  onClose: (event: CloseEvent) => void,
): TerminalConnection {
  return (surface) => {
    const socket = new WebSocket(terminalUrl(path));
    socket.binaryType = "arraybuffer";
    const events = new AbortController();
    const { signal } = events;
    let stopData: (() => void) | undefined;
    let stopResize: (() => void) | undefined;
    const detach = () => {
      events.abort();
      stopData?.();
      stopResize?.();
    };

    socket.addEventListener(
      "open",
      () => {
        const { cols, rows } = surface.getSize();
        socket.send(JSON.stringify({ ticket, cols, rows }));
        stopData = surface.onData((data) => {
          if (socket.readyState !== WebSocket.OPEN) return;
          for (
            let offset = 0;
            offset < data.byteLength;
            offset += maxFrameBytes
          ) {
            socket.send(data.slice(offset, offset + maxFrameBytes));
          }
        });
        stopResize = surface.onResize(({ cols, rows }) => {
          if (socket.readyState === WebSocket.OPEN)
            socket.send(JSON.stringify({ cols, rows }));
        });
      },
      { once: true, signal },
    );
    socket.addEventListener(
      "message",
      (event) => {
        if (event.data instanceof ArrayBuffer)
          surface.write(new Uint8Array(event.data));
      },
      { signal },
    );
    socket.addEventListener(
      "close",
      (event) => {
        detach();
        onClose(event);
      },
      { once: true, signal },
    );

    return () => {
      if (signal.aborted) return;
      detach();
      if (
        socket.readyState === WebSocket.CONNECTING ||
        socket.readyState === WebSocket.OPEN
      ) {
        socket.close();
      }
    };
  };
}
