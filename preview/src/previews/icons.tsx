import { IqujiButton, IqujiInput } from "@iquji-community/web-component";
import { IqujiIcon, type IqujiIconName } from "@iquji-community/web-icons";
import { useMemo, useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

const ICON_NAMES: readonly IqujiIconName[] = [
  "message-circle",
  "activity",
  "arrow-down",
  "arrow-down-up",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "bell",
  "bold",
  "book-open",
  "building",
  "calendar",
  "check",
  "check-circle",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevrons-left",
  "chevrons-right",
  "circle-alert",
  "circle-help",
  "circle-info",
  "clipboard",
  "clock",
  "code",
  "copy",
  "crown",
  "download",
  "external-link",
  "eye",
  "eye-off",
  "file-search",
  "filter",
  "folder",
  "globe",
  "home",
  "italic",
  "languages",
  "link",
  "loader",
  "list-bulleted",
  "list-details",
  "list-ordered",
  "lock",
  "log-in",
  "log-out",
  "maximize",
  "menu",
  "minimize",
  "minus",
  "monitor",
  "moon",
  "panel-bottom",
  "panel-left",
  "panel-right",
  "more",
  "pencil",
  "plus",
  "qr-code",
  "redo",
  "refresh",
  "search",
  "settings",
  "shield",
  "shield-x",
  "sparkles",
  "sun",
  "terminal",
  "trash",
  "undo",
  "upload",
  "user",
  "users",
  "wallet",
  "close",
  "x-circle",
  "boxes",
  "calendar-days",
  "container",
  "eraser",
  "hard-drive",
  "hard-drive-download",
  "key-round",
  "layout-dashboard",
  "list-tree",
  "network",
  "panel-left-close",
  "panel-left-open",
  "play",
  "radar",
  "rocket",
  "rotate-ccw",
  "server",
  "server-cog",
  "shield-alert",
  "sliders-horizontal",
  "square",
  "wrench",
];

function IconDemo() {
  const text = usePreviewText();
  const [search, setSearch] = useState("");
  const [iconSize, setIconSize] = useState<number>(24);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const filteredIcons = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return ICON_NAMES;
    return ICON_NAMES.filter((name) => name.toLowerCase().includes(query));
  }, [search]);

  const handleCopy = (name: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(name);
    }
    setCopiedName(name);
    setTimeout(() => {
      setCopiedName((current) => (current === name ? null : current));
    }, 1500);
  };

  return (
    <div className="catalog-icons-view">
      <div className="catalog-icons-toolbar">
        <div className="catalog-icons-search-wrapper">
          <IqujiInput
            className="catalog-icons-search-input"
            onChange={(e) => setSearch(e.target.value)}
            placeholder={text("搜索图标名称…", "Search icon names…")}
            value={search}
          />
          {search ? (
            <button
              aria-label={text("清空搜索", "Clear search")}
              className="catalog-icons-clear-btn"
              onClick={() => setSearch("")}
              type="button"
            >
              <IqujiIcon decorative name="close" size={14} />
            </button>
          ) : null}
        </div>

        <div className="catalog-icons-controls">
          <span className="catalog-icons-count">
            {search
              ? text(
                  `匹配 ${filteredIcons.length} / ${ICON_NAMES.length} 个图标`,
                  `${filteredIcons.length} of ${ICON_NAMES.length} icons`,
                )
              : text(
                  `共 ${ICON_NAMES.length} 个图标`,
                  `${ICON_NAMES.length} icons`,
                )}
          </span>
          <div className="catalog-icons-size-toggle">
            {[18, 24, 32].map((size) => (
              <button
                className={`catalog-icons-size-btn ${iconSize === size ? "is-active" : ""}`}
                key={size}
                onClick={() => setIconSize(size)}
                type="button"
              >
                {size}px
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredIcons.length === 0 ? (
        <div className="catalog-icons-empty">
          <IqujiIcon decorative name="circle-help" size={32} />
          <p>
            {text(
              `未找到与「${search}」匹配的图标`,
              `No icons match “${search}”`,
            )}
          </p>
          <IqujiButton
            compact
            onClick={() => setSearch("")}
            variant="secondary"
          >
            {text("清空搜索", "Clear search")}
          </IqujiButton>
        </div>
      ) : (
        <div className="catalog-icon-grid">
          {filteredIcons.map((name) => {
            const isCopied = copiedName === name;
            return (
              <button
                aria-label={text(
                  `复制图标名称 ${name}`,
                  `Copy icon name ${name}`,
                )}
                className={`catalog-icon-cell ${isCopied ? "is-copied" : ""}`}
                key={name}
                onClick={() => handleCopy(name)}
                title={text("复制图标名称", "Copy icon name")}
                type="button"
              >
                <div className="catalog-icon-cell__preview">
                  <IqujiIcon
                    decorative={false}
                    label={name}
                    name={name}
                    size={iconSize}
                  />
                </div>
                <span className="catalog-icon-cell__name">{name}</span>
                {isCopied ? (
                  <span className="catalog-icon-cell__copied-tag">
                    {" "}
                    {text("已复制", "Copied")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const iconPreviews: readonly ComponentPreview[] = [
  {
    id: "icons-gallery",
    name: "图标与可访问性",
    packageId: "icons",
    packageName: "@iquji-community/web-icons",
    category: "图标",
    description: "展示统一图标名称、尺寸和非装饰图标的可访问标签。",
    keywords: "icons svg aria label accessibility",
    render: () => <IconDemo />,
  },
];
