import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { classNames } from "./utils.js";

export type IqujiScrollAreaProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: string;
  children?: ReactNode;
  height?: number | string;
  maxHeight?: number | string;
  orientation?: "vertical" | "horizontal" | "both";
  tabIndex?: number;
};

function size(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

export function IqujiScrollArea({
  children,
  className,
  height,
  label,
  maxHeight,
  orientation = "vertical",
  style,
  tabIndex = 0,
  ...divProps
}: IqujiScrollAreaProps) {
  const styles: CSSProperties = {
    ...style,
    height: size(height),
    maxHeight: size(maxHeight),
  };
  return (
    <div
      aria-label={label}
      className={classNames("iquji-scroll-area", className)}
      data-orientation={orientation}
      role="region"
      style={styles}
      tabIndex={tabIndex}
      {...divProps}
    >
      {children}
    </div>
  );
}
