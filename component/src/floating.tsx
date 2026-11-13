import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { IqujiIcon } from "@iquji-web/web-icons";
import {
  type ComponentProps,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useState,
} from "react";
import { useIqujiFloatingTriggerRefs } from "./overlay-focus.js";
import { useIqujiOverlayContainer } from "./overlay-scope.js";
import { classNames } from "./utils.js";

export type IqujiDropdownMenuItem = {
  kind?: "item";
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  /** 仅用于视觉展示；需要读屏语义时同时提供 keyshortcuts。 */
  shortcut?: ReactNode;
  keyshortcuts?: string;
  disabled?: boolean;
  tone?: "neutral" | "danger";
  onSelect?: () => void;
  submenu?: ReactNode;
};

export type IqujiDropdownMenuSubmenu = {
  kind: "submenu";
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  shortcut?: ReactNode;
  disabled?: boolean;
  items: readonly IqujiDropdownMenuEntry[];
};

export type IqujiDropdownMenuSeparator = {
  kind: "separator";
  key: string;
};

export type IqujiDropdownMenuLabel = {
  kind: "label";
  key: string;
  label: ReactNode;
};

export type IqujiDropdownMenuEntry =
  | IqujiDropdownMenuItem
  | IqujiDropdownMenuSubmenu
  | IqujiDropdownMenuSeparator
  | IqujiDropdownMenuLabel;

type SubmenuSource = IqujiDropdownMenuItem | IqujiDropdownMenuSubmenu;

function MenuEntryContent({
  entry,
  chevron = false,
}: {
  entry: SubmenuSource;
  chevron?: boolean;
}) {
  return (
    <>
      {entry.icon ? (
        <span aria-hidden="true" className="iquji-menu-item__icon">
          {entry.icon}
        </span>
      ) : null}
      <span className="iquji-menu-item__label">{entry.label}</span>
      {entry.shortcut ? (
        <span aria-hidden="true" className="iquji-menu-item__shortcut">
          {entry.shortcut}
        </span>
      ) : null}
      {chevron ? (
        <IqujiIcon
          className="iquji-menu-item__chevron"
          decorative
          name="chevron-right"
          size={15}
        />
      ) : null}
    </>
  );
}

function DropdownSubmenu({ item }: { item: SubmenuSource }) {
  const [open, setOpen] = useState(false);
  const portalContainer = useIqujiOverlayContainer();
  const structured = item.kind === "submenu" ? item.items : undefined;

  return (
    <BaseMenu.SubmenuRoot open={open} onOpenChange={setOpen}>
      <BaseMenu.SubmenuTrigger
        className={classNames(
          "iquji-menu-item",
          item.kind === "item" && item.tone === "danger"
            ? "iquji-menu-item--danger"
            : undefined,
        )}
        disabled={item.disabled}
        onClick={() => {
          if (!item.disabled) setOpen(true);
        }}
        openOnHover
      >
        <MenuEntryContent chevron entry={item} />
      </BaseMenu.SubmenuTrigger>
      <BaseMenu.Portal container={portalContainer ?? undefined}>
        <BaseMenu.Positioner
          align="start"
          className="iquji-floating-positioner"
          side="right"
          sideOffset={4}
          style={{ zIndex: portalContainer ? undefined : 1002 }}
        >
          <BaseMenu.Popup className="iquji-floating-popup iquji-menu-popup">
            {open
              ? structured
                ? renderMenuEntries(structured)
                : item.kind === "submenu"
                  ? null
                  : item.submenu
              : null}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.SubmenuRoot>
  );
}

function renderMenuEntry(entry: IqujiDropdownMenuEntry) {
  if (entry.kind === "separator") {
    return (
      <BaseMenu.Separator className="iquji-menu-separator" key={entry.key} />
    );
  }
  if (entry.kind === "label") {
    return (
      <div className="iquji-menu-label" key={entry.key} role="presentation">
        {entry.label}
      </div>
    );
  }
  if (entry.kind === "submenu" || entry.submenu) {
    return <DropdownSubmenu item={entry} key={entry.key} />;
  }
  return (
    <BaseMenu.Item
      aria-keyshortcuts={entry.keyshortcuts}
      className={classNames(
        "iquji-menu-item",
        entry.tone === "danger" ? "iquji-menu-item--danger" : undefined,
      )}
      disabled={entry.disabled}
      key={entry.key}
      onClick={entry.onSelect}
    >
      <MenuEntryContent entry={entry} />
    </BaseMenu.Item>
  );
}

