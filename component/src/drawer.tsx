import { Drawer } from "@base-ui/react/drawer";
import { IqujiIcon } from "@iquji-web/web-icons";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useId,
  useState,
} from "react";
import { IconButton } from "./index.js";
import {
  resolveIqujiOverlayInitialFocus,
  restoreIqujiOverlayFocus,
  useIqujiOverlayReturnFocus,
} from "./overlay-focus.js";
import {
  IqujiOverlayAncestry,
  IqujiOverlayBoundary,
  useIqujiOverlayLayer,
  useIqujiOverlayModal,
} from "./overlay-layer.js";
import {
  useIqujiOverlayCompletion,
  useIqujiOverlayPresence,
} from "./overlay-presence.js";
import { IqujiOverlayScopeProvider } from "./overlay-scope.js";
import { classNames } from "./utils.js";

export type IqujiDrawerSize = "sm" | "md" | "lg" | "xl" | number | string;
export type IqujiDrawerProps = {
  open: boolean;
  onOpenChange?: ((open: boolean) => void) | undefined;
  onCloseComplete?: (() => void) | undefined;
  onEscape?: (() => boolean) | undefined;
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
  title?: ReactNode;
  description?: ReactNode;
  closeLabel: string;
  headerMeta?: ReactNode;
  headerToolbar?: ReactNode;
  actions?: ReactNode;
  actionBarLayout?: "end" | "full" | undefined;
  children?: ReactNode;
  size?: IqujiDrawerSize | undefined;
  width?: CSSProperties["width"] | undefined;
  surface?: "panel" | "canvas" | undefined;
  className?: string | undefined;
  bodyClassName?: string | undefined;
  destroyOnClose?: boolean | undefined;
};
const widths = {
  sm: "min(92vw, 420px)",
  md: "min(92vw, 720px)",
  lg: "min(94vw, 960px)",
  xl: "min(96vw, 1180px)",
};
function widthOf(value: IqujiDrawerSize) {
  return typeof value === "number"
    ? `${value}px`
    : (widths[value as keyof typeof widths] ?? value);
}

export function IqujiDrawer(props: IqujiDrawerProps) {
  return (
    <IqujiOverlayBoundary>
      <DrawerContent {...props} />
    </IqujiOverlayBoundary>
  );
}
function DrawerContent({
  open,
  onOpenChange,
  onCloseComplete,
  onEscape,
  initialFocusRef,
  title,
  description,
  closeLabel,
  headerMeta,
  headerToolbar,
  actions,
  actionBarLayout = "end",
  children,
  size = "md",
  width,
  surface = "panel",
  className,
  bodyClassName,
  destroyOnClose = false,
}: IqujiDrawerProps) {
  const id = useId();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const presence = useIqujiOverlayPresence(open, onCloseComplete);
  const layer = useIqujiOverlayLayer(
    id,
    "drawer",
    presence.active,
    open,
    container,
  );
  const focus = useIqujiOverlayModal(open, layer.isTopLayer);
  const finalFocus = useIqujiOverlayReturnFocus(open);
  useIqujiOverlayCompletion(presence, layer.registered, finalFocus);
  return (
    <IqujiOverlayAncestry id={id}>
      <Drawer.Root
        open={open}
        modal={focus.modal}
        swipeDirection="right"
        onOpenChange={(next, details) => {
          if (
            !next &&
            (!layer.isTopLayer ||
              (details.reason === "escape-key" && onEscape?.()))
          ) {
            details.cancel();
            return;
          }
          onOpenChange?.(next);
        }}
        onOpenChangeComplete={(next) => {
          if (!next) restoreIqujiOverlayFocus(finalFocus);
          presence.complete(next);
        }}
      >
        <Drawer.Portal
          keepMounted={!destroyOnClose}
          container={
            typeof document === "undefined" ? undefined : document.body
          }
        >
          <Drawer.Backdrop
            forceRender
            className="iquji-overlay-backdrop iquji-drawer-backdrop"
            style={{ zIndex: layer.backdrop }}
          />
          <div
            ref={setContainer}
            className="iquji-overlay-floating-layer"
            data-iquji-overlay-portal=""
            style={{ zIndex: layer.floating }}
          />
          <Drawer.Popup
            onFocusCapture={focus.onFocusCapture}
            initialFocus={
              !open || layer.isTopLayer
                ? resolveIqujiOverlayInitialFocus(initialFocusRef)
                : false
            }
            data-iquji-overlay-surface=""
            finalFocus={finalFocus}
            className={classNames(
              "iquji-drawer",
              surface === "canvas" && "iquji-drawer--canvas",
              className,
            )}
            style={{ width: widthOf(width ?? size), zIndex: layer.surface }}
          >
            <IqujiOverlayScopeProvider container={container}>
              {(title || description || headerMeta) && (
                <header className="iquji-drawer__header">
                  <div className="iquji-drawer__heading">
                    {title && (
                      <Drawer.Title className="iquji-dialog__title">
                        {title}
                      </Drawer.Title>
                    )}
                    {description && (
                      <Drawer.Description className="iquji-dialog__description">
                        {description}
                      </Drawer.Description>
                    )}
                  </div>
                  {headerMeta && (
                    <div className="iquji-drawer__meta">{headerMeta}</div>
                  )}
                  <Drawer.Close
                    render={
                      <IconButton
                        label={closeLabel}
                        icon={<IqujiIcon name="close" />}
                      />
                    }
                  />
                </header>
              )}
              {headerToolbar && (
                <div className="iquji-drawer__toolbar">{headerToolbar}</div>
              )}
              <div className={classNames("iquji-drawer__body", bodyClassName)}>
                {children}
              </div>
              {actions && (
                <footer className="iquji-drawer__actions">
                  <div
                    className={classNames(
                      "iquji-drawer__action-row",
                      actionBarLayout === "full" &&
                        "iquji-drawer__action-row--full",
                    )}
                  >
                    {actions}
                  </div>
                </footer>
              )}
            </IqujiOverlayScopeProvider>
          </Drawer.Popup>
        </Drawer.Portal>
      </Drawer.Root>
    </IqujiOverlayAncestry>
  );
}
