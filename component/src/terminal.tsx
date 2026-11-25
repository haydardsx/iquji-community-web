import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";
import { useEffect, useEffectEvent, useRef } from "react";

export type IqujiTerminalSize = { cols: number; rows: number };

export type IqujiTerminalSurface = {
  getSize: () => IqujiTerminalSize;
  onData: (listener: (data: Uint8Array) => void) => () => void;
  onResize: (listener: (size: IqujiTerminalSize) => void) => () => void;
  write: (data: Uint8Array) => void;
};

export type IqujiTerminalProps = {
  label: string;
  connect: (surface: IqujiTerminalSurface) => () => void;
  onError: () => void;
};

function surfaceFor(terminal: Terminal): IqujiTerminalSurface {
  const encoder = new TextEncoder();
  return {
    getSize: () => ({ cols: terminal.cols, rows: terminal.rows }),
    onData(listener) {
      const text = terminal.onData((data) => listener(encoder.encode(data)));
      const binary = terminal.onBinary((data) => {
        listener(Uint8Array.from(data, (byte) => byte.charCodeAt(0)));
      });
      return () => {
        text.dispose();
        binary.dispose();
      };
    },
    onResize(listener) {
      const subscription = terminal.onResize(listener);
      return () => subscription.dispose();
    },
    write: (data) => terminal.write(data),
  };
}

function fitTerminal(terminal: Terminal, fit: FitAddon) {
  const size = fit.proposeDimensions();
  if (!size || !Number.isFinite(size.cols) || !Number.isFinite(size.rows))
    return;
  const cols = Math.min(1000, size.cols);
  const rows = Math.min(500, size.rows);
  if (cols !== terminal.cols || rows !== terminal.rows)
    terminal.resize(cols, rows);
}

export function IqujiTerminal({ label, connect, onError }: IqujiTerminalProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | undefined>(undefined);
  const labelTerminal = useEffectEvent((terminal: Terminal) => {
    terminal.textarea?.setAttribute("aria-label", label);
  });
  const reportError = useEffectEvent(onError);

  useEffect(() => {
    terminalRef.current?.textarea?.setAttribute("aria-label", label);
  }, [label]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let terminal: Terminal | undefined;
    let observer: ResizeObserver | undefined;
    let disconnect: (() => void) | undefined;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      terminalRef.current = undefined;
      observer?.disconnect();
      try {
        disconnect?.();
      } finally {
        terminal?.dispose();
      }
    };

    void Promise.all([import("@xterm/xterm"), import("@xterm/addon-fit")])
      .then(([{ Terminal }, { FitAddon }]) => {
        if (disposed) return;
        const fontFamily = getComputedStyle(host).fontFamily || "monospace";
        const screen = new Terminal({
          fontFamily,
          minimumContrastRatio: 4.5,
          screenReaderMode: true,
          theme: { background: "#101216", foreground: "#e1e4ea" },
        });
        terminal = screen;
        const fit = new FitAddon();
        screen.loadAddon(fit);
        screen.open(host);
        terminalRef.current = screen;
        labelTerminal(screen);
        screen.textarea?.setAttribute("aria-keyshortcuts", "Shift+Tab");
        screen.attachCustomKeyEventHandler(
          (event) => !(event.key === "Tab" && event.shiftKey),
        );
        fitTerminal(screen, fit);
        observer = new ResizeObserver(() => fitTerminal(screen, fit));
        observer.observe(host);
        const close = connect(surfaceFor(screen));
        if (disposed) close();
        else disconnect = close;
      })
      .catch(() => {
        if (disposed) return;
        try {
          dispose();
        } finally {
          reportError();
        }
      });

    return dispose;
  }, [connect]);

  return (
    <section aria-label={label} className="iquji-terminal">
      <div className="iquji-terminal__surface" ref={hostRef} />
    </section>
  );
}
