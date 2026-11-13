import { IqujiIcon } from "@iquji-cloud/web-icons";
import { type ReactElement, type ReactNode, useId, useState } from "react";
import { IqujiPopover } from "./floating.js";
import { classNames } from "./utils.js";

export type IqujiDesktopAccountUsage = {
  label: string;
  value: number;
  valueText?: ReactNode;
  tone?: "accent" | "positive" | "warning" | "critical" | "neutral";
};

export type IqujiDesktopAccountItem = {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  shortcut?: ReactNode;
  keyshortcuts?: string;
  trailing?: ReactNode;
  disabled?: boolean;
  tone?: "neutral" | "danger";
  onSelect?: (() => void) | undefined;
};

export type IqujiDesktopAccountSection = {
  key: string;
  items: readonly IqujiDesktopAccountItem[];
};

export type IqujiDesktopAccountCardProps = {
  name: ReactNode;
  secondary?: ReactNode;
  badge?: ReactNode;
  avatar?: ReactNode;
  avatarLabel?: string;
  avatarTone?: "accent" | "positive" | "neutral";
  usage?: IqujiDesktopAccountUsage;
  sections: readonly IqujiDesktopAccountSection[];
  footer?: ReactNode;
  onItemSelect?: ((item: IqujiDesktopAccountItem) => void) | undefined;
  className?: string | undefined;
};

export type IqujiDesktopAccountProps = {
  card: IqujiDesktopAccountCardProps;
  trigger?: ReactElement;
  triggerLabel: string;
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  closeOnSelect?: boolean | undefined;
};

type AccountAvatarProps = {
  avatar?: ReactNode | undefined;
  avatarLabel?: string | undefined;
  avatarTone?: "accent" | "positive" | "neutral" | undefined;
  size: "sm" | "md";
};

function AccountAvatar({
  avatar,
  avatarLabel,
  avatarTone = "accent",
  size,
}: AccountAvatarProps) {
  return (
    <span
      className={
        size === "sm"
          ? "iquji-desktop-account__trigger-avatar"
          : "iquji-desktop-account-card__avatar"
      }
      data-tone={avatarTone}
    >
      {avatar ??
        avatarLabel ??
        (size === "sm" ? (
          <IqujiIcon decorative name="user" size={16} />
        ) : (
          <IqujiIcon decorative name="user" size={20} />
        ))}
    </span>
  );
}

export function IqujiDesktopAccountCard({
  name,
  secondary,
  badge,
  avatar,
  avatarLabel,
  avatarTone,
  usage,
  sections,
  footer,
  onItemSelect,
  className,
}: IqujiDesktopAccountCardProps) {
  const usageLabelId = useId();
  const usageValue =
    usage && Number.isFinite(usage.value)
      ? Math.min(Math.max(usage.value, 0), 100)
      : 0;

  return (
    <div className={classNames("iquji-desktop-account-card", className)}>
      <div className="iquji-desktop-account-card__header">
        <AccountAvatar
          avatar={avatar}
          avatarLabel={avatarLabel}
          avatarTone={avatarTone}
          size="md"
        />
        <div className="iquji-desktop-account-card__identity">
          <span className="iquji-desktop-account-card__name">{name}</span>
          {secondary ? (
            <span className="iquji-desktop-account-card__secondary">
              {secondary}
            </span>
          ) : null}
          {badge ? (
            <span className="iquji-desktop-account-card__badge">{badge}</span>
          ) : null}
        </div>
      </div>

      {usage ? (
        <div className="iquji-desktop-account-card__usage">
          <div className="iquji-desktop-account-card__usage-copy">
            <span id={usageLabelId}>{usage.label}</span>
            {usage.valueText ? <span>{usage.valueText}</span> : null}
          </div>
          <div
            aria-labelledby={usageLabelId}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={usageValue}
            className="iquji-desktop-account-card__meter"
            data-tone={usage.tone ?? "accent"}
            role="progressbar"
          >
            <span
              className="iquji-desktop-account-card__meter-fill"
              style={{ width: `${usageValue}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="iquji-desktop-account-card__sections">
        {sections.map((section) => (
          <div className="iquji-desktop-account-card__section" key={section.key}>
            {section.items.map((item) => (
              <button
                aria-keyshortcuts={item.keyshortcuts}
                className="iquji-desktop-account-card__item"
                data-tone={item.tone ?? "neutral"}
                disabled={item.disabled}
                key={item.key}
                onClick={() => {
                  item.onSelect?.();
                  onItemSelect?.(item);
                }}
                type="button"
              >
                {item.icon ? (
                  <span
                    aria-hidden="true"
                    className="iquji-desktop-account-card__item-icon"
                  >
                    {item.icon}
                  </span>
                ) : null}
                <span className="iquji-desktop-account-card__item-label">
                  {item.label}
                </span>
                {item.shortcut ? (
                  <span
                    aria-hidden="true"
                    className="iquji-desktop-account-card__item-shortcut"
                  >
                    {item.shortcut}
                  </span>
                ) : null}
                {item.trailing ? (
                  <span
                    aria-hidden="true"
                    className="iquji-desktop-account-card__item-trailing"
                  >
                    {item.trailing}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </div>

      {footer ? (
        <div className="iquji-desktop-account-card__footer">{footer}</div>
      ) : null}
    </div>
  );
}

export function IqujiDesktopAccount({
  card,
  trigger,
  triggerLabel,
  open,
  onOpenChange,
  closeOnSelect = true,
}: IqujiDesktopAccountProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const actualOpen = open ?? internalOpen;

  const changeOpen = (next: boolean) => {
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const triggerElement =
    trigger ?? (
      <button
        aria-label={triggerLabel}
        className="iquji-desktop-account__trigger"
        type="button"
      >
        <AccountAvatar
          avatar={card.avatar}
          avatarLabel={card.avatarLabel}
          avatarTone={card.avatarTone}
          size="sm"
        />
      </button>
    );

  return (
    <IqujiPopover
      align="start"
      onOpenChange={changeOpen}
      open={actualOpen}
      side="top"
      trigger={triggerElement}
    >
      <IqujiDesktopAccountCard
        {...card}
        onItemSelect={(item) => {
          card.onItemSelect?.(item);
          if (closeOnSelect) {
            changeOpen(false);
          }
        }}
      />
    </IqujiPopover>
  );
}
