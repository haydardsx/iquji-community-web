import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./utils.js";

export type IqujiDesktopShellProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  windowBar?: ReactNode;
  rail?: ReactNode;
  children: ReactNode;
  skipLinkLabel?: string | undefined;
  contentId?: string | undefined;
};

export function IqujiDesktopShell({
  children,
  className,
  contentId = "iquji-desktop-content",
  rail,
  skipLinkLabel,
  windowBar,
  ...divProps
}: IqujiDesktopShellProps) {
  return (
    <div
      {...divProps}
      className={classNames("iquji-desktop-shell", className)}
      data-has-window-bar={windowBar ? "true" : "false"}
    >
      {skipLinkLabel ? (
        <a className="iquji-skip-link" href={`#${contentId}`}>
          {skipLinkLabel}
        </a>
      ) : null}
      {windowBar}
      <div
        className="iquji-desktop-shell__body"
        data-has-rail={rail ? "true" : "false"}
      >
        {rail}
        <main
          className="iquji-desktop-shell__content"
          id={contentId}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
