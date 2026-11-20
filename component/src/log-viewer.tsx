import {
  type CSSProperties,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import { IqujiIcon } from "@iquji-community/web-icons";
import { IqujiPopover } from "./floating.js";
import { logViewerMessages } from "./log-viewer-messages.js";
import { classNames } from "./utils.js";

export type IqujiLogLevel = "debug" | "info" | "warn" | "error";

export type IqujiLogErrorInfo = {
  title?: ReactNode | undefined;
  message?: ReactNode | undefined;
  code?: string | undefined;
};

export type IqujiLogEntry = {
  id?: string | undefined;
  timestamp?: string | undefined;
  level?: IqujiLogLevel | string | undefined;
  source?: string | undefined;
  phase?: string | undefined;
  message: string;
  errorSummary?: string | undefined;
};

export type IqujiLogViewerProps = {
  /** 日志条目列表，可为结构化对象或纯文本行列表（自动解析时间戳与等级） */
  logs: ReadonlyArray<IqujiLogEntry | string>;
  /** 发生故障时的错误诊断信息，将在工具栏左侧展示红色感叹号图标，点击通过 Popover 展开 */
  error?: IqujiLogErrorInfo | undefined;
  /** 区域可访问名称 */
  label?: string | undefined;
  /** 内置界面文案语言，默认简体中文 */
  locale?: "zh-CN" | "en-US" | undefined;
  /** 最大高度，默认 380px（在 fill 模式下自动失效） */
  maxHeight?: number | string | undefined;
  /** 是否占满父容器高度（自适应 flex: 1） */
  fill?: boolean | undefined;
  /** 是否显示工具栏（搜索、等级过滤、复制、换行切换），默认 true */
  toolbar?: boolean | undefined;
  /** 是否显示行号，默认 true */
  showLineNumbers?: boolean | undefined;
  /** 是否显示时间戳，默认 true */
  showTimestamps?: boolean | undefined;
  /** 是否默认自动换行，默认 false（水平滚动） */
  wrapLines?: boolean | undefined;
  /** 加载中状态 */
  loading?: boolean | undefined;
  /** 空状态文案 */
  emptyLabel?: string | undefined;
  /** 复制按钮自定义文案，默认 "复制" */
  copyLabel?: string | undefined;
  /** 调用方可提供复制内容，默认复制筛选后的日志条目。 */
  customCopyText?: string | (() => Promise<string> | string) | undefined;
  /** 设置回调后在工具栏内显示刷新按钮。 */
  onRefresh?: (() => void) | undefined;
  /** 刷新中状态（旋转图标并温和禁用刷新按钮） */
  refreshing?: boolean | undefined;
  /** 刷新按钮自定义文案，默认 "刷新" */
  refreshLabel?: string | undefined;
  /** 额外的工具栏操作按钮 */
  actions?: ReactNode | undefined;
  /** 复制完成回调 */
  onCopy?: ((text: string) => void) | undefined;
  className?: string | undefined;
};

const ISO_DATE_PATTERN =
  /^(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)\s*/i;
const LEVEL_PATTERN =
  /^(info|information|warn|warning|error|err|failed|debug|trace|fatal)\b\s*/i;

export function parseLogLine(raw: string, index: number): IqujiLogEntry {
  let text = raw.trim();
  let timestamp: string | undefined;
  let level: IqujiLogLevel | string = "info";
  let source: string | undefined;
  let phase: string | undefined;

  const dateMatch = text.match(ISO_DATE_PATTERN);
  if (dateMatch && dateMatch[1]) {
    timestamp = dateMatch[1];
    text = text.slice(dateMatch[0].length).trim();
  }

  const levelMatch = text.match(LEVEL_PATTERN);
  if (levelMatch && levelMatch[1]) {
    const matched = levelMatch[1].toLowerCase();
    if (matched === "error" || matched === "err" || matched === "failed" || matched === "fatal") {
      level = "error";
    } else if (matched === "warn" || matched === "warning") {
      level = "warn";
    } else if (matched === "debug" || matched === "trace") {
      level = "debug";
    } else {
      level = "info";
    }
    text = text.slice(levelMatch[0].length).trim();
  }

  // 正文中的失败标记会将日志级别提升为 error。
  if (/error|failed|failure|fatal|panic|失败|异常|错误/i.test(text)) {
    level = "error";
  } else if (/warn|warning|告警/i.test(text) && level === "info") {
    level = "warn";
  }

  // 取消息开头的两个标识作为来源和阶段，例如 document export。
  const words = text.split(/\s+/);
  const firstWord = words[0];
  const secondWord = words[1];
  if (
    words.length >= 3 &&
    firstWord &&
    secondWord &&
    /^[a-z0-9_-]+$/i.test(firstWord) &&
    /^[a-z0-9_-]+$/i.test(secondWord)
  ) {
    source = firstWord;
    phase = secondWord;
    text = words.slice(2).join(" ");
  }

  return {
    id: `parsed-${index}`,
    timestamp,
    level,
    source,
    phase,
    message: text || raw,
  };
}

function normalizeLevel(level?: string): IqujiLogLevel {
  if (!level) return "info";
  const lower = level.toLowerCase();
  if (lower === "error" || lower === "err" || lower === "failed" || lower === "fatal") return "error";
  if (lower === "warn" || lower === "warning") return "warn";
  if (lower === "debug" || lower === "trace") return "debug";
  return "info";
}

function renderHighlighted(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark className="iquji-log-viewer__highlight" key={`h-${i}`}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function IqujiLogViewer({
  actions,
  className,
  copyLabel,
  customCopyText,
  emptyLabel,
  error,
  fill = false,
  label,
  locale = "zh-CN",
  loading = false,
  logs,
  maxHeight = 380,
  onCopy,
  onRefresh,
  refreshing = false,
  refreshLabel,
  showLineNumbers = true,
  showTimestamps = true,
  toolbar = true,
  wrapLines = false,
}: IqujiLogViewerProps) {
  const messages = logViewerMessages[locale];
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | IqujiLogLevel>("all");
  const [wrapped, setWrapped] = useState(wrapLines);
  const [copied, setCopied] = useState(false);
  const [copiedErrorCode, setCopiedErrorCode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCopyErrorCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedErrorCode(true);
      setTimeout(() => setCopiedErrorCode(false), 2000);
    } catch {
      // 忽略剪贴板权限异常
    }
  };

  const normalized = useMemo(() => {
    return logs.map((item, index) => {
      if (typeof item === "string") {
        return parseLogLine(item, index);
      }
      return {
        ...item,
        level: normalizeLevel(item.level),
      };
    });
  }, [logs]);

  const hasAnyTag = useMemo(() => {
    return normalized.some((item) => Boolean(item.source || item.phase));
  }, [normalized]);

  const stats = useMemo(() => {
    let errorCount = 0;
    let warnCount = 0;
    let infoCount = 0;
    for (const item of normalized) {
      if (item.level === "error") errorCount++;
      else if (item.level === "warn") warnCount++;
      else infoCount++;
    }
    return { errorCount, warnCount, infoCount, total: normalized.length };
  }, [normalized]);

  const filtered = useMemo(() => {
    return normalized.filter((item) => {
      if (levelFilter !== "all" && item.level !== levelFilter) {
        return false;
      }
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const inMsg = item.message.toLowerCase().includes(query);
        const inSource = item.source?.toLowerCase().includes(query) ?? false;
        const inPhase = item.phase?.toLowerCase().includes(query) ?? false;
        const inSummary = item.errorSummary?.toLowerCase().includes(query) ?? false;
        return inMsg || inSource || inPhase || inSummary;
      }
      return true;
    });
  }, [normalized, levelFilter, search]);

  const handleCopy = async () => {
    let textToCopy = "";
    if (customCopyText) {
      textToCopy =
        typeof customCopyText === "function"
          ? await customCopyText()
          : customCopyText;
    } else {
      textToCopy = filtered
        .map((item) =>
          [
            item.timestamp,
            item.level?.toUpperCase(),
            item.source,
            item.phase,
            item.message,
          ]
            .filter(Boolean)
            .join(" "),
        )
        .join("\n");
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopy?.(textToCopy);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 忽略剪贴板权限异常
    }
  };

  const handleScrollBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const heightStyle: CSSProperties = fill
    ? { flex: 1, maxHeight: "none" }
    : {
        maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
      };

  return (
    <div
      aria-label={label ?? messages.label}
      className={classNames("iquji-log-viewer", className)}
      data-fill={fill ? "true" : undefined}
      data-wrap={wrapped ? "true" : undefined}
      role="region"
    >
      {toolbar ? (
        <div className="iquji-log-viewer__toolbar">
          <div className="iquji-log-viewer__toolbar-left">
            {error && (error.title || error.message || error.code) ? (
              <IqujiPopover
                align="start"
                popupClassName="iquji-log-viewer__error-popover-popup"
                side="bottom"
                sideOffset={6}
                trigger={
                  <button
                    aria-label={messages.viewError}
                    className="iquji-log-viewer__error-trigger"
                    title={messages.viewError}
                    type="button"
                  >
                    <IqujiIcon decorative name="circle-alert" size={13} />
                    <span>{error.title || messages.errorTrigger}</span>
                    {error.code ? (
                      <span className="iquji-log-viewer__error-dot" />
                    ) : null}
                  </button>
                }
              >
                <div className="iquji-log-viewer__error-popover">
                  <div className="iquji-log-viewer__error-header">
                    <span className="iquji-log-viewer__error-icon">
                      <IqujiIcon decorative name="circle-alert" size={14} />
                    </span>
                    <span className="iquji-log-viewer__error-title">
                      {error.title || messages.errorTitle}
                    </span>
                  </div>
                  {error.message ? (
                    <div className="iquji-log-viewer__error-message">
                      {error.message}
                    </div>
                  ) : null}
                  {error.code ? (
                    <div className="iquji-log-viewer__error-footer">
                      <span className="iquji-log-viewer__error-code-label">
                        {messages.errorCode}
                      </span>
                      <button
                        aria-label={messages.copyErrorCode(error.code)}
                        className="iquji-log-viewer__error-code"
                        onClick={() => void handleCopyErrorCode(error.code!)}
                        title={messages.copyErrorCode(error.code)}
                        type="button"
                      >
                        <code>{error.code}</code>
                        <IqujiIcon
                          decorative
                          name={copiedErrorCode ? "check" : "copy"}
                          size={11}
                        />
                      </button>
                    </div>
                  ) : null}
                </div>
              </IqujiPopover>
            ) : null}

            <div className="iquji-log-viewer__search">
              <IqujiIcon decorative name="search" size={12} />
              <input
                aria-label={messages.search}
                className="iquji-log-viewer__search-input"
                onChange={(e) => setSearch(e.target.value)}
                placeholder={messages.searchPlaceholder}
                type="text"
                value={search}
              />
              {search ? (
                <button
                  aria-label={messages.clearSearch}
                  className="iquji-log-viewer__filter-btn"
                  onClick={() => setSearch("")}
                  type="button"
                >
                  <IqujiIcon decorative name="x-circle" size={11} />
                </button>
              ) : null}
            </div>

            <div className="iquji-log-viewer__filters">
              <button
                className="iquji-log-viewer__filter-btn"
                data-active={levelFilter === "all" ? "true" : undefined}
                onClick={() => setLevelFilter("all")}
                type="button"
              >
                {messages.all} ({stats.total})
              </button>
              <button
                className="iquji-log-viewer__filter-btn"
                data-active={levelFilter === "error" ? "true" : undefined}
                data-tone="error"
                onClick={() => setLevelFilter("error")}
                type="button"
              >
                {messages.error} {stats.errorCount > 0 ? `(${stats.errorCount})` : ""}
              </button>
              <button
                className="iquji-log-viewer__filter-btn"
                data-active={levelFilter === "warn" ? "true" : undefined}
                onClick={() => setLevelFilter("warn")}
                type="button"
              >
                {messages.warning} {stats.warnCount > 0 ? `(${stats.warnCount})` : ""}
              </button>
              <button
                className="iquji-log-viewer__filter-btn"
                data-active={levelFilter === "info" ? "true" : undefined}
                onClick={() => setLevelFilter("info")}
                type="button"
              >
                {messages.info}
              </button>
            </div>
          </div>

          <div className="iquji-log-viewer__toolbar-right">
            <button
              aria-label={wrapped ? messages.unwrapTitle : messages.wrapTitle}
              className="iquji-log-viewer__tool-btn"
              data-active={wrapped ? "true" : undefined}
              onClick={() => setWrapped(!wrapped)}
              title={wrapped ? messages.unwrapTitle : messages.wrapTitle}
              type="button"
            >
              <IqujiIcon decorative name="list-bulleted" size={12} />
              <span>{wrapped ? messages.wrapped : messages.wrap}</span>
            </button>
            <button
              aria-label={copied ? messages.copied : (copyLabel ?? messages.copy)}
              className="iquji-log-viewer__tool-btn"
              disabled={filtered.length === 0}
              onClick={() => void handleCopy()}
              type="button"
            >
              <IqujiIcon decorative name={copied ? "check" : "copy"} size={12} />
              <span>{copied ? messages.copied : (copyLabel ?? messages.copy)}</span>
            </button>
            {onRefresh ? (
              <button
                aria-busy={refreshing || undefined}
                aria-label={refreshLabel ?? messages.refresh}
                className="iquji-log-viewer__tool-btn"
                data-refreshing={refreshing ? "true" : undefined}
                disabled={refreshing}
                onClick={onRefresh}
                title={refreshLabel ?? messages.refresh}
                type="button"
              >
                <IqujiIcon decorative name="refresh" size={12} />
                <span>{refreshLabel ?? messages.refresh}</span>
              </button>
            ) : null}
            {actions}
          </div>
        </div>
      ) : null}

      <div className="iquji-log-viewer__scroll" ref={scrollRef} style={heightStyle}>
        {loading ? (
          <div className="iquji-log-viewer__loading">
            <IqujiIcon decorative name="rotate-ccw" size={18} />
            <span>{messages.loading}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="iquji-log-viewer__empty">
            <IqujiIcon decorative name="terminal" size={20} />
            <span>{search || levelFilter !== "all" ? messages.noResults : (emptyLabel ?? messages.empty)}</span>
          </div>
        ) : (
          <div className="iquji-log-viewer__lines">
            {filtered.map((item, index) => {
              const level = item.level ?? "info";
              const tagText = [item.source, item.phase]
                .filter(Boolean)
                .join(" ");
              return (
                <div
                  className="iquji-log-viewer__line"
                  data-level={level}
                  key={item.id ?? `log-${index}`}
                >
                  {showLineNumbers ? (
                    <span className="iquji-log-viewer__num">{index + 1}</span>
                  ) : null}
                  {showTimestamps && item.timestamp ? (
                    <span
                      className="iquji-log-viewer__time"
                      title={item.timestamp}
                    >
                      {item.timestamp}
                    </span>
                  ) : null}
                  <span className="iquji-log-viewer__level" data-level={level}>
                    {level.toUpperCase()}
                  </span>
                  {hasAnyTag ? (
                    <span className="iquji-log-viewer__tag-slot">
                      {tagText ? (
                        <span className="iquji-log-viewer__tag" title={tagText}>
                          {tagText}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                  <span className="iquji-log-viewer__msg">
                    {renderHighlighted(item.message, search)}
                    {item.errorSummary ? (
                      <span className="iquji-log-viewer__summary">
                        {" "}
                        — {item.errorSummary}
                      </span>
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="iquji-log-viewer__status">
        <div>
          {search ? (
            <span>
              {messages.filtered(filtered.length, normalized.length)}
            </span>
          ) : (
            <span>{messages.total(normalized.length)}</span>
          )}
          {stats.errorCount > 0 && levelFilter !== "error" ? (
            <span className="iquji-log-viewer__status-error">
              · {messages.errors(stats.errorCount)}
            </span>
          ) : null}
        </div>
        <button
          aria-label={messages.scrollBottom}
          className="iquji-log-viewer__filter-btn"
          onClick={handleScrollBottom}
          type="button"
        >
          <IqujiIcon decorative name="arrow-down" size={11} />
          <span>{messages.bottom}</span>
        </button>
      </div>
    </div>
  );
}
