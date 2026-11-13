import { IqujiButton, IqujiPageHeader } from "@iquji-web/web-component";
import { useIqujiLocale } from "@iquji-web/web-i18n";
import { IqujiIcon } from "@iquji-web/web-icons";
import { useMemo, useState } from "react";
import { CATEGORIES } from "./catalog";
import { Overview } from "./components/Overview";
import { TopBar } from "./components/TopBar";
import {
  CATEGORY_METADATA,
  COMPONENT_I18N,
  type PreviewMessageKey,
} from "./i18n/locales";
import { componentPreviews } from "./previews";

export function App() {
  const { locale, translate } = useIqujiLocale<PreviewMessageKey>();
  const [activeId, setActiveId] = useState<string>("overview");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEn = locale === "en-US";
  const normalizedQuery = query.trim().toLocaleLowerCase();

  // Search filtering
  const searchMatches = useMemo(
    () =>
      componentPreviews.filter((item) => {
        const i18nInfo = COMPONENT_I18N[item.id];
        const localizedName = isEn && i18nInfo ? i18nInfo.nameEn : item.name;
        const localizedDesc =
          isEn && i18nInfo ? i18nInfo.descEn : item.description;
        const searchable =
          `${localizedName} ${item.name} ${item.category} ${localizedDesc} ${item.description} ${item.keywords}`.toLocaleLowerCase();
        return searchable.includes(normalizedQuery);
      }),
    [normalizedQuery, isEn],
  );

  const activeIndex = componentPreviews.findIndex(
    (item) => item.id === activeId,
  );
  const activePreview =
    componentPreviews.find((item) => item.id === activeId) ??
    componentPreviews[0];

  const prevPreview =
    activeIndex > 0 ? componentPreviews[activeIndex - 1] : undefined;
  const nextPreview =
    activeIndex >= 0 && activeIndex < componentPreviews.length - 1
      ? componentPreviews[activeIndex + 1]
      : undefined;

  const grouped = CATEGORIES.map((category) => {
    const meta = CATEGORY_METADATA[category];
    return {
      category,
      meta,
      items: searchMatches.filter((item) => item.category === category),
    };
  }).filter((group) => group.items.length > 0);

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    const first = searchMatches.find(
      (item) => category === "全部" || item.category === category,
    );
    if (first) {
      setActiveId(first.id);
    }
  };

  const handleSelectComponent = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    // Scroll to top
    const mainEl = document.querySelector(".catalog-content");
    if (mainEl) mainEl.scrollTop = 0;
  };

  const isOverview = activeId === "overview";

  return (
    <div className="catalog-shell">
      {/* Top Navigation Bar */}
      <TopBar
        isOverview={isOverview}
        onNavigateComponents={() =>
          handleSelectComponent(componentPreviews[0]?.id ?? "button")
        }
        onNavigateOverview={() => handleSelectComponent("overview")}
        onQueryChange={(q) => {
          setQuery(q);
          if (isOverview && q.trim()) {
            setActiveId(componentPreviews[0]?.id ?? "button");
          }
        }}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        query={query}
      />

      <div className="catalog-body">
        {/* Responsive Sidebar */}
        <aside
          aria-label={translate("sidebar.categories")}
          className={`catalog-sidebar ${sidebarOpen ? "is-open" : ""}`}
        >
          <nav aria-label="Component Navigation" className="catalog-navigation">
            {/* Overview Link */}
            <div className="catalog-nav-pinned">
              <IqujiButton
                aria-current={isOverview ? "page" : undefined}
                className={`catalog-item catalog-item--overview ${
                  isOverview ? "is-active" : ""
                }`}
                onClick={() => handleSelectComponent("overview")}
                variant="ghost"
              >
                <IqujiIcon decorative name="layout-dashboard" size={16} />
                <span>{translate("sidebar.overview")}</span>
                <span className="catalog-count">
                  {componentPreviews.length}
                </span>
              </IqujiButton>
            </div>

            <div className="catalog-nav-divider" />

            {/* All Capabilities Button */}
            <IqujiButton
              aria-current={
                !isOverview && activeCategory === "全部" ? "page" : undefined
              }
              className={`catalog-category ${
                !isOverview && activeCategory === "全部" ? "is-active" : ""
              }`}
              onClick={() => selectCategory("全部")}
              variant="ghost"
            >
              <IqujiIcon decorative name="boxes" size={15} />
              <span>{translate("sidebar.all")}</span>
              <span className="catalog-count">{searchMatches.length}</span>
            </IqujiButton>

            {/* Category Groups */}
            {grouped.map((group) => {
              const categoryTitle = isEn
                ? group.meta.nameEn
                : group.meta.nameZh;

              return (
                <section className="catalog-group" key={group.category}>
                  <IqujiButton
                    aria-current={
                      !isOverview && activeCategory === group.category
                        ? "page"
                        : undefined
                    }
                    className={`catalog-category ${
                      !isOverview && activeCategory === group.category
                        ? "is-active"
                        : ""
                    }`}
                    onClick={() => selectCategory(group.category)}
                    variant="ghost"
                  >
                    <div className="catalog-category__title">
                      <IqujiIcon
                        decorative
                        name={group.meta.iconName}
                        size={15}
                      />
                      <span>{categoryTitle}</span>
                    </div>
                    <span className="catalog-count">{group.items.length}</span>
                  </IqujiButton>

                  <div className="catalog-group-items">
                    {group.items.map((item) => {
                      const i18nInfo = COMPONENT_I18N[item.id];
                      const itemName =
                        isEn && i18nInfo ? i18nInfo.nameEn : item.name;
                      const isItemActive =
                        !isOverview && activePreview?.id === item.id;

                      return (
                        <IqujiButton
                          aria-current={isItemActive ? "page" : undefined}
                          className={`catalog-item ${
                            isItemActive ? "is-active" : ""
                          }`}
                          key={item.id}
                          onClick={() => handleSelectComponent(item.id)}
                          variant="ghost"
                        >
                          <span className="catalog-item__bullet" />
                          <span>{itemName}</span>
                        </IqujiButton>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </nav>

          <div className="catalog-sidebar__footer">
            <span>
              {translate("sidebar.footer.count", {
                count: componentPreviews.length,
              })}
            </span>
            <span className="catalog-footer-tag">v0.1.0</span>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <button
            type="button"
            className="catalog-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation sidebar"
          />
        )}

        {/* Main Content Area */}
        <main className="catalog-main" id="top">
          <div className="catalog-content">
            {isOverview ? (
              <Overview
                onSelectComponent={handleSelectComponent}
                previews={componentPreviews}
              />
            ) : activePreview ? (
              <div className="catalog-detail-container">
                {/* Top Action Bar */}
                <div className="catalog-detail-top">
                  <IqujiButton
                    className="catalog-back-btn"
                    onClick={() => handleSelectComponent("overview")}
                    variant="secondary"
                  >
                    <IqujiIcon decorative name="arrow-left" size={14} />
                    <span>{translate("detail.back")}</span>
                  </IqujiButton>

                  <div className="catalog-detail-breadcrumbs">
                    <span className="crumb-root">Iquji Web</span>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-category">
                      {isEn
                        ? CATEGORY_METADATA[activePreview.category]?.nameEn
                        : CATEGORY_METADATA[activePreview.category]?.nameZh}
                    </span>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-current">
                      {isEn && COMPONENT_I18N[activePreview.id]
                        ? COMPONENT_I18N[activePreview.id]?.nameEn
                        : activePreview.name}
                    </span>
                  </div>
                </div>

                {/* Header */}
                <IqujiPageHeader
                  actions={
                    <div className="catalog-detail-tags">
                      <span className="catalog-package-tag">
                        <code>
                          {activePreview.packageName ??
                            (activePreview.packageId
                              ? `@iquji-web/web-${activePreview.packageId}`
                              : "@iquji-web/web-component")}
                        </code>
                      </span>
                      <span className="catalog-category-tag">
                        {isEn
                          ? CATEGORY_METADATA[activePreview.category]?.nameEn
                          : CATEGORY_METADATA[activePreview.category]?.nameZh}
                      </span>
                    </div>
                  }
                  description={
                    isEn && COMPONENT_I18N[activePreview.id]
                      ? COMPONENT_I18N[activePreview.id]?.descEn
                      : activePreview.description
                  }
                  eyebrow={translate("brand.subtitle")}
                  title={
                    isEn && COMPONENT_I18N[activePreview.id]
                      ? COMPONENT_I18N[activePreview.id]?.nameEn
                      : activePreview.name
                  }
                />

                {/* Interactive Preview Sandbox */}
                <section
                  aria-label={`${activePreview.name} 交互预览`}
                  className="catalog-preview"
                  key={activePreview.id}
                >
                  <div className="catalog-preview-stage-inner">
                    {activePreview.render()}
                  </div>
                </section>

                {/* Footer Navigation (Prev / Next) */}
                <footer className="catalog-detail-footer">
                  {prevPreview ? (
                    <IqujiButton
                      className="catalog-nav-prev"
                      onClick={() => handleSelectComponent(prevPreview.id)}
                      variant="secondary"
                    >
                      <IqujiIcon decorative name="chevron-left" size={16} />
                      <div className="catalog-nav-btn-text">
                        <span className="nav-sub">
                          {translate("detail.prev")}
                        </span>
                        <span className="nav-title">
                          {isEn && COMPONENT_I18N[prevPreview.id]
                            ? COMPONENT_I18N[prevPreview.id]?.nameEn
                            : prevPreview.name}
                        </span>
                      </div>
                    </IqujiButton>
                  ) : (
                    <div />
                  )}

                  {nextPreview ? (
                    <IqujiButton
                      className="catalog-nav-next"
                      onClick={() => handleSelectComponent(nextPreview.id)}
                      variant="secondary"
                    >
                      <div className="catalog-nav-btn-text">
                        <span className="nav-sub">
                          {translate("detail.next")}
                        </span>
                        <span className="nav-title">
                          {isEn && COMPONENT_I18N[nextPreview.id]
                            ? COMPONENT_I18N[nextPreview.id]?.nameEn
                            : nextPreview.name}
                        </span>
                      </div>
                      <IqujiIcon decorative name="chevron-right" size={16} />
                    </IqujiButton>
                  ) : (
                    <div />
                  )}
                </footer>
              </div>
            ) : (
              <section aria-live="polite" className="catalog-empty">
                <IqujiIcon decorative name="file-search" size={32} />
                <h1>{translate("detail.empty.title")}</h1>
                <p>{translate("detail.empty.desc")}</p>
                <IqujiButton
                  onClick={() => {
                    setQuery("");
                    setActiveCategory("全部");
                    setActiveId("overview");
                  }}
                  variant="secondary"
                >
                  {translate("detail.empty.clear")}
                </IqujiButton>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
