import type { HTMLAttributes, ReactNode, Ref } from "react";

export interface IqujiEditorViewportProps
  extends HTMLAttributes<HTMLDivElement> {
  toolbar?: ReactNode;
  overlay?: ReactNode;
  footer?: ReactNode;
  zoom?: number;
  scrollRef?: Ref<HTMLDivElement>;
  onBodyInteract?(target: EventTarget): void;
  classes?: Partial<
    Record<"workspace" | "viewport" | "scroll" | "page" | "footer", string>
  >;
}
/** 在可滚动视口内缩放页面，并渲染独立的工具栏和浮层。 */
export function IqujiEditorViewport({
  toolbar,
  overlay,
  footer,
  zoom = 100,
  scrollRef,
  onBodyInteract,
  classes = {},
  children,
  className,
  ...props
}: IqujiEditorViewportProps) {
  return (
    <div
      {...props}
      className={["iquji-editor-workspace", classes.workspace, className]
        .filter(Boolean)
        .join(" ")}
    >
      {toolbar}
      <div
        className={["iquji-editor-viewport", classes.viewport]
          .filter(Boolean)
          .join(" ")}
      >
        {overlay}
        <div
          className={["iquji-editor-scroll", classes.scroll]
            .filter(Boolean)
            .join(" ")}
          ref={scrollRef}
          onPointerDown={(event) => onBodyInteract?.(event.target)}
          onFocusCapture={(event) => onBodyInteract?.(event.target)}
        >
          <div
            className={["iquji-editor-page", classes.page]
              .filter(Boolean)
              .join(" ")}
            style={{ zoom: zoom / 100 }}
          >
            {children}
          </div>
        </div>
        {footer && (
          <div
            className={["iquji-editor-footer", classes.footer]
              .filter(Boolean)
              .join(" ")}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
