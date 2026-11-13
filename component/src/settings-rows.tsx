import type { ReactNode } from "react";
import { useId } from "react";
import {
  IqujiSelect,
  type IqujiSelectOption,
  type IqujiSelectOptionGroup,
  IqujiSwitch,
  type IqujiSwitchProps,
} from "./forms.js";
import { classNames } from "./utils.js";

type SettingsRowFrameProps = {
  label: ReactNode;
  description?: ReactNode;
  labelId: string;
  descriptionId?: string | undefined;
  htmlFor?: string | undefined;
  disabled?: boolean | undefined;
  align?: "center" | "start" | undefined;
  className?: string | undefined;
  labelClassName?: string | undefined;
  controlClassName?: string | undefined;
  control: ReactNode;
};

function SettingsRowFrame({
  label,
  description,
  labelId,
  descriptionId,
  htmlFor,
  disabled = false,
  align = "center",
  className,
  labelClassName,
  controlClassName,
  control,
}: SettingsRowFrameProps) {
  return (
    <div
      className={classNames("iquji-settings-row", className)}
      data-align={align}
      data-disabled={disabled || undefined}
    >
      <div className="iquji-settings-row__copy">
        {htmlFor ? (
          <label
            className={classNames(
              "iquji-settings-row__label",
              labelClassName,
            )}
            htmlFor={htmlFor}
            id={labelId}
          >
            {label}
          </label>
        ) : (
          <span
            className={classNames(
              "iquji-settings-row__label",
              labelClassName,
            )}
            id={labelId}
          >
            {label}
          </span>
        )}
        {description !== undefined && description !== null ? (
          <span
            className="iquji-settings-row__description"
            id={descriptionId}
          >
            {description}
          </span>
        ) : null}
      </div>
      <div
        className={classNames(
          "iquji-settings-row__control",
          controlClassName,
        )}
      >
        {control}
      </div>
    </div>
  );
}

export type IqujiSettingsRowProps = {
  label: ReactNode;
  description?: ReactNode;
  control: ReactNode;
  htmlFor?: string | undefined;
  labelId?: string | undefined;
  descriptionId?: string | undefined;
  align?: "center" | "start" | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
  labelClassName?: string | undefined;
  controlClassName?: string | undefined;
};

export function IqujiSettingsRow({
  label,
  description,
  control,
  htmlFor,
  labelId,
  descriptionId,
  align,
  disabled,
  className,
  labelClassName,
  controlClassName,
}: IqujiSettingsRowProps) {
  const generatedId = useId();
  return (
    <SettingsRowFrame
      align={align}
      className={className}
      control={control}
      controlClassName={controlClassName}
      description={description}
      descriptionId={
        description !== undefined && description !== null
          ? (descriptionId ?? `${generatedId}-description`)
          : undefined
      }
      disabled={disabled}
      htmlFor={htmlFor}
      label={label}
      labelClassName={labelClassName}
      labelId={labelId ?? `${generatedId}-label`}
    />
  );
}

export type IqujiSettingsSwitchRowProps = Omit<
  IqujiSwitchProps,
  "className"
> & {
  className?: string | undefined;
};

export function IqujiSettingsSwitchRow({
  className,
  ...props
}: IqujiSettingsSwitchRowProps) {
  return (
    <IqujiSwitch
      {...props}
      className={classNames(
        "iquji-settings-row",
        "iquji-settings-row--switch",
        className,
      )}
    />
  );
}

export type IqujiSettingsSelectRowProps<Value> = {
  label: ReactNode;
  description?: ReactNode;
  options: readonly IqujiSelectOption<Value>[];
  groups?: readonly IqujiSelectOptionGroup<Value>[] | undefined;
  value?: Value | null | undefined;
  defaultValue?: Value | null | undefined;
  onValueChange?: ((value: Value | null) => void) | undefined;
  placeholder?: ReactNode;
  disabled?: boolean | undefined;
  invalid?: boolean | undefined;
  required?: boolean | undefined;
  compact?: boolean | undefined;
  name?: string | undefined;
  id?: string | undefined;
  align?: "center" | "start" | undefined;
  className?: string | undefined;
  labelClassName?: string | undefined;
  controlClassName?: string | undefined;
};

export function IqujiSettingsSelectRow<Value>({
  label,
  description,
  options,
  groups,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  disabled = false,
  invalid = false,
  required = false,
  compact = false,
  name,
  id,
  align,
  className,
  labelClassName,
  controlClassName,
}: IqujiSettingsSelectRowProps<Value>) {
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const descriptionId =
    description !== undefined && description !== null
      ? `${generatedId}-description`
      : undefined;
  const selectProps = {
    "aria-labelledby": labelId,
    ...(descriptionId ? { "aria-describedby": descriptionId } : {}),
    compact,
    disabled,
    invalid,
    options,
    required,
    ...(groups !== undefined ? { groups } : {}),
    ...(value !== undefined ? { value } : {}),
    ...(defaultValue !== undefined ? { defaultValue } : {}),
    ...(onValueChange ? { onValueChange } : {}),
    ...(placeholder !== undefined ? { placeholder } : {}),
    ...(name !== undefined ? { name } : {}),
    ...(id !== undefined ? { id } : {}),
  };

  return (
    <SettingsRowFrame
      align={align}
      className={className}
      control={<IqujiSelect<Value> {...selectProps} />}
      controlClassName={controlClassName}
      description={description}
      descriptionId={descriptionId}
      disabled={disabled}
      label={label}
      labelClassName={labelClassName}
      labelId={labelId}
    />
  );
}

export type IqujiSettingsActionRowProps = {
  label: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  action?: ReactNode;
  disabled?: boolean | undefined;
  align?: "center" | "start" | undefined;
  className?: string | undefined;
  valueClassName?: string | undefined;
  controlClassName?: string | undefined;
};

export function IqujiSettingsActionRow({
  label,
  description,
  value,
  action,
  disabled = false,
  align = "center",
  className,
  valueClassName,
  controlClassName,
}: IqujiSettingsActionRowProps) {
  const generatedId = useId();
  const labelId = `${generatedId}-label`;
  const descriptionId =
    description !== undefined && description !== null
      ? `${generatedId}-description`
      : undefined;

  return (
    <SettingsRowFrame
      align={align}
      className={className}
      control={
        <>
          {value !== undefined && value !== null ? (
            <span
              className={classNames(
                "iquji-settings-row__value",
                valueClassName,
              )}
            >
              {value}
            </span>
          ) : null}
          {action}
        </>
      }
      controlClassName={controlClassName}
      description={description}
      descriptionId={descriptionId}
      disabled={disabled}
      label={label}
      labelId={labelId}
    />
  );
}
