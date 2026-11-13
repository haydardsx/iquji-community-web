import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";
import { forwardRef } from "react";

export type AppNavigationItem = {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onNavigate?: MouseEventHandler<HTMLAnchorElement>;
  onIntent?: () => void;
};

export type AppShellProps = {
  brand: ReactNode;
  navigationLabel: string;
  navigation: readonly AppNavigationItem[];
  navigationGroups?: readonly {
    id: string;
    label: string;
    items: readonly AppNavigationItem[];
  }[];
  header: ReactNode;
  children: ReactNode;
  mainId?: string;
  skipLinkLabel?: string;
};

const renderNavigationItem = (item: AppNavigationItem) => {
  const content = (
    <>
      {item.icon}
      <span>{item.label}</span>
    </>
  );
  return item.disabled || !item.href ? (
    <button
      aria-label={item.label}
      className="iquji-app-shell__navigation-item"
      data-disabled="true"
      disabled
      key={item.id}
      type="button"
    >
      {content}
    </button>
  ) : (
    <a
      aria-label={item.label}
      aria-current={item.active ? "page" : undefined}
      className="iquji-app-shell__navigation-item"
      data-active={item.active || undefined}
      href={item.href}
      key={item.id}
      onClick={item.onNavigate}
      onFocus={item.onIntent}
      onMouseEnter={item.onIntent}
    >
      {content}
    </a>
  );
};

export function AppShell({
  brand,
  navigationLabel,
  navigation,
  navigationGroups,
  header,
  children,
  mainId = "iquji-main-content",
  skipLinkLabel,
}: AppShellProps) {
  return (
    <div className="iquji-app-shell">
      {skipLinkLabel ? (
        <a className="iquji-skip-link" href={`#${mainId}`}>
          {skipLinkLabel}
        </a>
      ) : null}
      <aside className="iquji-app-shell__sidebar">
        <div className="iquji-app-shell__brand">{brand}</div>
        <nav
          aria-label={navigationLabel}
          className="iquji-app-shell__navigation"
        >
          {navigationGroups?.length
            ? navigationGroups.map((group) => (
                <section
                  aria-labelledby={`${group.id}-navigation-heading`}
                  className="iquji-app-shell__navigation-group"
                  key={group.id}
                >
                  <h2
                    className="iquji-app-shell__navigation-heading"
                    id={`${group.id}-navigation-heading`}
                  >
                    {group.label}
                  </h2>
                  {group.items.map(renderNavigationItem)}
                </section>
              ))
            : navigation.map(renderNavigationItem)}
        </nav>
      </aside>
      <div className="iquji-app-shell__workspace">
        <header className="iquji-app-shell__header">{header}</header>
        <main className="iquji-app-shell__main" id={mainId} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children" | "title"
> & {
  label: string;
  icon: ReactNode;
  compact?: boolean;
  loading?: boolean;
  variant?: "secondary" | "ghost" | "primary" | "danger";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      className,
      compact = false,
      disabled,
      icon,
      label,
      loading = false,
      type = "button",
      variant = "ghost",
      ...buttonProps
    },
    ref,
  ) {
    const names = [
      "iquji-icon-button",
      `iquji-icon-button--${variant}`,
      compact ? "iquji-icon-button--compact" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        {...buttonProps}
        aria-busy={loading || undefined}
        aria-label={label}
        className={names}
        disabled={disabled || loading}
        ref={ref}
        title={label}
        type={type}
      >
        {loading ? (
          <span aria-hidden="true" className="iquji-button__spinner" />
        ) : (
          <span aria-hidden="true" className="iquji-icon-button__icon">
            {icon}
          </span>
        )}
      </button>
    );
  },
);

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "positive" | "warning" | "critical";
};

export function StatusBadge({
  tone = "neutral",
  className,
  ...props
}: StatusBadgeProps) {
  const names = ["iquji-status-badge", className].filter(Boolean).join(" ");
  return <span className={names} data-tone={tone} {...props} />;
}

export type IqujiButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "text"
  | "danger"
  | "inverse";

export type IqujiButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> & {
  variant?: IqujiButtonVariant;
  compact?: boolean;
  block?: boolean;
  className?: string;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  loading?: boolean;
  allowLabelWrap?: boolean;
};

export const IqujiButton = forwardRef<HTMLButtonElement, IqujiButtonProps>(
  function IqujiButton(
    {
      allowLabelWrap = false,
      block = false,
      children,
      className,
      compact = false,
      disabled,
      iconEnd,
      iconStart,
      loading = false,
      type = "button",
      variant = "primary",
      ...buttonProps
    },
    ref,
  ) {
    const names = [
      "iquji-button",
      `iquji-button--${variant}`,
      compact ? "iquji-button--compact" : null,
      block ? "iquji-button--block" : null,
      allowLabelWrap ? "iquji-button--allow-label-wrap" : null,
      className,
    ]
      .filter(Boolean)
      .join(" ");
    const content =
      typeof children === "string" || typeof children === "number" ? (
        <span className="iquji-button__label">{children}</span>
      ) : (
        children
      );

    return (
      <button
        {...buttonProps}
        aria-busy={loading || undefined}
        className={names}
        disabled={disabled || loading}
        ref={ref}
        type={type}
      >
        {loading ? (
          <span className="iquji-button__spinner" aria-hidden="true" />
        ) : iconStart ? (
          <span className="iquji-button__icon" aria-hidden="true">
            {iconStart}
          </span>
        ) : null}
        {content}
        {!loading && iconEnd ? (
          <span className="iquji-button__icon" aria-hidden="true">
            {iconEnd}
          </span>
        ) : null}
      </button>
    );
  },
);

