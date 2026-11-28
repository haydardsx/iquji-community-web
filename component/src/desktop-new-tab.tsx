import type { ReactNode } from "react";
import { useId } from "react";
import type { IqujiDesktopTab } from "./desktop-tabs.js";
import { IqujiButton } from "./index.js";

export type IqujiDesktopNewTabPageProps = {
  heading: ReactNode;
  items: readonly Pick<IqujiDesktopTab, "id" | "label" | "icon" | "disabled">[];
  onSelect(id: string): void;
};

/** 在工作台标签内展示当前可打开的入口。 */
export function IqujiDesktopNewTabPage({ heading, items, onSelect }: IqujiDesktopNewTabPageProps) {
  const headingId = useId();
  return (
    <section className="iquji-desktop-new-tab" aria-labelledby={headingId}>
      <div className="iquji-desktop-new-tab__content">
        <h2 id={headingId}>{heading}</h2>
        <div className="iquji-desktop-new-tab__grid">
          {items.map((item) => (
            <IqujiButton
              key={item.id}
              className="iquji-desktop-new-tab__item"
              variant="ghost"
              disabled={item.disabled}
              onClick={() => onSelect(item.id)}
            >
              {item.icon && <span aria-hidden="true" className="iquji-desktop-new-tab__icon">{item.icon}</span>}
              <span>{item.label}</span>
            </IqujiButton>
          ))}
        </div>
      </div>
    </section>
  );
}
