import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";
import { classNames } from "./utils.js";

export type IqujiTab<Value extends string> = {
  label: ReactNode;
  value: Value;
  disabled?: boolean;
};

export type IqujiTabsProps<Value extends string> = {
  id?: string;
  label: string;
  tabs: readonly IqujiTab<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
  panelId?: string;
  variant?: "underline" | "segmented";
};

export function IqujiTabs<Value extends string>({
  id,
  className,
  label,
  onChange,
  panelId,
  tabs,
  value,
  variant = "underline",
}: IqujiTabsProps<Value>) {
  const generatedId = useId();
  const tabsId = id ?? generatedId;
  const refs = useRef(new Map<Value, HTMLButtonElement>());
  const enabled = tabs.filter((tab) => !tab.disabled);
  const selectedEnabled = enabled.some((tab) => tab.value === value);

  const moveFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    current: Value,
    direction: 1 | -1,
  ) => {
    const currentIndex = enabled.findIndex((tab) => tab.value === current);
    const nextIndex =
      (currentIndex + direction + enabled.length) % enabled.length;
    const next = enabled[nextIndex];
    if (!next) {
      return;
    }
    event.preventDefault();
    onChange(next.value);
    refs.current.get(next.value)?.focus();
  };

  return (
    <div
      aria-label={label}
      className={classNames(
        "iquji-tabs",
        variant === "segmented" && "iquji-tabs--segmented",
        className,
      )}
      id={tabsId}
      role="tablist"
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            aria-controls={panelId}
            aria-selected={selected}
            disabled={tab.disabled}
            id={`${tabsId}-${tab.value}`}
            key={tab.value}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || event.keyCode === 229)
                return;
              if (event.key === "ArrowRight") {
                moveFocus(event, tab.value, 1);
              } else if (event.key === "ArrowLeft") {
                moveFocus(event, tab.value, -1);
              } else if (event.key === "Home") {
                const first = tabs.find((item) => !item.disabled);
                if (first) {
                  event.preventDefault();
                  onChange(first.value);
                  refs.current.get(first.value)?.focus();
                }
              } else if (event.key === "End") {
                const last = [...tabs].reverse().find((item) => !item.disabled);
                if (last) {
                  event.preventDefault();
                  onChange(last.value);
                  refs.current.get(last.value)?.focus();
                }
              }
            }}
            ref={(element) => {
              if (element) {
                refs.current.set(tab.value, element);
              } else {
                refs.current.delete(tab.value);
              }
            }}
            role="tab"
            tabIndex={
              !tab.disabled &&
              (selected || (!selectedEnabled && tab === enabled[0]))
                ? 0
                : -1
            }
            type="button"
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
