import { Dialog } from "@base-ui/react/dialog";
import { IqujiIcon } from "@iquji-cloud/web-icons";
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
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

export type IqujiDialogProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "title" | "onClose" | "onCancel"
> & {
  open: boolean;
  onOpenChange?: ((open: boolean) => void) | undefined;
  onCloseComplete?: (() => void) | undefined;
  title?: ReactNode;
  description?: ReactNode;
  heading?: ReactNode;
  headerActions?: ReactNode;
  closeLabel?: string | undefined;
  children?: ReactNode;
  actions?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
  popupRef?: Ref<HTMLDivElement> | undefined;
  mandatory?: boolean | undefined;
  destroyOnClose?: boolean | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  surface?: "panel" | "glass" | undefined;
  layout?: "standard" | "compact" | undefined;
  width?: CSSProperties["width"] | undefined;
};
const widths = {
  sm: "min(92vw, 420px)",
  md: "min(92vw, 720px)",
  lg: "min(94vw, 960px)",
};

export function IqujiDialog(props: IqujiDialogProps) {
  return (
    <IqujiOverlayBoundary>
      <DialogContent {...props} />
    </IqujiOverlayBoundary>
  );
}
function DialogContent({
  open,
  onOpenChange,
  onCloseComplete,
  title,
  description,
  heading,
  headerActions,
  closeLabel,
  children,
  actions,
  initialFocusRef,
  popupRef,
  mandatory = false,
  destroyOnClose = true,
  size = "md",
  surface = "panel",
  layout = "standard",
  width,
  className,
  style,
  onFocusCapture,
  ...props
}: IqujiDialogProps) {
  const id = useId();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const presence = useIqujiOverlayPresence(open, onCloseComplete);
  const layer = useIqujiOverlayLayer(
    id,
    "dialog",
    presence.active,
    open,
    container,
  );
  const focus = useIqujiOverlayModal(open, layer.isTopLayer);
  const finalFocus = useIqujiOverlayReturnFocus(open);
  useIqujiOverlayCompletion(presence, layer.registered, finalFocus);
  if (!mandatory && !closeLabel)
    throw new Error("可关闭对话框必须提供 closeLabel");
  return (
    <IqujiOverlayAncestry id={id}>
      <Dialog.Root
        open={open}
        modal={focus.modal}
        disablePointerDismissal={mandatory}
        onOpenChange={(next, details) => {
          if (!next && (mandatory || !layer.isTopLayer)) {
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
        {/* 子对话框必须与父层 Portal 平级，避免 WebKit 随父 aria 子树一起隐藏。 */}
        <Dialog.Portal
          keepMounted={!destroyOnClose}
          container={
            typeof document === "undefined" ? undefined : document.body
          }
        >
          <Dialog.Backdrop
            forceRender
            className="iquji-overlay-backdrop iquji-dialog-backdrop"
            style={{ zIndex: layer.backdrop }}
          />
          <div
            ref={setContainer}
            className="iquji-overlay-floating-layer"
            data-iquji-overlay-portal=""
            style={{ zIndex: layer.floating }}
          />
          <div
            className="iquji-dialog-positioner"
            style={{ zIndex: layer.surface }}
          >
            <Dialog.Popup
              {...props}
              ref={popupRef}
              onFocusCapture={(event) => {
                focus.onFocusCapture(event);
                onFocusCapture?.(event);
              }}
              initialFocus={
                !open || layer.isTopLayer
                  ? resolveIqujiOverlayInitialFocus(initialFocusRef)
                  : false
              }
              finalFocus={finalFocus}
              className={classNames(
                "iquji-dialog iquji-floating-popup",
                surface === "glass" && "iquji-dialog--glass",
                layout === "compact" && "iquji-dialog--compact",
                className,
              )}
              data-iquji-overlay-surface=""
              data-mandatory={mandatory || undefined}
              style={{
                width: width ?? widths[size],
                zIndex: layer.surface,
                ...style,
              }}
            >
              <IqujiOverlayScopeProvider container={container}>
                <div className="iquji-dialog__surface">
                  {(title || description || heading || headerActions) && (
                    <header className="iquji-dialog__header">
                      <div className="iquji-dialog__heading">
                        {heading}
                        {title && (
                          <Dialog.Title
                            className={classNames(
                              "iquji-dialog__title",
                              Boolean(heading) && "iquji-dialog__title--hidden",
                            )}
                          >
                            {title}
                          </Dialog.Title>
                        )}
                        {description && (
                          <Dialog.Description className="iquji-dialog__description">
                            {description}
                          </Dialog.Description>
                        )}
                      </div>
                      <div className="iquji-dialog__header-actions">
                        {headerActions}
                        {!mandatory && (
                          <Dialog.Close
                            render={
                              <IconButton
                                label={closeLabel ?? ""}
                                icon={<IqujiIcon name="close" />}
                              />
                            }
                          />
                        )}
                      </div>
                    </header>
                  )}
                  <div className="iquji-dialog__body">{children}</div>
                  {actions && (
                    <footer className="iquji-dialog__actions">{actions}</footer>
                  )}
                </div>
              </IqujiOverlayScopeProvider>
            </Dialog.Popup>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </IqujiOverlayAncestry>
  );
}
