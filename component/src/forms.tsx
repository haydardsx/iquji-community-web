import { Select as BaseSelect } from "@base-ui/react/select";
import { IqujiIcon } from "@iquji-cloud/web-icons";
import {
  type ButtonHTMLAttributes,
  cloneElement,
  forwardRef,
  type InputHTMLAttributes,
  type Key,
  type ReactElement,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useId,
} from "react";
import { useIqujiOverlayContainer } from "./overlay-scope.js";
import { classNames } from "./utils.js";

type FieldControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true";
  required?: boolean;
};

export type IqujiFieldProps = {
  children: ReactElement<FieldControlProps>;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  id?: string;
  required?: boolean;
  className?: string;
};

export function IqujiField({
  children,
  className,
  description,
  error,
  id,
  label,
  required = false,
}: IqujiFieldProps) {
  const generatedId = useId();
  const controlId = children.props.id ?? id ?? `${generatedId}-control`;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const actualRequired = required || children.props.required === true;
  const describedBy = [
    children.props["aria-describedby"],
    descriptionId,
    errorId,
  ]
    .filter(Boolean)
    .join(" ");
  const controlProps: FieldControlProps = {
    id: controlId,
    required: actualRequired,
  };
  if (describedBy) {
    controlProps["aria-describedby"] = describedBy;
  }
  if (error) {
    controlProps["aria-invalid"] = true;
  }

  return (
    <div className={classNames("iquji-field", className)}>
      <label className="iquji-field__label" htmlFor={controlId}>
        {label}
        {actualRequired ? <span aria-hidden="true">*</span> : null}
      </label>
      {cloneElement(children, controlProps)}
      {description ? (
        <div className="iquji-field__description" id={descriptionId}>
          {description}
        </div>
      ) : null}
      {error ? (
        <div className="iquji-field__error" id={errorId} role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}

export type IqujiInputProps = InputHTMLAttributes<HTMLInputElement>;

export const IqujiInput = forwardRef<HTMLInputElement, IqujiInputProps>(
  function IqujiInput({ className, ...inputProps }, ref) {
    return (
      <input
        className={classNames("iquji-input", className)}
        ref={ref}
        {...inputProps}
      />
    );
  },
);

export type IqujiTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const IqujiTextarea = forwardRef<
  HTMLTextAreaElement,
  IqujiTextareaProps
>(function IqujiTextarea({ className, ...textareaProps }, ref) {
  return (
    <textarea
      className={classNames("iquji-textarea", className)}
      ref={ref}
      {...textareaProps}
    />
  );
});

export type IqujiSelectOption<Value> = {
  label: ReactNode;
  value: Value;
  disabled?: boolean;
  key?: Key;
};

export type IqujiSelectOptionGroup<Value> = {
  key: Key;
  label: ReactNode;
  options: readonly IqujiSelectOption<Value>[];
};

/** Select 触发器的展示方式。icon-only 仅显示传入的图标，选项文字仍保留在弹层中。 */
export type IqujiSelectTriggerPresentation = "value" | "icon-only";

export type IqujiSelectProps<Value> = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "defaultValue" | "disabled" | "name" | "onChange" | "value"
> & {
  options: readonly IqujiSelectOption<Value>[];
  groups?: readonly IqujiSelectOptionGroup<Value>[];
  value?: Value | null;
  defaultValue?: Value | null;
  onValueChange?: (value: Value | null) => void;
  placeholder?: ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  compact?: boolean;
  iconStart?: ReactNode;
  triggerPresentation?: IqujiSelectTriggerPresentation;
  name?: string;
  autoComplete?: string;
  ref?: Ref<HTMLButtonElement>;
};

export function IqujiSelect<Value>({
  "aria-invalid": ariaInvalid,
  autoComplete,
  className,
  compact = false,
  defaultValue,
  disabled = false,
  groups,
  iconStart,
  id,
  invalid = false,
  name,
  onValueChange,
  options,
  placeholder,
  ref,
  required = false,
  triggerPresentation = "value",
  value,
  ...triggerProps
}: IqujiSelectProps<Value>) {
  const overlayContainer = useIqujiOverlayContainer();
  // 分组标题不是选项，值解析与键盘导航仍使用完整的真实选项集合。
  const allOptions = groups
    ? groups.flatMap((group) => group.options)
    : options;
  const renderOptions = (entries: readonly IqujiSelectOption<Value>[]) =>
    entries.map((option, index) => (
      <BaseSelect.Item
        className="iquji-select__item"
        disabled={option.disabled}
        key={option.key ?? `${index}:${String(option.value)}`}
        value={option.value}
      >
        <BaseSelect.ItemText className="iquji-select__item-text">
          {option.label}
        </BaseSelect.ItemText>
        <BaseSelect.ItemIndicator className="iquji-select__item-indicator">
          <IqujiIcon decorative name="check" size={16} />
        </BaseSelect.ItemIndicator>
      </BaseSelect.Item>
    ));
  const actualInvalid =
    invalid || ariaInvalid === true || ariaInvalid === "true";
  const names = classNames(
    "iquji-select",
    compact ? "iquji-select--compact" : undefined,
    triggerPresentation === "icon-only" ? "iquji-select--icon-only" : undefined,
    className,
  );
  const triggerTitle =
    triggerProps.title ??
    (triggerPresentation === "icon-only" &&
    typeof triggerProps["aria-label"] === "string"
      ? triggerProps["aria-label"]
      : undefined);
  const triggerAriaLabel =
    triggerProps["aria-label"] ??
    (triggerPresentation === "icon-only" &&
    typeof triggerProps.title === "string"
      ? triggerProps.title
      : undefined);

  return (
    <BaseSelect.Root<Value>
      autoComplete={autoComplete}
      defaultValue={defaultValue}
      disabled={disabled}
      id={id}
      items={allOptions}
      name={name}
      onOpenChange={(_open, details) => {
        if (details.reason === "escape-key") {
          details.event.stopPropagation();
        }
      }}
      onValueChange={(nextValue) => onValueChange?.(nextValue)}
      required={required}
      value={value}
    >
      <BaseSelect.Trigger
        {...triggerProps}
        aria-label={triggerAriaLabel}
        aria-invalid={actualInvalid || undefined}
        className={names}
        data-invalid={actualInvalid || undefined}
        data-trigger-presentation={triggerPresentation}
        title={triggerTitle}
        ref={ref}
      >
        {iconStart ? (
          <span aria-hidden="true" className="iquji-select__start-icon">
            {iconStart}
          </span>
        ) : null}
        <BaseSelect.Value
          aria-hidden={triggerPresentation === "icon-only" || undefined}
          className="iquji-select__value"
          placeholder={placeholder}
        />
        <BaseSelect.Icon aria-hidden="true" className="iquji-select__indicator">
          <IqujiIcon decorative name="chevron-down" size={16} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal
        className="iquji-select__portal"
        container={overlayContainer}
      >
        <BaseSelect.Positioner
          align={triggerPresentation === "icon-only" ? "end" : "start"}
          alignItemWithTrigger={false}
          className="iquji-select__positioner"
          sideOffset={4}
        >
          <BaseSelect.Popup
            className="iquji-select__popup"
            data-iquji-overlay="select"
            finalFocus={true}
          >
            <BaseSelect.ScrollUpArrow className="iquji-select__scroll-arrow">
              <IqujiIcon decorative name="arrow-up" size={15} />
            </BaseSelect.ScrollUpArrow>
            <BaseSelect.List className="iquji-select__list">
              {groups
                ? groups.map((group) => (
                    <BaseSelect.Group
                      className="iquji-select__group"
                      key={group.key}
                    >
                      <BaseSelect.GroupLabel className="iquji-select__group-label">
                        {group.label}
                      </BaseSelect.GroupLabel>
                      {renderOptions(group.options)}
                    </BaseSelect.Group>
                  ))
                : renderOptions(options)}
            </BaseSelect.List>
            <BaseSelect.ScrollDownArrow className="iquji-select__scroll-arrow">
              <IqujiIcon decorative name="arrow-down" size={15} />
            </BaseSelect.ScrollDownArrow>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

type ChoiceProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "children" | "type"
> & {
  label: ReactNode;
  description?: ReactNode;
};

function IqujiChoice({
  "aria-describedby": ariaDescribedBy,
  className,
  description,
  label,
  type,
  ...inputProps
}: ChoiceProps & { type: "checkbox" | "radio" }) {
  const descriptionId = useId();
  const describedBy = [ariaDescribedBy, description ? descriptionId : undefined]
    .filter(Boolean)
    .join(" ");
  return (
    <label className={classNames("iquji-choice", className)}>
      <input
        aria-describedby={describedBy || undefined}
        type={type}
        {...inputProps}
      />
      <span className="iquji-choice__control" aria-hidden="true" />
      <span className="iquji-choice__content">
        <span className="iquji-choice__label">{label}</span>
        {description ? (
          <span className="iquji-choice__description" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export type IqujiCheckboxProps = ChoiceProps;
export function IqujiCheckbox(props: IqujiCheckboxProps) {
  return <IqujiChoice type="checkbox" {...props} />;
}

export type IqujiRadioProps = ChoiceProps;
export function IqujiRadio(props: IqujiRadioProps) {
  return <IqujiChoice type="radio" {...props} />;
}

export type IqujiSwitchProps = ChoiceProps;
export function IqujiSwitch({ className, ...props }: IqujiSwitchProps) {
  return (
    <IqujiChoice
      className={classNames("iquji-switch", className)}
      role="switch"
      type="checkbox"
      {...props}
    />
  );
}

export type IqujiSegmentedOption<Value extends string> = {
  label: ReactNode;
  value: Value;
  disabled?: boolean;
};

export type IqujiSegmentedControlProps<Value extends string> = {
  label: string;
  options: readonly IqujiSegmentedOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
  disabled?: boolean;
};

export function IqujiSegmentedControl<Value extends string>({
  className,
  disabled = false,
  label,
  onChange,
  options,
  value,
}: IqujiSegmentedControlProps<Value>) {
  return (
    <fieldset
      className={classNames("iquji-segmented", className)}
      disabled={disabled}
    >
      <legend className="iquji-visually-hidden">{label}</legend>
      {options.map((option) => (
        <button
          aria-pressed={option.value === value}
          disabled={disabled || option.disabled}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}
