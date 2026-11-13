import { Popover as BasePopover } from "@base-ui/react/popover";
import { IqujiIcon } from "@iquji-cloud/web-icons";
import {
  type ButtonHTMLAttributes,
  forwardRef,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useId,
  useState,
} from "react";
import { IqujiCalendar } from "./calendar.js";
import { useIqujiOverlayContainer } from "./overlay-scope.js";
import { classNames } from "./utils.js";

export type IqujiDatePickerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "defaultValue" | "disabled" | "name" | "onChange" | "value"
> & {
  value?: string | null | undefined;
  defaultValue?: string | null | undefined;
  onChange?: ((date: string | null) => void) | undefined;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  compact?: boolean | undefined;
  allowClear?: boolean | undefined;
  min?: string | undefined;
  max?: string | undefined;
  disabledDate?: ((date: Date) => boolean) | undefined;
  locale?: string | undefined;
  name?: string | undefined;
  id?: string | undefined;
  iconStart?: ReactNode | undefined;
};

export const IqujiDatePicker = forwardRef<
  HTMLButtonElement,
  IqujiDatePickerProps
>(function IqujiDatePicker(
  {
    "aria-invalid": ariaInvalid,
    allowClear = true,
    className,
    compact = false,
    defaultValue,
    disabled = false,
    disabledDate,
    iconStart,
    id,
    invalid = false,
    locale = "zh-CN",
    max,
    min,
    name,
    onChange,
    placeholder = "请选择日期",
    value,
    ...triggerProps
  },
  ref,
) {
  const generatedId = useId();
  const triggerId = id ?? `${generatedId}-datepicker`;
  const overlayContainer = useIqujiOverlayContainer();
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null,
  );

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const actualInvalid =
    invalid || ariaInvalid === true || ariaInvalid === "true";

  const handleDateChange = useCallback(
    (nextDate: string) => {
      if (!isControlled) {
        setInternalValue(nextDate);
      }
      onChange?.(nextDate);
      setOpen(false);
    },
    [isControlled, onChange],
  );

  const handleClear = useCallback(
    (event?: MouseEvent) => {
      event?.stopPropagation();
      event?.preventDefault();
      if (!isControlled) {
        setInternalValue(null);
      }
      onChange?.(null);
      setOpen(false);
    },
    [isControlled, onChange],
  );

  const names = classNames(
    "iquji-date-picker",
    compact ? "iquji-date-picker--compact" : undefined,
    actualInvalid ? "is-invalid" : undefined,
    currentValue ? "has-value" : "is-empty",
    allowClear && Boolean(currentValue) && !disabled ? "has-clear" : undefined,
    className,
  );

  return (
    <BasePopover.Root
      onOpenChange={(nextOpen) => {
        if (!disabled) {
          setOpen(nextOpen);
        }
      }}
      open={open && !disabled}
    >
      <div
        className={classNames(
          "iquji-date-picker__control",
          compact ? "iquji-date-picker__control--compact" : undefined,
        )}
      >
        <BasePopover.Trigger
          {...triggerProps}
          aria-haspopup="dialog"
          aria-invalid={actualInvalid || undefined}
          aria-label={triggerProps["aria-label"] ?? placeholder}
          className={names}
          data-disabled={disabled || undefined}
          data-invalid={actualInvalid || undefined}
          disabled={disabled}
          id={triggerId}
          name={name}
          ref={ref}
          type="button"
        >
          {iconStart ? (
            <span aria-hidden="true" className="iquji-date-picker__start-icon">
              {iconStart}
            </span>
          ) : null}
          <span
            className={classNames(
              "iquji-date-picker__value",
              !currentValue ? "iquji-date-picker__placeholder" : undefined,
            )}
          >
            {currentValue || placeholder}
          </span>
          <span className="iquji-date-picker__actions">
            <span aria-hidden="true" className="iquji-date-picker__indicator">
              <IqujiIcon decorative name="calendar" size={15} />
            </span>
          </span>
        </BasePopover.Trigger>
        {allowClear && Boolean(currentValue) && !disabled ? (
          <button
            aria-label="清除日期"
            className="iquji-date-picker__clear-btn"
            onClick={handleClear}
            type="button"
          >
            <IqujiIcon decorative name="close" size={14} />
          </button>
        ) : null}
      </div>

      <BasePopover.Portal container={overlayContainer}>
        <BasePopover.Positioner
          align="start"
          className="iquji-date-picker__positioner"
          sideOffset={4}
        >
          <BasePopover.Popup
            className="iquji-date-picker__popup"
            data-iquji-overlay="date-picker"
          >
            <IqujiCalendar
              clearable={allowClear}
              defaultValue={defaultValue}
              disabledDate={disabledDate}
              locale={locale}
              max={max}
              min={min}
              onChange={handleDateChange}
              onClear={handleClear}
              value={currentValue}
            />
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
});

IqujiDatePicker.displayName = "IqujiDatePicker";
