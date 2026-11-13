import type { ReactNode } from "react";
import { IqujiTooltip } from "./tooltip.js";
import { classNames } from "./utils.js";

export type IqujiDesktopRailItem = {
  id: string;
  label: string;
  icon: ReactNode;
  tooltip?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  href?: string;
  onSelect?: (() => void) | undefined;
  onIntent?: (() => void) | undefined;
  badge?: ReactNode;
};

export type IqujiDesktopRailProps = {
  label: string;
  items: readonly IqujiDesktopRailItem[];
  footer?: ReactNode;
  showDivider?: boolean | undefined;
  className?: string | undefined;
};

export function IqujiDesktopRail({
  label,
  items,
  footer,
  showDivider = true,
  className,
}: IqujiDesktopRailProps) {
  return (
    <aside
      className={classNames("iquji-desktop-rail", className)}
      data-show-divider={showDivider ? "true" : "false"}
    >
      <nav aria-label={label} className="iquji-desktop-rail__nav">
        {items.map((item) => {
          const content = (
            <>
              <span aria-hidden="true" className="iquji-desktop-rail__icon">
                {item.icon}
              </span>
              {item.badge ? (
                <span className="iquji-desktop-rail__badge">{item.badge}</span>
              ) : null}
            </>
          );
          const trigger =
            item.href && !item.disabled ? (
              <a
                aria-current={item.active ? "page" : undefined}
                aria-label={item.label}
                className="iquji-desktop-rail__item"
                data-active={item.active || undefined}
                href={item.href}
                onClick={item.onSelect}
                onFocus={item.onIntent}
                onMouseEnter={item.onIntent}
              >
                {content}
              </a>
            ) : (
              <button
                aria-current={item.active ? "page" : undefined}
                aria-label={item.label}
                className="iquji-desktop-rail__item"
                data-active={item.active || undefined}
                disabled={item.disabled}
                onFocus={item.onIntent}
                onMouseEnter={item.onIntent}
                onClick={item.disabled ? undefined : item.onSelect}
                type="button"
              >
                {content}
              </button>
            );

          return (
            <IqujiTooltip
              content={item.tooltip ?? item.label}
              key={item.id}
              placement="right"
            >
              {trigger}
            </IqujiTooltip>
          );
        })}
      </nav>
      {footer ? (
        <div className="iquji-desktop-rail__footer">{footer}</div>
      ) : null}
    </aside>
  );
}
