import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./utils.js";

export type IqujiPageHeaderProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  titleId?: string;
};

export function IqujiPageHeader({
  actions,
  className,
  description,
  eyebrow,
  title,
  titleId,
  ...headerProps
}: IqujiPageHeaderProps) {
  return (
    <header
      className={classNames("iquji-page-header", className)}
      {...headerProps}
    >
      <div className="iquji-page-header__copy">
        {eyebrow ? (
          <div className="iquji-page-header__eyebrow">{eyebrow}</div>
        ) : null}
        <h1 id={titleId} tabIndex={-1}>
          {title}
        </h1>
        {description ? (
          <div className="iquji-page-header__description">{description}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="iquji-page-header__actions">{actions}</div>
      ) : null}
    </header>
  );
}

export type IqujiTableFrameProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  busy?: boolean;
  toolbar?: ReactNode;
};

export function IqujiTableFrame({
  busy = false,
  children,
  className,
  label,
  toolbar,
  ...divProps
}: IqujiTableFrameProps) {
  return (
    <div
      aria-busy={busy}
      className={classNames("iquji-table-frame", className)}
      {...divProps}
    >
      {toolbar ? (
        <div className="iquji-table-frame__toolbar">{toolbar}</div>
      ) : null}
      <section
        aria-label={label}
        className="iquji-table-frame__scroller"
        // biome-ignore lint/a11y/noNoninteractiveTabindex: 横向滚动区域必须能够由键盘聚焦和滚动。
        tabIndex={0}
      >
        {children}
      </section>
    </div>
  );
}
