import { IqujiIcon } from "@iquji-cloud/web-icons";
import { FormDialogResize } from "./form-dialog-resize.js";
import { IconButton } from "./index.js";
import { IqujiDialog, type IqujiDialogProps } from "./overlays.js";
import { classNames } from "./utils.js";

export type IqujiFormDialogProps = Omit<
  IqujiDialogProps,
  "layout" | "surface" | "size" | "popupRef"
> & {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  expandLabel: string;
  collapseLabel: string;
};

/** 展开只改变尺寸，表单和浮层会话在同一挂载中保留。 */
export function IqujiFormDialog({
  expanded,
  onExpandedChange,
  expandLabel,
  collapseLabel,
  className,
  headerActions,
  width,
  ...props
}: IqujiFormDialogProps) {
  return (
    <FormDialogResize open={props.open} expanded={expanded}>
      {(popupRef) => (
        <IqujiDialog
          {...props}
          popupRef={popupRef}
          className={classNames(
            "iquji-form-dialog",
            expanded && "iquji-form-dialog--expanded",
            className,
          )}
          width={expanded ? "min(calc(100vw - 48px), 1000px)" : width}
          headerActions={
            <>
              {headerActions}
              <IconButton
                aria-expanded={expanded}
                icon={
                  <IqujiIcon
                    decorative
                    name={expanded ? "minimize" : "maximize"}
                  />
                }
                label={expanded ? collapseLabel : expandLabel}
                onClick={() => onExpandedChange(!expanded)}
              />
            </>
          }
        />
      )}
    </FormDialogResize>
  );
}
