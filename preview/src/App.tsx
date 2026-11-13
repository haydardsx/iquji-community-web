import {
  IconButton,
  IqujiButton,
  IqujiInput,
  IqujiPageHeader,
} from "@iquji-cloud/web-component";
import { IqujiIcon } from "@iquji-cloud/web-icons";
import { useMemo, useState } from "react";
import { CATEGORIES } from "./catalog";
import { componentPreviews } from "./previews";

export function App() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [activeId, setActiveId] = useState("button");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const searchMatches = useMemo(
    () =>
      componentPreviews.filter((item) => {
        const searchable =
          `${item.name} ${item.category} ${item.description} ${item.keywords}`.toLocaleLowerCase();
        return searchable.includes(normalizedQuery);
      }),
    [normalizedQuery],
  );
  const filtered = searchMatches.filter(
    (item) => activeCategory === "全部" || item.category === activeCategory,
  );
  const activePreview =
    filtered.find((item) => item.id === activeId) ?? filtered[0];
  const grouped = CATEGORIES.map((category) => ({
    category,
    items: searchMatches.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    const first = searchMatches.find(
      (item) => category === "全部" || item.category === category,
    );
    if (first) setActiveId(first.id);
  };

  return (
    <div className="catalog-shell">
      <aside aria-label="Community 能力目录" className="catalog-sidebar">
        <a className="catalog-brand" href="#top">
          <span aria-hidden="true" className="catalog-brand__mark">
            I
          </span>
          <span>Iquji Web</span>
          <span className="catalog-brand__subtle">Community 预览</span>
        </a>
        <div className="catalog-sidebar__search">
          <label className="catalog-visually-hidden" htmlFor="component-search">
            搜索能力
          </label>
          <IqujiIcon decorative name="search" size={16} />
          <IqujiInput
            autoComplete="off"
            id="component-search"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
              setActiveCategory("全部");
            }}
            placeholder="搜索能力"
            value={query}
          />
          {query ? (
            <IconButton
              compact
              icon={<IqujiIcon decorative name="close" size={15} />}
              label="清空搜索"
              onClick={() => setQuery("")}
            />
          ) : null}
        </div>
        <nav aria-label="Community 能力分类" className="catalog-navigation">
          <IqujiButton
            aria-current={activeCategory === "全部" ? "page" : undefined}
            className="catalog-category"
            onClick={() => selectCategory("全部")}
            variant="ghost"
          >
            <span>全部能力</span>
            <span className="catalog-count">{searchMatches.length}</span>
          </IqujiButton>
          {grouped.map((group) => (
            <section className="catalog-group" key={group.category}>
              <IqujiButton
                aria-current={
                  activeCategory === group.category ? "page" : undefined
                }
                className="catalog-category"
                onClick={() => selectCategory(group.category)}
                variant="ghost"
              >
                <span>{group.category}</span>
                <span className="catalog-count">{group.items.length}</span>
              </IqujiButton>
              {group.items.map((item) => (
                <IqujiButton
                  aria-current={
                    activePreview?.id === item.id ? "page" : undefined
                  }
                  className="catalog-item"
                  key={item.id}
                  onClick={() => {
                    setActiveCategory(item.category);
                    setActiveId(item.id);
                  }}
                  variant="ghost"
                >
                  <span>{item.name}</span>
                </IqujiButton>
              ))}
            </section>
          ))}
        </nav>
        <div className="catalog-sidebar__footer">
          <span>{componentPreviews.length} 个能力</span>
          <span>能力预览</span>
        </div>
      </aside>

      <main className="catalog-main" id="top">
        <header className="catalog-topbar">
          <span>Web Community 能力</span>
          <span className="catalog-topbar__package">
            <code>
              {activePreview?.packageName ?? "@iquji-cloud/web-component"}
            </code>
          </span>
        </header>
        <div className="catalog-content">
          {activePreview ? (
            <>
              <IqujiPageHeader
                actions={
                  <span className="catalog-category-tag">
                    {activePreview.category}
                  </span>
                }
                description={activePreview.description}
                eyebrow="Community 能力预览"
                title={activePreview.name}
              />
              <section
                aria-label={`${activePreview.name} 交互预览`}
                className="catalog-preview"
                key={activePreview.id}
              >
                {activePreview.render()}
              </section>
            </>
          ) : (
            <section aria-live="polite" className="catalog-empty">
              <IqujiIcon decorative name="file-search" size={24} />
              <h1>没有找到能力</h1>
              <p>试试其他关键词或切换分类。</p>
              <IqujiButton
                onClick={() => {
                  setQuery("");
                  setActiveCategory("全部");
                  setActiveId(componentPreviews[0]?.id ?? "");
                }}
                variant="secondary"
              >
                清除筛选
              </IqujiButton>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
