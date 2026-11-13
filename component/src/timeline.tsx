import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "./utils.js";

export type IqujiTimelineTone = "neutral" | "info" | "success" | "warning" | "danger";

export type IqujiTimelineItem = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  timestamp?: ReactNode;
  tone?: IqujiTimelineTone;
  icon?: ReactNode;
  status?: ReactNode;
};

export type IqujiTimelineProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  label: string;
  items: readonly IqujiTimelineItem[];
  emptyLabel?: string;
};

export function IqujiTimeline({
  className,
  emptyLabel = "暂无时间线记录",
  items,
  label,
  ...sectionProps
}: IqujiTimelineProps) {
  return (
    <section
      aria-label={label}
      className={classNames("iquji-timeline", className)}
      {...sectionProps}
    >
      {items.length === 0 ? (
        <p className="iquji-timeline__empty">{emptyLabel}</p>
      ) : (
        <ol className="iquji-timeline__list">
          {items.map((item) => (
            <li
              className="iquji-timeline__item"
              data-tone={item.tone ?? "neutral"}
              key={item.id}
            >
              <span aria-hidden="true" className="iquji-timeline__marker">
                {item.icon}
              </span>
              <div className="iquji-timeline__content">
                <div className="iquji-timeline__heading">
                  <span className="iquji-timeline__title">{item.title}</span>
                  {item.timestamp ? (
                    <span className="iquji-timeline__timestamp">{item.timestamp}</span>
                  ) : null}
                </div>
                {item.description ? (
                  <div className="iquji-timeline__description">{item.description}</div>
                ) : null}
                {item.status ? (
                  <div className="iquji-timeline__status">{item.status}</div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
