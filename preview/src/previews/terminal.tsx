import {
  IqujiButton,
  IqujiField,
  IqujiInput,
  IqujiTerminal,
  type IqujiTerminalSurface,
} from "@iquji-community/web-component";
import {
  createTerminalConnection,
  type TerminalConnection,
} from "@iquji-community/web-network";
import { type FormEvent, useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function localEcho(surface: IqujiTerminalSurface) {
  return surface.onData((data) => {
    if (data[0] === 27) return;
    if (data.length === 1 && data[0] === 127) {
      surface.write(Uint8Array.of(8, 32, 8));
      return;
    }
    if (data.length === 1 && data[0] === 13) {
      surface.write(Uint8Array.of(13, 10));
      return;
    }
    surface.write(data);
  });
}

function TerminalDemo() {
  const text = usePreviewText();
  const [failed, setFailed] = useState(false);
  return (
    <div className="catalog-preview-stack catalog-preview-wide">
      <p className="catalog-preview-copy">
        {text(
          "本地键盘回显。输入任意文本，按 Shift+Tab 可离开终端。",
          "Local keyboard echo. Type any text and press Shift+Tab to leave the terminal.",
        )}
      </p>
      <IqujiTerminal
        label={text("本地回显终端", "Local echo terminal")}
        connect={localEcho}
        onError={() => setFailed(true)}
      />
      {failed && (
        <p role="status">
          {text("终端初始化失败。", "Terminal setup failed.")}
        </p>
      )}
    </div>
  );
}

type TerminalOutcome = CloseEvent | "failed" | "stopped";

function TerminalConnectionDemo() {
  const text = usePreviewText();
  const [path, setPath] = useState("");
  const [ticket, setTicket] = useState("");
  const [connect, setConnect] = useState<TerminalConnection>();
  const [outcome, setOutcome] = useState<TerminalOutcome>();
  const start = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const endpoint = path.trim();
    const connectionTicket = ticket.trim();
    if (!endpoint || !connectionTicket) return;
    const connection = createTerminalConnection(
      endpoint,
      { ticket: connectionTicket },
      setOutcome,
    );
    setOutcome(undefined);
    setConnect(() => connection);
    setTicket("");
  };
  const stop = () => {
    setConnect(undefined);
    setOutcome("stopped");
  };
  let status: string | undefined;
  if (outcome === "failed") {
    status = text("无法初始化终端连接。", "Terminal connection setup failed.");
  } else if (outcome === "stopped") {
    status = text("连接已关闭。", "Connection closed.");
  } else if (outcome) {
    const code = outcome.code;
    status = text(`连接已关闭（${code}）。`, `Connection closed (${code}).`);
    if (outcome.reason) status += ` ${outcome.reason}`;
  }
  return (
    <div className="catalog-preview-stack catalog-preview-wide">
      <p className="catalog-preview-copy">
        {text(
          "连接需要同源终端服务和该服务签发的一次性票据。",
          "A connection requires a same-origin terminal service and a ticket issued by that service.",
        )}
      </p>
      <form className="catalog-preview-stack" onSubmit={start}>
        <IqujiField label={text("同源路径", "Same-origin path")}>
          <IqujiInput
            autoComplete="off"
            placeholder="/terminal-stream"
            value={path}
            onChange={(event) => setPath(event.currentTarget.value)}
          />
        </IqujiField>
        <IqujiField label={text("一次性票据", "One-time ticket")}>
          <IqujiInput
            type="password"
            autoComplete="off"
            value={ticket}
            onChange={(event) => setTicket(event.currentTarget.value)}
          />
        </IqujiField>
        <div className="catalog-preview-grid">
          <IqujiButton type="submit" disabled={!path.trim() || !ticket.trim()}>
            {text("连接", "Connect")}
          </IqujiButton>
          <IqujiButton variant="secondary" disabled={!connect} onClick={stop}>
            {text("关闭终端", "Close terminal")}
          </IqujiButton>
        </div>
      </form>
      {connect && (
        <IqujiTerminal
          label={text("同源终端", "Same-origin terminal")}
          connect={connect}
          onError={() => setOutcome("failed")}
        />
      )}
      {status && <p role="status">{status}</p>}
    </div>
  );
}

export const terminalPreviews: readonly ComponentPreview[] = [
  {
    id: "terminal",
    name: "IqujiTerminal",
    category: "反馈",
    description: "通过本地键盘回显体验交互终端组件。",
    keywords: "终端 回显 terminal tty echo",
    render: () => <TerminalDemo />,
  },
  {
    id: "terminal-connection",
    name: "createTerminalConnection",
    packageId: "network",
    packageName: "@iquji-community/web-network",
    category: "网络",
    description: "通过一次性票据连接同源终端服务，显示连接关闭状态。",
    keywords: "终端 传输 terminal websocket ticket",
    render: () => <TerminalConnectionDemo />,
  },
];
