import { IqujiIcon } from "@iquji-web/web-icons";
import type { ReactNode } from "react";
import { useId } from "react";
import { classNames } from "./utils.js";

export type IqujiSettingsNavItem = {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  href?: string;
  onSelect?: (() => void) | undefined;
  trailing?: ReactNode;
};

export type IqujiSettingsNavGroup = {
  key: string;
  label?: ReactNode;
  items: readonly IqujiSettingsNavItem[];
};

export type IqujiSettingsNavSearch = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export type IqujiSettingsNavProps = {
  label: string;
  groups: readonly IqujiSettingsNavGroup[];
  header?: ReactNode;
  search?: IqujiSettingsNavSearch;
  emptyLabel?: ReactNode;
  className?: string | undefined;
};

function navItemContent(item: IqujiSettingsNavItem) {
  return (
    <>
      {item.icon ? (
        <span aria-hidden="true" className="iquji-settings-nav__item-icon">
          {item.icon}
        </span>
      ) : null}
      <span className="iquji-settings-nav__item-label">{item.label}</span>
      {item.trailing ? (
        <span className="iquji-settings-nav__item-trailing">
          {item.trailing}
        </span>
      ) : null}
    </>
  );
}

export function IqujiSettingsNav({
  label,
  groups,
  header,
  search,
  emptyLabel,
  className,
}: IqujiSettingsNavProps) {
  const generatedId = useId();
  const searchId = `${generatedId}-search`;

  return (
    <div className={classNames("iquji-settings-nav", className)}>
      {header ? (
        <div className="iquji-settings-nav__header">{header}</div>
      ) : null}
      {search ? (
        <div className="iquji-settings-nav__search">
          <label className="iquji-visually-hidden" htmlFor={searchId}>
            {search.label}
          </label>
          <span aria-hidden="true" className="iquji-settings-nav__search-icon">
            <IqujiIcon decorative name="search" size={15} />
          </span>
          <input
            autoComplete="off"
            className="iquji-settings-nav__search-input"
            id={searchId}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder}
            spellCheck={false}
            type="search"
            value={search.value}
          />
        </div>
      ) : null}
      <nav aria-label={label} className="iquji-settings-nav__nav">
        {groups.length === 0 && emptyLabel ? (
          <p className="iquji-settings-nav__empty" role="status">
            {emptyLabel}
          </p>
        ) : null}
        {groups.map((group, index) => {
          const headingId = group.label
            ? `${generatedId}-group-${index}`
            : undefined;
          return (
            <div
              aria-labelledby={headingId}
              className="iquji-settings-nav__group"
              key={group.key}
              role={headingId ? "group" : undefined}
            >
              {group.label ? (
                <h2 className="iquji-settings-nav__group-label" id={headingId}>
                  {group.label}
                </h2>
              ) : null}
              <div className="iquji-settings-nav__items">
                {group.items.map((item) =>
                  item.href && !item.disabled ? (
                    <a
                      aria-current={item.active ? "page" : undefined}
                      className="iquji-settings-nav__item"
                      data-active={item.active || undefined}
                      href={item.href}
                      key={item.key}
                      onClick={item.onSelect}
                    >
                      {navItemContent(item)}
                    </a>
                  ) : (
                    <button
                      aria-current={item.active ? "page" : undefined}
                      className="iquji-settings-nav__item"
                      data-active={item.active || undefined}
                      disabled={item.disabled}
                      key={item.key}
                      onClick={item.onSelect}
                      type="button"
                    >
                      {navItemContent(item)}
                    </button>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
