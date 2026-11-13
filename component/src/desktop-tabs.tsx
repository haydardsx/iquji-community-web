import { IqujiIcon } from "@iquji-web/web-icons";
import {
  type KeyboardEvent,
  type ReactNode,
  useRef,
} from "react";
import { IconButton } from "./index.js";
import { classNames } from "./utils.js";

export type IqujiDesktopTab = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  dirty?: boolean;
  closable?: boolean;
  disabled?: boolean;
  /** 关闭按钮的无障碍名称；不提供时调用方可通过 closeTabLabel 统一生成。 */
  closeLabel?: string;
};

export type IqujiDesktopTabStripProps = {
  tabs: readonly IqujiDesktopTab[];
  activeTabId: string | null;
  label: string;
  onActiveTabChange?: ((id: string) => void) | undefined;
  onTabClose?: ((id: string) => void) | undefined;
  onTabAdd?: (() => void) | undefined;
  addTabLabel?: string | undefined;
  closeTabLabel?: ((tab: IqujiDesktopTab) => string) | undefined;
  tabActions?: ReactNode;
  className?: string | undefined;
};

function closeLabelOf(
  tab: IqujiDesktopTab,
  closeTabLabel?: (tab: IqujiDesktopTab) => string,
) {
  return tab.closeLabel ?? closeTabLabel?.(tab);
}

export function IqujiDesktopTabStrip({
  tabs,
  activeTabId,
  label,
  onActiveTabChange,
  onTabClose,
  onTabAdd,
  addTabLabel,
  closeTabLabel,
  tabActions,
  className,
}: IqujiDesktopTabStripProps) {
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const enabledTabs = tabs.filter((tab) => !tab.disabled);
  const enabledIndexById = new Map(
    enabledTabs.map((tab, index) => [tab.id, index]),
  );
  const activeIndex = enabledTabs.findIndex((tab) => tab.id === activeTabId);
  const rovingIndex = activeIndex >= 0 ? activeIndex : 0;

  const activate = (id: string) => {
    onActiveTabChange?.(id);
    tabRefs.current.get(id)?.focus();
  };

  const moveFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    direction: 1 | -1,
  ) => {
    if (enabledTabs.length === 0) return;
    const current = Math.max(
      0,
      enabledTabs.findIndex((tab) => tab.id === activeTabId),
    );
    const next =
      enabledTabs[(current + direction + enabledTabs.length) % enabledTabs.length];
    if (!next) return;
    event.preventDefault();
    activate(next.id);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight") {
      moveFocus(event, 1);
      return;
    }
    if (event.key === "ArrowLeft") {
      moveFocus(event, -1);
      return;
    }
    if (event.key === "Home") {
      const first = enabledTabs[0];
      if (first) {
        event.preventDefault();
        activate(first.id);
      }
      return;
    }
    if (event.key === "End") {
      const last = enabledTabs[enabledTabs.length - 1];
      if (last) {
        event.preventDefault();
        activate(last.id);
      }
      return;
    }
    if (event.key === "Delete" && activeTabId && onTabClose) {
      const active = tabs.find((tab) => tab.id === activeTabId);
      if (active && !active.disabled && closeLabelOf(active, closeTabLabel)) {
        event.preventDefault();
        onTabClose(activeTabId);
      }
    }
  };

  return (
    <div className={classNames("iquji-desktop-tabstrip", className)}>
      {tabs.length > 0 ? (
        <div
          aria-label={label}
          className="iquji-desktop-tabstrip__list"
          role="tablist"
        >
          {tabs.map((tab) => {
            const active = tab.id === activeTabId;
            const closeLabel = closeLabelOf(tab, closeTabLabel);
            const canClose = Boolean(onTabClose && tab.closable !== false && closeLabel);
            return (
              <div
                className="iquji-desktop-tab"
                data-active={active || undefined}
                key={tab.id}
                role="presentation"
              >
                <button
                  aria-selected={active}
                  className="iquji-desktop-tab__select"
                  disabled={tab.disabled}
                  onClick={() => onActiveTabChange?.(tab.id)}
                  onKeyDown={handleTabKeyDown}
                  ref={(element) => {
                    if (element) {
                      tabRefs.current.set(tab.id, element);
                    } else {
                      tabRefs.current.delete(tab.id);
                    }
                  }}
                  role="tab"
                  tabIndex={
                    tab.disabled
                      ? -1
                      : enabledIndexById.get(tab.id) === rovingIndex
                        ? 0
                        : -1
                  }
                  type="button"
                >
                  {tab.icon ? (
                    <span aria-hidden="true" className="iquji-desktop-tab__icon">
                      {tab.icon}
                    </span>
                  ) : null}
                  <span className="iquji-desktop-tab__label">{tab.label}</span>
                  {tab.dirty ? (
                    <span
                      aria-hidden="true"
                      className="iquji-desktop-tab__dirty"
                    />
                  ) : null}
                </button>
                {canClose ? (
                  <IconButton
                    className="iquji-desktop-tab__close"
                    compact
                    icon={<IqujiIcon decorative name="close" size={14} />}
                    label={closeLabel ?? ""}
                    onClick={() => onTabClose?.(tab.id)}
                    tabIndex={active ? 0 : -1}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="iquji-desktop-tabstrip__list" />
      )}
      {onTabAdd && addTabLabel ? (
        <IconButton
          className="iquji-desktop-tabstrip__add"
          compact
          icon={<IqujiIcon decorative name="plus" size={15} />}
          label={addTabLabel}
          onClick={onTabAdd}
        />
      ) : null}
      {tabActions ? (
        <div className="iquji-desktop-tabstrip__actions">{tabActions}</div>
      ) : null}
    </div>
  );
}
