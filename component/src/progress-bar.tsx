import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "./utils.js";

export type IqujiProgressTone = "neutral" | "info" | "success" | "warning" | "danger";

export type IqujiProgressBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: string;
  value?: number;
  max?: number;
  tone?: IqujiProgressTone;
  indeterminate?: boolean;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => ReactNode;
};

export function IqujiProgressBar({
  className,
  formatValue,
  indeterminate = false,
  label,
  max = 100,
  showValue = false,
  tone = "info",
  value,
  ...divProps
}: IqujiProgressBarProps) {
  if (!Number.isFinite(max) || max <= 0) {
    throw new RangeError("进度条最大值必须是正数");
  }
  const determinate = !indeterminate && value !== undefined && Number.isFinite(value);
  const current = determinate ? Math.min(Math.max(value, 0), max) : 0;
  const percent = determinate ? (current / max) * 100 : 0;
  return (
    <div className={classNames("iquji-progress", className)} {...divProps}>
      <div className="iquji-progress__heading">
        <span className="iquji-progress__label">{label}</span>
        {showValue && determinate ? (
          <span className="iquji-progress__value">
            {formatValue ? formatValue(current, max) : `${Math.round(percent)}%`}
          </span>
        ) : null}
      </div>
      <div
        aria-label={label}
        aria-valuemax={determinate ? max : undefined}
        aria-valuemin={determinate ? 0 : undefined}
        aria-valuenow={determinate ? current : undefined}
        className="iquji-progress__track"
        data-indeterminate={!determinate || undefined}
        data-tone={tone}
        role="progressbar"
      >
        <span
          className="iquji-progress__fill"
          style={determinate ? { width: `${percent}%` } : undefined}
        />
      </div>
    </div>
  );
}
