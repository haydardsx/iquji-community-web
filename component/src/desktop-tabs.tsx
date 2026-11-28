import { IqujiIcon } from "@iquji-community/web-icons";
import { type KeyboardEvent, type ReactNode, useRef } from "react";
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

export type IqujiDesktopLeadingTab = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  separator?: ReactNode;
  restoreSplit?: { label: string; onClick: () => void };
  onSelect?: (() => void) | undefined;
};

export type IqujiDesktopTabStripProps = {
  tabs: readonly IqujiDesktopTab[];
  activeTabId: string | null;
  label: string;
  leadingTab?: IqujiDesktopLeadingTab | undefined;
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
  leadingTab,
  onActiveTabChange,
  onTabClose,
  onTabAdd,
  addTabLabel,
  closeTabLabel,
  tabActions,
  className,
}: IqujiDesktopTabStripProps) {
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const leadingEnabled = Boolean(leadingTab && !leadingTab.disabled);
  const enabledTabs = tabs.filter((tab) => !tab.disabled);
  const navigableItems: Array<{ id: string; select: () => void }> = [
    ...(leadingTab && leadingEnabled
      ? [{ id: leadingTab.id, select: () => leadingTab.onSelect?.() }]
      : []),
    ...enabledTabs.map((tab) => ({
      id: tab.id,
      select: () => onActiveTabChange?.(tab.id),
    })),
  ];
  const navigableIndexById = new Map(
    navigableItems.map((item, index) => [item.id, index]),
  );
  const effectiveActiveId = leadingTab?.active ? leadingTab.id : activeTabId;
  const activeIndex = navigableItems.findIndex(
    (item) => item.id === effectiveActiveId,
  );
  const rovingIndex = activeIndex >= 0 ? activeIndex : 0;

  const activateNavigable = (item: { id: string; select: () => void }) => {
    item.select();
    tabRefs.current.get(item.id)?.focus();
  };

  const moveFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    direction: 1 | -1,
  ) => {
    if (navigableItems.length === 0) return;
    const current = Math.max(
      0,
      navigableItems.findIndex((item) => item.id === effectiveActiveId),
    );
    const next =
      navigableItems[
        (current + direction + navigableItems.length) % navigableItems.length
      ];
    if (!next) return;
    event.preventDefault();
    activateNavigable(next);
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
      const first = navigableItems[0];
      if (first) {
        event.preventDefault();
        activateNavigable(first);
      }
      return;
    }
    if (event.key === "End") {
      const last = navigableItems[navigableItems.length - 1];
      if (last) {
        event.preventDefault();
        activateNavigable(last);
      }
      return;
    }
    if (
      event.key === "Delete" &&
      !leadingTab?.active &&
      activeTabId &&
      onTabClose
    ) {
      const active = tabs.find((tab) => tab.id === activeTabId);
      if (active && active.closable !== false && !active.disabled && closeLabelOf(active, closeTabLabel)) {
        event.preventDefault();
        onTabClose(activeTabId);
      }
    }
  };

  const hasListContent = Boolean(leadingTab) || tabs.length > 0;

  return (
    <div className={classNames("iquji-desktop-tabstrip", className)}>
      {hasListContent ? (
        <div
          aria-label={label}
          className="iquji-desktop-tabstrip__list"
          role="tablist"
        >
          {leadingTab ? (
            <>
              <div
                className="iquji-desktop-tab iquji-desktop-tab--leading"
                data-active={leadingTab.active || undefined}
                role="presentation"
              >
                <button
                  aria-selected={Boolean(leadingTab.active)}
                  className="iquji-desktop-tab__select"
                  disabled={leadingTab.disabled}
                  onClick={() => leadingTab.onSelect?.()}
                  onKeyDown={handleTabKeyDown}
                  ref={(element) => {
                    if (element) {
                      tabRefs.current.set(leadingTab.id, element);
                    } else {
                      tabRefs.current.delete(leadingTab.id);
                    }
                  }}
                  role="tab"
                  tabIndex={
                    leadingTab.disabled
                      ? -1
                      : navigableIndexById.get(leadingTab.id) === rovingIndex
                        ? 0
                        : -1
                  }
                  type="button"
                >
                  {leadingTab.icon ? (
                    <span aria-hidden="true" className="iquji-desktop-tab__icon">
                      {leadingTab.icon}
                    </span>
                  ) : null}
                  <span className="iquji-desktop-tab__label">
                    {leadingTab.label}
                  </span>
                </button>
              </div>
              {leadingTab.restoreSplit ? (
                <IconButton
                  className="iquji-desktop-tabstrip__restore"
                  compact
                  label={leadingTab.restoreSplit.label}
                  icon={<IqujiIcon decorative name="chevron-right" size={14} />}
                  onClick={leadingTab.restoreSplit.onClick}
                />
              ) : tabs.length > 0 ? (
                <span
                  aria-hidden="true"
                  className="iquji-desktop-tabstrip__separator"
                >
                  {leadingTab.separator ?? (
                    <IqujiIcon decorative name="chevron-right" size={14} />
                  )}
                </span>
              ) : null}
            </>
          ) : null}
          {tabs.map((tab) => {
            const active = !leadingTab?.active && tab.id === activeTabId;
            const closeLabel = closeLabelOf(tab, closeTabLabel);
            const canClose = Boolean(
              onTabClose && tab.closable !== false && closeLabel,
            );
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
                      : navigableIndexById.get(tab.id) === rovingIndex
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
                    icon={<IqujiIcon decorative name="close" size={12} />}
                    label={closeLabel ?? ""}
                    onClick={() => onTabClose?.(tab.id)}
                    tabIndex={active ? 0 : -1}
                  />
                ) : null}
              </div>
            );
          })}
          {onTabAdd && addTabLabel ? (
            <IconButton
              className="iquji-desktop-tabstrip__add"
              compact
              icon={<IqujiIcon decorative name="plus" size={15} />}
              label={addTabLabel}
              onClick={onTabAdd}
            />
          ) : null}
        </div>
      ) : (
        <div className="iquji-desktop-tabstrip__list">
          {onTabAdd && addTabLabel ? (
            <IconButton
              className="iquji-desktop-tabstrip__add"
              compact
              icon={<IqujiIcon decorative name="plus" size={15} />}
              label={addTabLabel}
              onClick={onTabAdd}
            />
          ) : null}
        </div>
      )}
      {tabActions ? (
        <div className="iquji-desktop-tabstrip__actions">{tabActions}</div>
      ) : null}
    </div>
  );
}
