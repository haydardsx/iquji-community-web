import { type ReactNode, useRef } from "react";
import { IqujiButton } from "./index.js";
import { IqujiDialog, type IqujiDialogProps } from "./overlays.js";

export type IqujiConfirmDialogProps = Omit<IqujiDialogProps, "actions"> & {
  confirmLabel: ReactNode;
  cancelLabel: ReactNode;
  confirmLoading?: boolean | undefined;
  confirmDisabled?: boolean | undefined;
  additionalActions?: ReactNode;
  onConfirm: () => void;
};

/** 提交与关闭由调用方掌控，等待期间不允许取消或重复提交。 */
export function IqujiConfirmDialog({
  confirmLabel,
  cancelLabel,
  confirmLoading = false,
  confirmDisabled = false,
  additionalActions,
  onConfirm,
  onOpenChange,
  initialFocusRef,
  size,
  width,
  layout = "compact",
  ...props
}: IqujiConfirmDialogProps) {
  const cancel = useRef<HTMLButtonElement>(null);
  return (
    <IqujiDialog
      {...props}
      initialFocusRef={initialFocusRef ?? cancel}
      size={size ?? "sm"}
      width={width ?? (size === undefined ? "min(92vw, 420px)" : undefined)}
      layout={layout}
      mandatory={confirmLoading || props.mandatory}
      onOpenChange={onOpenChange}
      actions={
        <>
          {additionalActions}
          <IqujiButton
            variant="secondary"
            ref={cancel}
            disabled={confirmLoading}
            onClick={() => onOpenChange?.(false)}
          >
            {cancelLabel}
          </IqujiButton>
          <IqujiButton
            variant="danger"
            disabled={confirmDisabled}
            loading={confirmLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </IqujiButton>
        </>
      }
    />
  );
}
