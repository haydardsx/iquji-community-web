import { IqujiButton } from "@iquji-web/web-component";
import { useIqujiLocale } from "@iquji-web/web-i18n";
import { IqujiIcon } from "@iquji-web/web-icons";
import { useState } from "react";
import { CATEGORIES, type ComponentPreview } from "../catalog";
import {
  CATEGORY_METADATA,
  COMPONENT_I18N,
  type PreviewMessageKey,
} from "../i18n/locales";
import { MiniVisual } from "./MiniVisual";

export type OverviewProps = {
  previews: readonly ComponentPreview[];
  onSelectComponent: (id: string) => void;
};

export function Overview({ previews, onSelectComponent }: OverviewProps) {
  const { locale, translate } = useIqujiLocale<PreviewMessageKey>();
  const [selectedCategory, setSelectedCategory] = useState<string>("全部");

  const isEn = locale === "en-US";

  // Group previews by category
  const groups = CATEGORIES.map((category) => {
    const meta = CATEGORY_METADATA[category];
    const items = previews.filter((p) => p.category === category);
    return {
      category,
      meta,
      items,
    };
  }).filter((g) => g.items.length > 0);

  const displayedGroups =
    selectedCategory === "全部"
      ? groups
      : groups.filter((g) => g.category === selectedCategory);

  return (
    <div className="overview-page">
      {/* Hero Banner */}
      <section className="overview-hero">
        <div className="overview-hero__badge">
          <IqujiIcon decorative name="sparkles" size={14} />
          <span>Community Web Components</span>
        </div>
        <h1 className="overview-hero__title">
          {translate("overview.hero.title")}
        </h1>
        <p className="overview-hero__subtitle">
          {translate("overview.hero.subtitle")}
        </p>

        {/* Stats Row */}
        <div className="overview-stats">
          <div className="overview-stat-card">
            <span className="overview-stat-card__value">
              {previews.length}+
            </span>
            <span className="overview-stat-card__label">
              {translate("overview.stat.components")}
            </span>
          </div>
          <div className="overview-stat-card">
            <span className="overview-stat-card__value">8</span>
            <span className="overview-stat-card__label">
              {translate("overview.stat.packages")}
            </span>
          </div>
          <div className="overview-stat-card">
            <span className="overview-stat-card__value">100%</span>
            <span className="overview-stat-card__label">
              {translate("overview.stat.coverage")}
            </span>
          </div>
          <div className="overview-stat-card">
            <span className="overview-stat-card__value">MIT</span>
            <span className="overview-stat-card__label">
              {translate("overview.stat.license")}
            </span>
          </div>
        </div>
      </section>

      {/* Category Filter Pills */}
      <nav aria-label="Category Filter" className="overview-filters">
        <IqujiButton
          aria-current={selectedCategory === "全部" ? "page" : undefined}
          className={`overview-filter-pill ${
            selectedCategory === "全部" ? "is-active" : ""
          }`}
          onClick={() => setSelectedCategory("全部")}
          variant="ghost"
        >
          <span>{translate("overview.filter.all")}</span>
          <span className="overview-pill-count">{previews.length}</span>
        </IqujiButton>

        {groups.map(({ category, meta, items }) => {
          const categoryName = isEn ? meta.nameEn : meta.nameZh;
          const isActive = selectedCategory === category;
          return (
            <IqujiButton
              aria-current={isActive ? "page" : undefined}
              className={`overview-filter-pill ${isActive ? "is-active" : ""}`}
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant="ghost"
            >
              <IqujiIcon decorative name={meta.iconName} size={14} />
              <span>{categoryName}</span>
              <span className="overview-pill-count">{items.length}</span>
            </IqujiButton>
          );
        })}
      </nav>

      {/* Component Sections & Cards Grid */}
      <div className="overview-content">
        {displayedGroups.map(({ category, meta, items }) => {
          const categoryName = isEn ? meta.nameEn : meta.nameZh;
          const categoryDesc = isEn ? meta.descEn : meta.descZh;

          return (
            <section
              className="overview-section"
              id={`cat-${category}`}
              key={category}
            >
              <header className="overview-section__header">
                <div className="overview-section__title-group">
                  <div className="overview-section__icon">
                    <IqujiIcon decorative name={meta.iconName} size={20} />
                  </div>
                  <div>
                    <h2 className="overview-section__title">
                      {categoryName}
                      <span className="overview-section__count">
                        {items.length}
                      </span>
                    </h2>
                    <p className="overview-section__desc">{categoryDesc}</p>
                  </div>
                </div>
              </header>

              <div className="overview-grid">
                {items.map((item) => {
                  const i18nInfo = COMPONENT_I18N[item.id];
                  const title = isEn && i18nInfo ? i18nInfo.nameEn : item.name;
                  const description =
                    isEn && i18nInfo ? i18nInfo.descEn : item.description;
                  const packageName =
                    item.packageName ??
                    (item.packageId
                      ? `@iquji-web/web-${item.packageId}`
                      : "@iquji-web/web-component");

                  return (
                    <button
                      type="button"
                      className="heroui-card"
                      key={item.id}
                      onClick={() => onSelectComponent(item.id)}
                    >
                      {/* Card Header */}
                      <div className="heroui-card__header">
                        <div className="heroui-card__meta">
                          <h3 className="heroui-card__title">{title}</h3>
                          <span className="heroui-card__package">
                            <code>
                              {packageName.replace("@iquji-web/", "")}
                            </code>
                          </span>
                        </div>
                        <span className="heroui-card__category-badge">
                          {categoryName}
                        </span>
                      </div>

                      {/* Card Miniature Preview */}
                      <div className="heroui-card__body">
                        <MiniVisual id={item.id} />
                      </div>

                      {/* Card Footer */}
                      <div className="heroui-card__footer">
                        <p className="heroui-card__desc">{description}</p>
                        <span className="heroui-card__arrow">
                          <IqujiIcon decorative name="arrow-right" size={14} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
