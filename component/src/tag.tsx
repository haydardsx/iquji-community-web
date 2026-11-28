import {
  type ButtonHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from "react";
import type { IqujiTone } from "./feedback.js";
import { classNames } from "./utils.js";

export type IqujiTagVariant = "subtle" | "outline";
export type IqujiTagSize = "sm" | "md";

export type IqujiTagProps = Omit<
  HTMLAttributes<HTMLElement>,
  "onChange" | "onClick"
> & {
  tone?: IqujiTone | undefined;
  variant?: IqujiTagVariant | undefined;
  size?: IqujiTagSize | undefined;
  selected?: boolean | undefined;
  interactive?: boolean | undefined;
  disabled?: boolean | undefined;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"] | undefined;
  onClick?: MouseEventHandler<HTMLElement> | undefined;
  onSelectedChange?: ((selected: boolean) => void) | undefined;
};

/** 通用标签组件，支持静态信息展示、可选中切换以及作为浮层触发器。 */
export const IqujiTag = forwardRef<HTMLElement, IqujiTagProps>(
  function IqujiTag(
    {
      "aria-pressed": ariaPressed,
      children,
      className,
      disabled = false,
      iconEnd,
      iconStart,
      interactive = false,
      onClick,
      onSelectedChange,
      selected,
      size = "sm",
      tone = "neutral",
      type = "button",
      variant = "subtle",
      ...restProps
    },
    ref,
  ) {
    const isInteractive = Boolean(
      interactive || selected !== undefined || onSelectedChange || onClick,
    );
    const names = classNames(
      "iquji-tag",
      isInteractive && "iquji-tag--interactive",
      className,
    );
    const content = (
      <>
        {iconStart ? (
          <span
            aria-hidden="true"
            className="iquji-tag__icon iquji-tag__icon--start"
          >
            {iconStart}
          </span>
        ) : null}
        <span className="iquji-tag__label">{children}</span>
        {iconEnd ? (
          <span
            aria-hidden="true"
            className="iquji-tag__icon iquji-tag__icon--end"
          >
            {iconEnd}
          </span>
        ) : null}
      </>
    );

    if (!isInteractive) {
      return (
        <span
          {...(restProps as HTMLAttributes<HTMLSpanElement>)}
          className={names}
          data-disabled={disabled ? "true" : undefined}
          data-size={size}
          data-tone={tone}
          data-variant={variant}
          ref={ref as Ref<HTMLSpanElement>}
        >
          {content}
        </span>
      );
    }

    return (
      <button
        {...(restProps as ButtonHTMLAttributes<HTMLButtonElement>)}
        aria-pressed={
          ariaPressed ?? (selected !== undefined ? selected : undefined)
        }
        className={names}
        data-disabled={disabled ? "true" : undefined}
        data-selected={selected ? "true" : undefined}
        data-size={size}
        data-tone={tone}
        data-variant={variant}
        disabled={disabled}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
          if (!event.defaultPrevented && onSelectedChange) {
            onSelectedChange(!selected);
          }
        }}
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
      >
        {content}
      </button>
    );
  },
);
