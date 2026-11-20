import {
  IconButton,
  IqujiButton,
  IqujiInput,
} from "@iquji-community/web-component";
import { useIqujiLocale } from "@iquji-community/web-i18n";
import { IqujiIcon } from "@iquji-community/web-icons";
import { useIqujiTheme } from "@iquji-community/web-theme";
import type { PreviewMessageKey } from "../i18n/locales";

export type TopBarProps = {
  isOverview: boolean;
  onNavigateOverview: () => void;
  onNavigateComponents: () => void;
  query: string;
  onQueryChange: (query: string) => void;
  onToggleSidebar?: () => void;
};

export function TopBar({
  isOverview,
  onNavigateOverview,
  onNavigateComponents,
  query,
  onQueryChange,
  onToggleSidebar,
}: TopBarProps) {
  const { locale, setLocale, translate } = useIqujiLocale<PreviewMessageKey>();
  const { resolvedTheme, setMode } = useIqujiTheme();

  const toggleLanguage = () => {
    setLocale(locale === "zh-CN" ? "en-US" : "zh-CN");
  };

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setMode(nextTheme);
  };

  return (
    <header className="iquji-topbar">
      <div className="iquji-topbar__left">
        {onToggleSidebar && (
          <button
            type="button"
            className="iquji-topbar__mobile-menu"
            onClick={onToggleSidebar}
            aria-label={translate("nav.toggle")}
          >
            <IqujiIcon decorative name="menu" size={20} />
          </button>
        )}
        <button
          type="button"
          className="iquji-topbar__brand"
          onClick={onNavigateOverview}
        >
          <span aria-hidden="true" className="iquji-topbar__brand-mark">
            I
          </span>
          <span className="iquji-topbar__brand-title">
            {translate("brand.title")}
          </span>
          <span className="iquji-topbar__brand-badge">
            {translate("brand.community")}
          </span>
        </button>

        <nav aria-label={translate("nav.label")} className="iquji-topbar__nav">
          <IqujiButton
            aria-current={isOverview ? "page" : undefined}
            className={`iquji-topbar__nav-link ${
              isOverview ? "is-active" : ""
            }`}
            onClick={onNavigateOverview}
            variant="ghost"
          >
            <IqujiIcon decorative name="layout-dashboard" size={16} />
            <span>{translate("nav.overview")}</span>
          </IqujiButton>

          <IqujiButton
            aria-current={!isOverview ? "page" : undefined}
            className={`iquji-topbar__nav-link ${
              !isOverview ? "is-active" : ""
            }`}
            onClick={onNavigateComponents}
            variant="ghost"
          >
            <IqujiIcon decorative name="boxes" size={16} />
            <span>{translate("nav.components")}</span>
          </IqujiButton>
        </nav>
      </div>

      <div className="iquji-topbar__center">
        <div className="iquji-topbar__search">
          <IqujiIcon decorative name="search" size={15} />
          <IqujiInput
            autoComplete="off"
            id="topbar-search"
            onChange={(e) => onQueryChange(e.currentTarget.value)}
            placeholder={translate("search.placeholder")}
            value={query}
          />
          {query ? (
            <IconButton
              compact
              icon={<IqujiIcon decorative name="close" size={14} />}
              label={translate("search.clear")}
              onClick={() => onQueryChange("")}
            />
          ) : (
            <kbd className="iquji-topbar__shortcut">⌘K</kbd>
          )}
        </div>
      </div>

      <div className="iquji-topbar__right">
        {/* 中英文切换 */}
        <IqujiButton
          className="iquji-topbar__tool-btn iquji-topbar__lang-btn"
          onClick={toggleLanguage}
          title={translate("lang.toggle")}
          variant="secondary"
        >
          <IqujiIcon decorative name="languages" size={16} />
          <span className="iquji-topbar__lang-text">
            {locale === "zh-CN" ? "EN" : "中文"}
          </span>
        </IqujiButton>

        {/* 白天夜间模式切换 */}
        <IconButton
          className="iquji-topbar__tool-btn"
          icon={
            <IqujiIcon
              decorative
              name={resolvedTheme === "dark" ? "sun" : "moon"}
              size={18}
            />
          }
          label={
            resolvedTheme === "dark"
              ? translate("theme.light")
              : translate("theme.dark")
          }
          onClick={toggleTheme}
          variant="secondary"
        />

        {/* GitHub 仓库外部链接 */}
        <a
          aria-label={translate("nav.docs")}
          className="iquji-topbar__icon-link"
          href="https://github.com/haydardsx/iquji-community-web"
          rel="noopener noreferrer"
          target="_blank"
          title={translate("nav.docs")}
        >
          <IqujiIcon decorative name="code" size={18} />
        </a>
      </div>
    </header>
  );
}
