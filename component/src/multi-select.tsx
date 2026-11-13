import { Fragment, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { IqujiButton } from "./index.js";
import { IqujiCheckbox, IqujiInput } from "./forms.js";
import { IqujiPopover } from "./floating.js";
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
  className?: string;
};

export function IqujiMultiSelect<Value extends string>({
  className,
  clearLabel,
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

  return (
    <div className={classNames("iquji-multi-select", className)}>
      <span className="iquji-multi-select__label" id={labelId}>
        {label}
      </span>
      <IqujiPopover
        onOpenChange={setOpen}
        open={open}
        trigger={
          <IqujiButton
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-labelledby={labelId}
            className="iquji-multi-select__trigger"
            disabled={disabled}
            variant="secondary"
          >
            <span className="iquji-multi-select__value">
              {selectedOptions.length
                ? selectedOptions.map((option, index) => (
                    <Fragment key={option.value}>
                      {index > 0 ? "、" : null}
                      {option.label}
                    </Fragment>
                  ))
                : placeholder}
            </span>
          </IqujiButton>
        }
      >
        <div className="iquji-multi-select__popup">
          {searchable ? (
            <IqujiInput
              aria-label={searchLabel}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder={searchLabel}
              value={query}
            />
          ) : null}
          <div aria-label={label} className="iquji-multi-select__options" role="group">
            {visible.map((option) => (
              <IqujiCheckbox
                checked={selected.has(option.value)}
                description={option.description}
                disabled={disabled || option.disabled}
                key={option.value}
                label={option.label}
                onChange={(event) => toggle(option, event.currentTarget.checked)}
              />
            ))}
            {visible.length === 0 ? (
              <p className="iquji-multi-select__empty">{emptyLabel}</p>
            ) : null}
          </div>
          <div className="iquji-multi-select__actions">
            {selectAllLabel ? (
              <IqujiButton compact disabled={disabled} onClick={selectAll} variant="ghost">
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
        </div>
      </IqujiPopover>
    </div>
  );
}
