import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./utils.js";

export type IqujiTone = "neutral" | "info" | "success" | "warning" | "danger";

export type IqujiBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: IqujiTone;
};

export function IqujiBadge({
  className,
  tone = "neutral",
  ...spanProps
}: IqujiBadgeProps) {
  return (
    <span
      className={classNames("iquji-badge", className)}
      data-tone={tone}
      {...spanProps}
    />
  );
}

export type IqujiAlertProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Exclude<IqujiTone, "neutral">;
  title?: ReactNode;
};

export function IqujiAlert({
  children,
  className,
  role,
  title,
  tone = "info",
  ...divProps
}: IqujiAlertProps) {
  return (
    <div
      className={classNames("iquji-alert", className)}
      data-tone={tone}
      role={role ?? (tone === "danger" ? "alert" : "status")}
      {...divProps}
    >
      {title ? <div className="iquji-alert__title">{title}</div> : null}
      <div className="iquji-alert__body">{children}</div>
    </div>
  );
}

export type IqujiSkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  height?: number | string;
  width?: number | string;
  shape?: "line" | "block" | "circle";
};

export function IqujiSkeleton({
  className,
  height,
  shape = "line",
  style,
  width,
  ...spanProps
}: IqujiSkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={classNames("iquji-skeleton", className)}
      data-shape={shape}
      style={{ ...style, height, width }}
      {...spanProps}
    />
  );
}

export type IqujiAsyncState =
  | "loading"
  | "refreshing"
  | "empty"
  | "error"
  | "ready";

export type IqujiAsyncStateFrameProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  state: IqujiAsyncState;
  children: ReactNode;
  loadingFallback?: ReactNode;
  emptyFallback?: ReactNode;
  errorFallback?: ReactNode;
  refreshLabel?: string;
};

export function IqujiAsyncStateFrame({
  children,
  className,
  emptyFallback,
  errorFallback,
  loadingFallback,
  refreshLabel,
  state,
  ...divProps
}: IqujiAsyncStateFrameProps) {
  const content =
    state === "loading"
      ? loadingFallback
      : state === "empty"
        ? emptyFallback
        : state === "error"
          ? errorFallback
          : children;

  return (
    <div
      aria-busy={state === "loading" || state === "refreshing"}
      className={classNames("iquji-async-state-frame", className)}
      data-state={state}
      {...divProps}
    >
      {content}
      {state === "refreshing" && refreshLabel ? (
        <div className="iquji-async-state-frame__progress" role="status">
          <span className="iquji-visually-hidden">{refreshLabel}</span>
        </div>
      ) : null}
      {state === "refreshing" && !refreshLabel ? (
        <div aria-hidden="true" className="iquji-async-state-frame__progress" />
      ) : null}
    </div>
  );
}
