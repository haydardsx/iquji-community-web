import { cloneElement, type ReactElement, type ReactNode, useId } from "react";
import { classNames } from "./utils.js";

type TooltipTriggerProps = {
  "aria-describedby"?: string;
};

export type IqujiTooltipProps = {
  children: ReactElement<TooltipTriggerProps>;
  content: ReactNode;
  className?: string;
  placement?: "top" | "right" | "bottom" | "left";
};

export function IqujiTooltip({
  children,
  className,
  content,
  placement = "top",
}: IqujiTooltipProps) {
  const tooltipId = useId();
  const describedBy = [children.props["aria-describedby"], tooltipId]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classNames("iquji-tooltip", className)}>
      {cloneElement(children, { "aria-describedby": describedBy })}
      <span
        className="iquji-tooltip__content"
        data-placement={placement}
        id={tooltipId}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
}
