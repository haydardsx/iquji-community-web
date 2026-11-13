import { useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { IqujiIcon } from "@iquji-web/web-icons";

import { IqujiPopover } from "./floating.js";
import { IqujiInput } from "./forms.js";
import { IqujiButton } from "./index.js";
import { classNames } from "./utils.js";

export type IqujiMultiSelectOption<Value extends string> = {
  value: Value;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type IqujiMultiSelectProps<Value extends string> = {
  label: string;
  options: readonly IqujiMultiSelectOption<Value>[];
  value: readonly Value[];
  onChange: (value: Value[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchLabel?: string;
  emptyLabel?: string;
  selectAllLabel?: string;
  clearLabel?: string;
  clearOptionLabel?: string;
  variant?: "select" | "tags" | "checkbox";
  className?: string;
};

export function IqujiMultiSelect<Value extends string>({
  className,
  clearLabel,
  clearOptionLabel,
  disabled = false,
  emptyLabel = "没有匹配项",
  label,
  onChange,
  options,
  placeholder = "请选择",
  searchable = false,
  searchLabel = "搜索选项",
  selectAllLabel,
  value,
  variant = "select",
}: IqujiMultiSelectProps<Value>) {
  const labelId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(value), [value]);

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) =>
      `${typeof option.label === "string" ? option.label : ""} ${option.value}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [options, query]);

  const selectedOptions = options.filter((option) => selected.has(option.value));

  const toggle = (option: IqujiMultiSelectOption<Value>, checked: boolean) => {
    if (option.disabled || disabled) return;
    const next = new Set(selected);
    if (checked) next.add(option.value);
    else next.delete(option.value);
    onChange(options.filter((item) => next.has(item.value)).map((item) => item.value));
  };

  const selectAll = () => {
    if (disabled) return;
    const next = new Set(selected);
    for (const option of options) {
      if (!option.disabled) next.add(option.value);
    }
    onChange(options.filter((item) => next.has(item.value)).map((item) => item.value));
  };

  const isSelectVariant = variant === "select";
  const isTagsVariant = variant === "tags";
  const isCheckboxVariant = variant === "checkbox";

  return (
    <div className={classNames("iquji-multi-select", className)}>
      <span className="iquji-multi-select__label" id={labelId}>
        {label}
      </span>
      <IqujiPopover
        align="start"
        onOpenChange={setOpen}
        open={open}
        sideOffset={4}
        trigger={
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-labelledby={labelId}
            className={classNames(
              "iquji-select",
              "iquji-multi-select__trigger",
              open && "iquji-multi-select__trigger--open",
              selectedOptions.length === 0 && "iquji-multi-select__trigger--empty",
            )}
            disabled={disabled}
          >
            <span className="iquji-select__value iquji-multi-select__value">
              {isTagsVariant ? (
                selectedOptions.length > 0 ? (
                  <span className="iquji-multi-select__tags">
                    {selectedOptions.slice(0, 3).map((option) => (
                      <span className="iquji-multi-select__tag" key={option.value}>
                        {option.label}
                      </span>
                    ))}
                    {selectedOptions.length > 3 ? (
                      <span className="iquji-multi-select__tag iquji-multi-select__tag--count">
                        +{selectedOptions.length - 3}
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="iquji-multi-select__placeholder">{placeholder}</span>
                )
              ) : selectedOptions.length > 0 ? (
                <span className="iquji-multi-select__text">
                  {selectedOptions.map((option) => option.label).join("、")}
                </span>
              ) : (
                <span className="iquji-multi-select__placeholder">{placeholder}</span>
              )}
            </span>

            <span
              className={classNames(
                "iquji-select__indicator",
                "iquji-multi-select__indicator",
                open && "iquji-multi-select__indicator--open",
              )}
              aria-hidden="true"
            >
              <IqujiIcon decorative name="chevron-down" size={16} />
            </span>
          </button>
        }
      >
        <div className="iquji-multi-select__popup">
          {searchable ? (
            <div className="iquji-multi-select__search">
              <IqujiInput
                aria-label={searchLabel}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder={searchLabel}
                value={query}
              />
            </div>
          ) : null}

          <div
            aria-label={label}
            className="iquji-select__list iquji-multi-select__options"
            role="listbox"
            aria-multiselectable="true"
          >
            {clearOptionLabel ? (
              <div
                role="option"
                aria-selected={selected.size === 0}
                className={classNames(
                  "iquji-select__item",
                  "iquji-multi-select__item",
                  selected.size === 0 &&
                    "iquji-select__item--selected iquji-multi-select__item--selected",
                )}
                onClick={() => {
                  if (!disabled) onChange([]);
                }}
              >
                {isCheckboxVariant ? (
                  <span
                    className={classNames(
                      "iquji-multi-select__checkbox",
                      selected.size === 0 && "iquji-multi-select__checkbox--checked",
                    )}
                    aria-hidden="true"
                  >
                    {selected.size === 0 ? (
                      <IqujiIcon decorative name="check" size={11} strokeWidth={2.4} />
                    ) : null}
                  </span>
                ) : null}
                <span className="iquji-select__item-text iquji-multi-select__item-text">
                  {clearOptionLabel}
                </span>
                {!isCheckboxVariant && selected.size === 0 ? (
                  <span
                    className="iquji-select__item-indicator iquji-multi-select__item-indicator"
                    aria-hidden="true"
                  >
                    <IqujiIcon decorative name="check" size={16} />
                  </span>
                ) : null}
              </div>
            ) : null}

            {visible.map((option) => {
              const isChecked = selected.has(option.value);
              const isOptionDisabled = disabled || option.disabled;
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isChecked}
                  aria-disabled={isOptionDisabled}
                  data-disabled={isOptionDisabled || undefined}
                  className={classNames(
                    "iquji-select__item",
                    "iquji-multi-select__item",
                    isChecked &&
                      "iquji-select__item--selected iquji-multi-select__item--selected",
                    isOptionDisabled && "iquji-multi-select__item--disabled",
                  )}
                  onClick={() => {
                    if (!isOptionDisabled) {
                      toggle(option, !isChecked);
                    }
                  }}
                >
                  {isCheckboxVariant ? (
                    <span
                      className={classNames(
                        "iquji-multi-select__checkbox",
                        isChecked && "iquji-multi-select__checkbox--checked",
                      )}
                      aria-hidden="true"
                    >
                      {isChecked ? (
                        <IqujiIcon decorative name="check" size={11} strokeWidth={2.4} />
                      ) : null}
                    </span>
                  ) : null}
                  <div className="iquji-multi-select__item-content">
                    <span className="iquji-select__item-text iquji-multi-select__item-text">
                      {option.label}
                    </span>
                    {option.description ? (
                      <span className="iquji-multi-select__item-desc">
                        {option.description}
                      </span>
                    ) : null}
                  </div>
                  {!isCheckboxVariant && isChecked ? (
                    <span
                      className="iquji-select__item-indicator iquji-multi-select__item-indicator"
                      aria-hidden="true"
                    >
                      <IqujiIcon decorative name="check" size={16} />
                    </span>
                  ) : null}
                </div>
              );
            })}
            {visible.length === 0 ? (
              <p className="iquji-multi-select__empty">{emptyLabel}</p>
            ) : null}
          </div>

          {selectAllLabel || clearLabel ? (
            <div className="iquji-multi-select__actions">
              {selectAllLabel ? (
                <IqujiButton
                  compact
                  disabled={disabled || selected.size === options.length}
                  onClick={selectAll}
                  variant="ghost"
                >
                  {selectAllLabel}
                </IqujiButton>
              ) : null}
              {clearLabel ? (
                <IqujiButton
                  compact
                  disabled={disabled || selected.size === 0}
                  onClick={() => {
                    if (!disabled) onChange([]);
                  }}
                  variant="ghost"
                >
                  {clearLabel}
                </IqujiButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </IqujiPopover>
    </div>
  );
}