function renderMenuEntries(entries: readonly IqujiDropdownMenuEntry[]) {
  return entries.map(renderMenuEntry);
}

export interface IqujiDropdownMenuProps {
  trigger: ReactElement;
  items: readonly IqujiDropdownMenuEntry[];
  open?: boolean;
  onOpenChange?: ComponentProps<typeof BaseMenu.Root>["onOpenChange"];
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  anchor?: ComponentProps<typeof BaseMenu.Positioner>["anchor"];
  collisionBoundary?: ComponentProps<
    typeof BaseMenu.Positioner
  >["collisionBoundary"];
  finalFocus?: ComponentProps<typeof BaseMenu.Popup>["finalFocus"];
  popupStyle?: CSSProperties;
  ariaLabel?: string;
}

export const IqujiDropdownMenu = ({
  trigger,
  items,
  open,
  onOpenChange,
  align,
  side,
  sideOffset,
  anchor,
  collisionBoundary,
  finalFocus,
  popupStyle,
  ariaLabel,
}: IqujiDropdownMenuProps) => {
  const portalContainer = useIqujiOverlayContainer();
  const { triggerRef, popupRef } = useIqujiFloatingTriggerRefs();

  return (
    <BaseMenu.Root open={open} onOpenChange={onOpenChange}>
      <BaseMenu.Trigger ref={triggerRef} render={trigger} />
      <BaseMenu.Portal keepMounted container={portalContainer ?? undefined}>
        <BaseMenu.Positioner
          align={align}
          anchor={anchor}
          collisionBoundary={collisionBoundary}
          className="iquji-floating-positioner"
          side={side}
          sideOffset={sideOffset}
          style={{ zIndex: portalContainer ? undefined : 1002 }}
        >
          <BaseMenu.Popup
            aria-label={ariaLabel}
            className="iquji-floating-popup iquji-menu-popup"
            finalFocus={finalFocus}
            ref={popupRef}
            style={popupStyle}
          >
            {renderMenuEntries(items)}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
};

export interface IqujiPopoverProps {
  anchor?: ComponentProps<typeof BasePopover.Positioner>["anchor"];
  finalFocus?: ComponentProps<typeof BasePopover.Popup>["finalFocus"];
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean | undefined;
  onOpenChange?: ComponentProps<typeof BasePopover.Root>["onOpenChange"];
  side?: "top" | "right" | "bottom" | "left" | undefined;
  align?: "start" | "center" | "end" | undefined;
  collisionBoundary?: ComponentProps<typeof BasePopover.Positioner>["collisionBoundary"];
  collisionPadding?: ComponentProps<typeof BasePopover.Positioner>["collisionPadding"];
  collisionAvoidance?: ComponentProps<typeof BasePopover.Positioner>["collisionAvoidance"];
  popupStyle?: CSSProperties | undefined;
}
export function IqujiPopover({
  anchor,
  trigger,
  children,
  open,
  onOpenChange,
  side = "bottom",
  align,
  collisionBoundary,
  collisionPadding,
  collisionAvoidance,
  popupStyle,
  finalFocus,
}: IqujiPopoverProps) {
  const container = useIqujiOverlayContainer();
  const { triggerRef, popupRef } = useIqujiFloatingTriggerRefs();
  return (
    <BasePopover.Root open={open} onOpenChange={onOpenChange}>
      <BasePopover.Trigger ref={triggerRef} render={trigger} />
      <BasePopover.Portal keepMounted container={container ?? undefined}>
        <BasePopover.Positioner
          anchor={anchor}
          side={side}
          align={align}
          sideOffset={8}
          collisionBoundary={collisionBoundary}
          collisionPadding={collisionPadding}
          collisionAvoidance={collisionAvoidance}
          className="iquji-floating-positioner"
          style={{ zIndex: container ? undefined : 1002 }}
        >
          <BasePopover.Popup
            ref={popupRef}
            finalFocus={finalFocus}
            className="iquji-floating-popup iquji-popover-popup"
            style={popupStyle}
          >
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
