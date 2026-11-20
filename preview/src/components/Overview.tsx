import { IqujiButton } from "@iquji-community/web-component";
import { useIqujiLocale } from "@iquji-community/web-i18n";
import { IqujiIcon } from "@iquji-community/web-icons";
import { useState } from "react";
import {
  CATEGORIES,
  type ComponentCategory,
  type ComponentPreview,
  type ComponentPreviewId,
} from "../catalog";
import { getPreviewText } from "../i18n/catalog-text";
import { CATEGORY_METADATA, type PreviewMessageKey } from "../i18n/locales";
import { MiniVisual } from "./MiniVisual";

export type OverviewProps = {
  previews: readonly ComponentPreview[];
  onSelectComponent: (id: ComponentPreviewId) => void;
};

export function Overview({ previews, onSelectComponent }: OverviewProps) {
  const { locale, translate } = useIqujiLocale<PreviewMessageKey>();
  const [selectedCategory, setSelectedCategory] = useState<
    ComponentCategory | "all"
  >("all");

  const isEn = locale === "en-US";

  // 按分类汇总能力。
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
    selectedCategory === "all"
      ? groups
      : groups.filter((g) => g.category === selectedCategory);

  return (
    <div className="overview-page">
      {/* 总览标题 */}
      <section className="overview-hero">
        <div className="overview-hero__badge">
          <IqujiIcon decorative name="sparkles" size={14} />
          <span>{translate("brand.subtitle")}</span>
        </div>
        <h1 className="overview-hero__title">
          {translate("overview.hero.title")}
        </h1>
        <p className="overview-hero__subtitle">
          {translate("overview.hero.subtitle")}
        </p>

        {/* 统计信息 */}
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
            <span className="overview-stat-card__value">MIT</span>
            <span className="overview-stat-card__label">
              {translate("overview.stat.license")}
            </span>
          </div>
        </div>
      </section>

      {/* 分类筛选 */}
      <nav
        aria-label={translate("overview.filter.label")}
        className="overview-filters"
      >
        <IqujiButton
          aria-current={selectedCategory === "all" ? "page" : undefined}
          className={`overview-filter-pill ${
            selectedCategory === "all" ? "is-active" : ""
          }`}
          onClick={() => setSelectedCategory("all")}
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

      {/* 分类和能力卡片 */}
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
                  const { name: title, description } = getPreviewText(
                    item,
                    locale,
                  );
                  const packageName =
                    item.packageName ??
                    (item.packageId
                      ? `@iquji-community/web-${item.packageId}`
                      : "@iquji-community/web-component");

                  return (
                    <button
                      type="button"
                      className="catalog-card"
                      key={item.id}
                      onClick={() => onSelectComponent(item.id)}
                    >
                      {/* 能力名称和分类 */}
                      <div className="catalog-card__header">
                        <div className="catalog-card__meta">
                          <h3 className="catalog-card__title">{title}</h3>
                          <span className="catalog-card__package">
                            <code>
                              {packageName.replace("@iquji-community/", "")}
                            </code>
                          </span>
                        </div>
                        <span className="catalog-card__category-badge">
                          {categoryName}
                        </span>
                      </div>

                      {/* 缩略预览 */}
                      <div aria-hidden="true" className="catalog-card__body">
                        <MiniVisual id={item.id} />
                      </div>

                      {/* 能力说明 */}
                      <div className="catalog-card__footer">
                        <p className="catalog-card__desc">{description}</p>
                        <span className="catalog-card__arrow">
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