export type IqujiButtonLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "className"
> & {
  disabled?: boolean;
  variant?: IqujiButtonVariant;
  compact?: boolean;
  block?: boolean;
  className?: string;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  loading?: boolean;
  allowLabelWrap?: boolean;
};

export function IqujiButtonLink({
  "aria-disabled": ariaDisabled,
  allowLabelWrap = false,
  block = false,
  children,
  className,
  compact = false,
  disabled = false,
  href,
  iconEnd,
  iconStart,
  loading = false,
  onClick,
  tabIndex,
  variant = "primary",
  ...anchorProps
}: IqujiButtonLinkProps) {
  const blocked =
    disabled || loading || ariaDisabled === true || ariaDisabled === "true";
  const names = [
    "iquji-button-link",
    `iquji-button-link--${variant}`,
    compact ? "iquji-button-link--compact" : null,
    block ? "iquji-button-link--block" : null,
    allowLabelWrap ? "iquji-button-link--allow-label-wrap" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content =
    typeof children === "string" || typeof children === "number" ? (
      <span className="iquji-button__label">{children}</span>
    ) : (
      children
    );

  return (
    <a
      {...anchorProps}
      aria-busy={loading || undefined}
      aria-disabled={blocked || undefined}
      className={names}
      data-loading={loading || undefined}
      href={blocked ? undefined : href}
      role={anchorProps.role ?? (blocked ? "link" : undefined)}
      onClick={(event) => {
        if (blocked) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      }}
      tabIndex={blocked ? -1 : tabIndex}
    >
      {loading ? (
        <span className="iquji-button__spinner" aria-hidden="true" />
      ) : iconStart ? (
        <span className="iquji-button__icon" aria-hidden="true">
          {iconStart}
        </span>
      ) : null}
      {content}
      {!loading && iconEnd ? (
        <span className="iquji-button__icon" aria-hidden="true">
          {iconEnd}
        </span>
      ) : null}
    </a>
  );
}

export type IqujiPanelProps = HTMLAttributes<HTMLElement> & {
  header?: ReactNode;
  className?: string;
};

export function IqujiPanel({
  className,
  header,
  children,
  ...sectionProps
}: IqujiPanelProps) {
  const names = ["iquji-panel", className].filter(Boolean).join(" ");
  return (
    <section className={names} {...sectionProps}>
      {header ? (
        <header className="iquji-panel__header">{header}</header>
      ) : null}
      {children}
    </section>
  );
}

export type IqujiPageHeadingProps = {
  kicker?: string;
  title: string;
  titleId?: string;
  summary?: string;
  aside?: ReactNode;
  className?: string;
};

export function IqujiPageHeading({
  aside,
  className,
  kicker,
  summary,
  title,
  titleId,
}: IqujiPageHeadingProps) {
  const names = ["iquji-page-heading", className].filter(Boolean).join(" ");
  return (
    <div className={names}>
      <div>
        {kicker ? <p className="iquji-page-heading__kicker">{kicker}</p> : null}
        <h1 id={titleId}>{title}</h1>
        {summary ? (
          <p className="iquji-page-heading__summary">{summary}</p>
        ) : null}
      </div>
      {aside}
    </div>
  );
}

export type IqujiEmptyStateProps = HTMLAttributes<HTMLElement> & {
  icon?: ReactNode;
  title?: string;
  titleId?: string;
  body?: string;
  action?: ReactNode;
  className?: string;
};

export function IqujiEmptyState({
  action,
  body,
  className,
  icon,
  title,
  titleId,
  children,
  ...sectionProps
}: IqujiEmptyStateProps) {
  const names = ["iquji-empty-state", className].filter(Boolean).join(" ");
  return (
    <section className={names} {...sectionProps}>
      {icon ? (
        <span className="iquji-empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {title ? <h2 id={titleId}>{title}</h2> : null}
      {body ? <p>{body}</p> : null}
      {children}
      {action ? (
        <div className="iquji-empty-state__action">{action}</div>
      ) : null}
    </section>
  );
}

export type IqujiLoadingStateProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  className?: string;
};

export function IqujiLoadingState({
  className,
  label,
  ...divProps
}: IqujiLoadingStateProps) {
  const names = ["iquji-loading-state", className].filter(Boolean).join(" ");
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={names}
      role="status"
      {...divProps}
    >
      <span className="iquji-loading-state__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export * from "./calendar.js";
export * from "./color-picker.js";
export * from "./confirmation.js";
export * from "./data-table.js";
export * from "./date-picker.js";
export * from "./desktop-account.js";
export * from "./desktop-rail.js";
export * from "./desktop-shell.js";
export * from "./desktop-tabs.js";
export * from "./desktop-titlebar.js";
export * from "./drawer.js";
export * from "./feedback.js";
export * from "./floating.js";
export * from "./form-dialog.js";
export * from "./form-steps.js";
export * from "./forms.js";
export * from "./layout.js";
export * from "./multi-select.js";
export * from "./navigation.js";
export * from "./notification.js";
export { IqujiOverlayProvider } from "./overlay-layer.js";
export * from "./overlay-scope.js";
export * from "./overlays.js";
export * from "./pagination.js";
export * from "./progress-bar.js";
export * from "./scroll-area.js";
export * from "./search-dialog.js";
export * from "./settings-layout.js";
export * from "./settings-nav.js";
export * from "./settings-rows.js";
export * from "./timeline.js";
export * from "./tooltip.js";
export * from "./workbench.js";
export * from "./emoji-picker.js";
