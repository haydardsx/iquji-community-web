import {
  type HTMLAttributes,
  type ReactNode,
  useId,
} from "react";
import { classNames } from "./utils.js";

export type IqujiSettingsLayoutProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  navigation: ReactNode;
  children: ReactNode;
  navigationClassName?: string | undefined;
  contentClassName?: string | undefined;
};

export function IqujiSettingsLayout({
  navigation,
  children,
  className,
  navigationClassName,
  contentClassName,
  ...divProps
}: IqujiSettingsLayoutProps) {
  return (
    <div className={classNames("iquji-settings", className)} {...divProps}>
      <div
        className={classNames(
          "iquji-settings__navigation",
          navigationClassName,
        )}
      >
        {navigation}
      </div>
      <div className={classNames("iquji-settings__content", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

export type IqujiSettingsContentProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "title"
> & {
  title: ReactNode;
  titleId?: string | undefined;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function IqujiSettingsContent({
  actions,
  children,
  className,
  description,
  title,
  titleId,
  ...sectionProps
}: IqujiSettingsContentProps) {
  const generatedId = useId();
  const headingId = titleId ?? `${generatedId}-title`;
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("iquji-settings-content", className)}
      {...sectionProps}
    >
      <header className="iquji-settings-content__header">
        <div>
          <h1 id={headingId} tabIndex={-1}>
            {title}
          </h1>
          {description ? (
            <p className="iquji-settings-content__description">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="iquji-settings-content__actions">{actions}</div>
        ) : null}
      </header>
      <div className="iquji-settings-content__body">{children}</div>
    </section>
  );
}

export type IqujiSettingsSectionProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "title"
> & {
  title: ReactNode;
  titleId?: string | undefined;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function IqujiSettingsSection({
  actions,
  children,
  className,
  description,
  title,
  titleId,
  ...sectionProps
}: IqujiSettingsSectionProps) {
  const generatedId = useId();
  const headingId = titleId ?? `${generatedId}-title`;
  return (
    <section
      aria-labelledby={headingId}
      className={classNames("iquji-settings-section", className)}
      {...sectionProps}
    >
      <header className="iquji-settings-section__header">
        <div>
          <h2 id={headingId}>{title}</h2>
          {description ? (
            <p className="iquji-settings-section__description">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="iquji-settings-section__actions">{actions}</div>
        ) : null}
      </header>
      <div className="iquji-settings-section__rows">{children}</div>
    </section>
  );
}
