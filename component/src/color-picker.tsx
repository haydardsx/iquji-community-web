import { type ReactElement, useEffect, useRef, useState } from "react";
import { IqujiPopover, type IqujiPopoverProps } from "./floating.js";
import { IqujiButton } from "./index.js";

export const normalizeIqujiColor = (value: string): string | null =>
  /^#[0-9a-f]{6}$/iu.test(value.trim()) ? value.trim().toLowerCase() : null;

export type IqujiColorPreset = { value: string; label: string };
export interface IqujiColorPickerProps {
  value: string | null;
  onChange(value: string | null): void;
  presets: readonly IqujiColorPreset[];
  label: string;
  defaultLabel: string;
  customLabel: string;
  hexLabel: string;
  applyLabel: string;
  cancelLabel: string;
  disabled?: boolean | undefined;
  trigger?: ReactElement | undefined;
  onOpenChange?(open: boolean, reason: string): void;
  finalFocus?: IqujiPopoverProps["finalFocus"];
}

/** 只管理颜色选择；编辑器选区、内容和持久化由调用方持有。 */
export function IqujiColorPicker({
  value,
  onChange,
  presets,
  label,
  defaultLabel,
  customLabel,
  hexLabel,
  applyLabel,
  cancelLabel,
  disabled = false,
  trigger,
  onOpenChange,
  finalFocus,
}: IqujiColorPickerProps) {
  const currentOnOpenChange = useRef(onOpenChange);
  currentOnOpenChange.current = onOpenChange;
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState(value ?? "#000000");
  const valid = normalizeIqujiColor(draft);
  const changeOpen = (next: boolean, reason = "programmatic") => {
    if (next && disabled) return;
    setOpen(next);
    if (next) {
      setCustom(false);
      setDraft(value ?? "#000000");
    }
    onOpenChange?.(next, reason);
  };
  useEffect(() => {
    if (disabled && open) {
      setOpen(false);
      currentOnOpenChange.current?.(false, "disabled");
    }
  }, [disabled, open]);
  const choose = (next: string | null) => {
    if (disabled) return;
    onChange(next);
    changeOpen(false, "selection");
  };
  return (
    <IqujiPopover
      open={open}
      onOpenChange={(next, details) => changeOpen(next, details.reason)}
      align="start"
      collisionPadding={12}
      collisionAvoidance={{ side: "flip", align: "shift", fallbackAxisSide: "start" }}
      popupStyle={{ maxWidth: "calc(100vw - 32px)" }}
      finalFocus={finalFocus}
      trigger={
        trigger ?? (
          <IqujiButton
            compact
            variant="ghost"
            disabled={disabled}
            aria-label={label}
          >
            <span
              className="iquji-color-swatch"
              style={{ backgroundColor: value ?? "transparent" }}
            />
            {label}
          </IqujiButton>
        )
      }
    >
      <fieldset className="iquji-color-picker" aria-label={label}>
        <IqujiButton
          compact
          variant="ghost"
          disabled={disabled}
          onClick={() => choose(null)}
        >
          {defaultLabel}
        </IqujiButton>
        <div className="iquji-color-presets">
          {presets.map((preset) => (
            <IqujiButton
              key={preset.value}
              compact
              variant="ghost"
              disabled={disabled || !normalizeIqujiColor(preset.value)}
              aria-label={preset.label}
              title={preset.label}
              aria-pressed={value === preset.value}
              onClick={() => choose(preset.value)}
            >
              <span
                className="iquji-color-swatch"
                style={{ backgroundColor: preset.value }}
              />
              <span className="iquji-color-name">{preset.label}</span>
            </IqujiButton>
          ))}
        </div>
        {!custom ? (
          <IqujiButton
            compact
            variant="ghost"
            disabled={disabled}
            onClick={() => setCustom(true)}
          >
            {customLabel}
          </IqujiButton>
        ) : (
          <>
            <input
              className="iquji-color-spectrum"
              type="color"
              value={valid ?? "#000000"}
              aria-label={customLabel}
              disabled={disabled}
              onChange={(event) => setDraft(event.target.value)}
            />
            <label className="iquji-color-hex">
              {hexLabel}
              <input
                value={draft}
                spellCheck={false}
                maxLength={7}
                aria-invalid={!valid}
                disabled={disabled}
                onChange={(event) => setDraft(event.target.value)}
              />
            </label>
            <div className="iquji-color-actions">
              <IqujiButton
                compact
                variant="secondary"
                onClick={() => changeOpen(false, "cancel")}
              >
                {cancelLabel}
              </IqujiButton>
              <IqujiButton
                compact
                disabled={disabled || !valid}
                onClick={() => valid && choose(valid)}
              >
                {applyLabel}
              </IqujiButton>
            </div>
          </>
        )}
      </fieldset>
    </IqujiPopover>
  );
}
