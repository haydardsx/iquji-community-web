import { type ReactNode, useState } from "react";
import { IqujiIcon } from "@iquji-community/web-icons";
import type { IqujiTone } from "./feedback.js";
import { classNames } from "./utils.js";

export type IqujiDiagnosticBannerProps = {
  title: ReactNode;
  description?: ReactNode | undefined;
  errorCode?: string | undefined;
  tone?: IqujiTone | undefined;
  compact?: boolean | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
};

export function IqujiDiagnosticBanner({
  action,
  className,
  compact = false,
  description,
  errorCode,
  title,
  tone = "danger",
}: IqujiDiagnosticBannerProps) {
  const [copiedCode, setCopiedCode] = useState(false);

  const iconName =
    tone === "success"
      ? "check-circle"
      : tone === "warning" || tone === "danger"
        ? "circle-alert"
        : "circle-info";

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // 忽略剪贴板权限异常
    }
  };

  return (
    <div
      className={classNames(
        "iquji-diagnostic-banner",
        compact && "iquji-diagnostic-banner--compact",
        className,
      )}
      data-tone={tone}
      role="alert"
    >
      <div className="iquji-diagnostic-banner__header">
        <div className="iquji-diagnostic-banner__lead">
          <span className="iquji-diagnostic-banner__icon">
            <IqujiIcon decorative name={iconName} size={compact ? 13 : 15} />
          </span>
          <h4 className="iquji-diagnostic-banner__title">{title}</h4>
        </div>
        {errorCode ? (
          <button
            aria-label={`复制错误码: ${errorCode}`}
            className="iquji-diagnostic-banner__code"
            onClick={() => void handleCopyCode(errorCode)}
            title="点击复制错误代码"
            type="button"
          >
            <code>{errorCode}</code>
            <IqujiIcon
              decorative
              name={copiedCode ? "check" : "copy"}
              size={11}
            />
          </button>
        ) : null}
      </div>
      {description ? (
        <div className="iquji-diagnostic-banner__desc">{description}</div>
      ) : null}
      {action ? (
        <div className="iquji-diagnostic-banner__action">{action}</div>
      ) : null}
    </div>
  );
}

