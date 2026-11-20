import { IqujiButton, IqujiPageHeader } from "@iquji-community/web-component";
import { useIqujiLocale } from "@iquji-community/web-i18n";
import { IqujiIcon } from "@iquji-community/web-icons";
import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIES,
  type ComponentCategory,
  type ComponentPreviewId,
} from "./catalog";
import { Overview } from "./components/Overview";
import { TopBar } from "./components/TopBar";
import { getPreviewText, matchesPreviewSearch } from "./i18n/catalog-text";
import { CATEGORY_METADATA, type PreviewMessageKey } from "./i18n/locales";
import { componentPreviews } from "./previews";

export function App() {
  const { locale, translate } = useIqujiLocale<PreviewMessageKey>();
  const [activeId, setActiveId] = useState<ComponentPreviewId | "overview">(
    "overview",
  );
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ComponentCategory | "all"
  >("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEn = locale === "en-US";
  const normalizedQuery = query.trim().toLocaleLowerCase();

  useEffect(() => {
    document.title = translate("document.title");
  }, [translate]);

  const searchMatches = useMemo(
    () =>
      normalizedQuery
        ? componentPreviews.filter((item) =>
            matchesPreviewSearch(item, normalizedQuery),
          )
        : componentPreviews,
    [normalizedQuery],
  );

  const activePreview =
    searchMatches.find((item) => item.id === activeId) ?? searchMatches[0];
  const activeText = activePreview
    ? getPreviewText(activePreview, locale)
    : undefined;
  const activeCategoryTitle = activePreview
    ? CATEGORY_METADATA[activePreview.category][isEn ? "nameEn" : "nameZh"]
    : undefined;
  const activeIndex = activePreview ? searchMatches.indexOf(activePreview) : -1;
  const prevPreview = searchMatches[activeIndex - 1];
  const nextPreview = searchMatches[activeIndex + 1];

  const grouped = CATEGORIES.map((category) => {
    const meta = CATEGORY_METADATA[category];
    return {
      category,
      meta,
      items: searchMatches.filter((item) => item.category === category),
    };
  }).filter((group) => group.items.length > 0);

  const selectCategory = (category: ComponentCategory | "all") => {
    setActiveCategory(category);
    const first = searchMatches.find(
      (item) => category === "all" || item.category === category,
    );
    if (first) {
      setActiveId(first.id);
    }
  };

  const handleSelectComponent = (id: ComponentPreviewId | "overview") => {
    if (id === "overview" || !searchMatches.some((item) => item.id === id)) {
      setQuery("");
    }
    setActiveId(id);
    setSidebarOpen(false);
    // 将主内容区滚动到顶部。
    const mainEl = document.querySelector(".catalog-content");
    if (mainEl) mainEl.scrollTop = 0;
  };

  const isOverview = activeId === "overview";

  return (
    <div className="catalog-shell">
      {/* 顶部导航 */}
      <TopBar
        isOverview={isOverview}
        onNavigateComponents={() =>
          handleSelectComponent(
            searchMatches[0]?.id ?? componentPreviews[0]?.id ?? "button",
          )
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
        {/* 响应式侧栏 */}
        <aside
          aria-label={translate("sidebar.categories")}
          className={`catalog-sidebar ${sidebarOpen ? "is-open" : ""}`}
        >
          <nav
            aria-label={translate("sidebar.navigation")}
            className="catalog-navigation"
          >
            {/* 总览入口 */}
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

            {/* 全部能力入口 */}
            <IqujiButton
              aria-current={
                !isOverview && activeCategory === "all" ? "page" : undefined
              }
              className={`catalog-category ${
                !isOverview && activeCategory === "all" ? "is-active" : ""
              }`}
              onClick={() => selectCategory("all")}
              variant="ghost"
            >
              <IqujiIcon decorative name="boxes" size={15} />
              <span>{translate("sidebar.all")}</span>
              <span className="catalog-count">{searchMatches.length}</span>
            </IqujiButton>

            {/* 分类列表 */}
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
                      const { name: itemName } = getPreviewText(item, locale);
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
          </div>
        </aside>

        {/* 移动端侧栏遮罩 */}
        {sidebarOpen && (
          <button
            type="button"
            className="catalog-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-label={translate("sidebar.close")}
          />
        )}

        {/* 主内容区 */}
        <main className="catalog-main" id="top">
          <div className="catalog-content">
            {isOverview ? (
              <Overview
                onSelectComponent={handleSelectComponent}
                previews={componentPreviews}
              />
            ) : activePreview && activeText ? (
              <div className="catalog-detail-container">
                {/* 顶部操作区 */}
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
                    <span className="crumb-root">
                      {translate("brand.title")}
                    </span>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-category">
                      {activeCategoryTitle}
                    </span>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-current">{activeText.name}</span>
                  </div>
                </div>

                {/* 能力标题 */}
                <IqujiPageHeader
                  actions={
                    <div className="catalog-detail-tags">
                      <span className="catalog-package-tag">
                        <code>
                          {activePreview.packageName ??
                            (activePreview.packageId
                              ? `@iquji-community/web-${activePreview.packageId}`
                              : "@iquji-community/web-component")}
                        </code>
                      </span>
                      <span className="catalog-category-tag">
                        {activeCategoryTitle}
                      </span>
                    </div>
                  }
                  description={activeText.description}
                  eyebrow={translate("brand.subtitle")}
                  title={activeText.name}
                />

                {/* 交互预览区 */}
                <section
                  aria-label={translate("detail.preview", {
                    name: activeText.name,
                  })}
                  className="catalog-preview"
                  key={activePreview.id}
                >
                  <div className="catalog-preview-stage-inner">
                    {activePreview.render()}
                  </div>
                </section>

                {/* 前后条目导航 */}
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
                          {getPreviewText(prevPreview, locale).name}
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
                          {getPreviewText(nextPreview, locale).name}
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
                    setActiveCategory("all");
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
