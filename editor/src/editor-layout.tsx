import type { HTMLAttributes, ReactNode } from "react";

export interface IqujiEditorLayoutProps extends HTMLAttributes<HTMLDivElement> {
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/** 布局只组合工具区、正文和底部扩展，不持有保存或 AI 会话。 */
export function IqujiEditorLayout({
  toolbar,
  footer,
  children,
  className,
  ...props
}: IqujiEditorLayoutProps) {
  return (
    <div
      {...props}
      className={["iquji-editor", className].filter(Boolean).join(" ")}
    >
      {toolbar && <div className="iquji-editor-toolbar">{toolbar}</div>}
      <div className="iquji-editor-body">{children}</div>
      {footer && <div className="iquji-editor-footer">{footer}</div>}
    </div>
  );
}
