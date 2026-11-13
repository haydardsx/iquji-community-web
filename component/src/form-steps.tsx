import { IqujiIcon } from "@iquji-web/web-icons";
import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";
import { classNames } from "./utils.js";

export type IqujiFormStep<Id extends string> = {
  id: Id;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  completed?: boolean;
};
export type IqujiFormStepsProps<Id extends string> = {
  label: string;
  steps: readonly IqujiFormStep<Id>[];
  value: Id;
  onChange: (id: Id) => void;
  className?: string;
  completedLabel?: string;
};

/** 步骤只报告导航意图，不推断表单校验或提交进度。 */
export function IqujiFormSteps<Id extends string>({
  label,
  steps,
  value,
  onChange,
  className,
  completedLabel,
}: IqujiFormStepsProps<Id>) {
  const id = useId();
  const refs = useRef(new Map<Id, HTMLButtonElement>());
  const enabled = steps.filter((step) => !step.disabled);
  const selectedEnabled = enabled.some((step) => step.id === value);
  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, current: Id) => {
    if (
      event.nativeEvent.isComposing ||
      event.keyCode === 229 ||
      !enabled.length
    )
      return;
    const index = enabled.findIndex((step) => step.id === current);
    let next: IqujiFormStep<Id> | undefined;
    if (event.key === "Home") next = enabled[0];
    else if (event.key === "End") next = enabled.at(-1);
    else if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = enabled[(index + 1) % enabled.length];
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = enabled[(index - 1 + enabled.length) % enabled.length];
    if (next) {
      event.preventDefault();
      refs.current.get(next.id)?.focus();
    }
  };
  return (
    <nav
      aria-label={label}
      className={classNames("iquji-form-steps", className)}
    >
      <ol>
        {steps.map((step, index) => (
          <li key={step.id}>
            <button
              aria-current={step.id === value ? "step" : undefined}
              aria-label={
                typeof step.label === "string" ? step.label : undefined
              }
              aria-describedby={
                [
                  step.description && `${id}-${step.id}-description`,
                  step.completed &&
                    completedLabel &&
                    `${id}-${step.id}-completed`,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
              aria-labelledby={
                typeof step.label === "string"
                  ? undefined
                  : `${id}-${step.id}-label`
              }
              className={classNames(
                "iquji-form-steps__step",
                step.completed && "iquji-form-steps__step--completed",
              )}
              disabled={step.disabled}
              onClick={() => onChange(step.id)}
              onKeyDown={(event) => moveFocus(event, step.id)}
              ref={(element) => {
                if (element) refs.current.set(step.id, element);
                else refs.current.delete(step.id);
              }}
              tabIndex={
                !step.disabled &&
                (step.id === value || (!selectedEnabled && step === enabled[0]))
                  ? 0
                  : -1
              }
              type="button"
            >
              <span aria-hidden="true" className="iquji-form-steps__marker">
                {step.completed ? (
                  <IqujiIcon decorative name="check" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="iquji-form-steps__text">
                <span
                  id={`${id}-${step.id}-label`}
                  className="iquji-form-steps__label"
                >
                  {step.label}
                </span>
                {step.description && (
                  <span
                    id={`${id}-${step.id}-description`}
                    className="iquji-form-steps__description"
                  >
                    {step.description}
                  </span>
                )}
                {step.completed && completedLabel && (
                  <span
                    id={`${id}-${step.id}-completed`}
                    className="iquji-form-steps__status"
                  >
                    {completedLabel}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
