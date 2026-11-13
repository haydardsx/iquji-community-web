import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./utils.js";

type DataAttributes = { [key: `data-${string}`]: string | undefined };

export type IqujiDesktopTitleBarProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> &
  DataAttributes & {
    windowControls?: ReactNode;
    windowControlsPlacement?: "start" | "end" | undefined;
    /** 原生窗口控件覆盖在网页上时，为它们预留的起始/结束空间。 */
    windowControlsSpace?: number | string | undefined;
    leading?: ReactNode;
    actions?: ReactNode;
    /** 为 Electron 注入 -webkit-app-region: drag，Tauri 仍通过 data 属性自行声明。 */
    dragRegion?: boolean | undefined;
    children?: ReactNode;
  };

function lengthOf(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

function hasLength(value: number | string) {
  return typeof value === "number" ? value > 0 : value.trim() !== "";
}

export function IqujiDesktopTitleBar({
  actions,
  children,
  className,
  dragRegion = false,
  leading,
  style,
  windowControls,
  windowControlsPlacement = "start",
  windowControlsSpace = 0,
  ...headerProps
}: IqujiDesktopTitleBarProps) {
  const reserveSpace =
    typeof windowControlsSpace === "number"
      ? windowControlsSpace > 0
      : hasLength(windowControlsSpace);
  const reservedStyle = reserveSpace
    ? windowControlsPlacement === "start"
      ? { paddingLeft: lengthOf(windowControlsSpace) }
      : { paddingRight: lengthOf(windowControlsSpace) }
    : undefined;

  return (
    <header
      {...headerProps}
      className={classNames("iquji-desktop-titlebar", className)}
      data-iquji-drag-region={dragRegion || undefined}
      style={{ ...style, ...reservedStyle }}
    >
      {windowControlsPlacement === "start" && windowControls ? (
        <div className="iquji-desktop-titlebar__window-controls">
          {windowControls}
        </div>
      ) : null}
      {leading ? (
        <div className="iquji-desktop-titlebar__leading">{leading}</div>
      ) : null}
      <div className="iquji-desktop-titlebar__center">{children}</div>
      {actions ? (
        <div className="iquji-desktop-titlebar__actions">{actions}</div>
      ) : null}
      {windowControlsPlacement === "end" && windowControls ? (
        <div className="iquji-desktop-titlebar__window-controls">
          {windowControls}
        </div>
      ) : null}
    </header>
  );
}
