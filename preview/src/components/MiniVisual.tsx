import { IqujiIcon } from "@iquji-web/web-icons";
export type MiniVisualProps = {
  id: string;
};

export function MiniVisual({ id }: MiniVisualProps) {
  // Render tailored miniature previews based on component ID
  switch (id) {
    case "button":
      return (
        <div className="mini-preview mini-preview--buttons">
          <span className="mini-btn mini-btn--primary">Primary</span>
          <span className="mini-btn mini-btn--secondary">Secondary</span>
          <span className="mini-btn mini-btn--danger">Danger</span>
        </div>
      );

    case "icon-button":
      return (
        <div className="mini-preview mini-preview--row">
          <span className="mini-icon-btn">
            <IqujiIcon decorative name="search" size={14} />
          </span>
          <span className="mini-icon-btn">
            <IqujiIcon decorative name="settings" size={14} />
          </span>
          <span className="mini-icon-btn">
            <IqujiIcon decorative name="bell" size={14} />
          </span>
        </div>
      );

    case "button-link":
      return (
        <div className="mini-preview mini-preview--row">
          <span className="mini-link">
            Learn more
            <IqujiIcon decorative name="arrow-right" size={12} />
          </span>
        </div>
      );

    case "status-badge":
    case "badge":
      return (
        <div className="mini-preview mini-preview--row">
          <span className="mini-badge mini-badge--success">Online</span>
          <span className="mini-badge mini-badge--warning">Pending</span>
          <span className="mini-badge mini-badge--danger">Error</span>
        </div>
      );

    case "panel":
      return (
        <div className="mini-preview mini-preview--panel">
          <div className="mini-panel__header" />
          <div className="mini-panel__body">
            <div className="mini-line mini-line--short" />
            <div className="mini-line" />
          </div>
        </div>
      );

    case "page-heading":
    case "page-header":
      return (
        <div className="mini-preview mini-preview--heading">
          <div className="mini-eyebrow" />
          <div className="mini-title" />
          <div className="mini-line mini-line--short" />
        </div>
      );

    case "empty-state":
      return (
        <div className="mini-preview mini-preview--center">
          <IqujiIcon decorative name="file-search" size={24} />
          <div className="mini-line mini-line--short" />
        </div>
      );

    case "loading-state":
      return (
        <div className="mini-preview mini-preview--center">
          <span className="mini-spinner" />
        </div>
      );

    case "input":
      return (
        <div className="mini-preview mini-preview--input">
          <IqujiIcon decorative name="search" size={12} />
          <span className="mini-placeholder">Type something...</span>
        </div>
      );

    case "textarea":
      return (
        <div className="mini-preview mini-preview--textarea">
          <div className="mini-line mini-line--short" />
          <div className="mini-line" />
        </div>
      );

    case "select":
    case "multi-select":
      return (
        <div className="mini-preview mini-preview--input mini-preview--select">
          <span>Select option</span>
          <IqujiIcon decorative name="chevron-down" size={12} />
        </div>
      );

    case "checkbox":
      return (
        <div className="mini-preview mini-preview--row">
          <span className="mini-checkbox mini-checkbox--checked">
            <IqujiIcon decorative name="check" size={12} />
          </span>
          <span className="mini-checkbox" />
          <span className="mini-line mini-line--short" />
        </div>
      );

    case "radio":
      return (
        <div className="mini-preview mini-preview--row">
          <span className="mini-radio mini-radio--checked">
            <span className="mini-radio__dot" />
          </span>
          <span className="mini-radio" />
          <span className="mini-line mini-line--short" />
        </div>
      );

    case "switch":
      return (
        <div className="mini-preview mini-preview--row">
          <span className="mini-switch mini-switch--on">
            <span className="mini-switch__thumb" />
          </span>
          <span className="mini-switch">
            <span className="mini-switch__thumb" />
          </span>
        </div>
      );

    case "segmented-control":
    case "tabs":
      return (
        <div className="mini-preview mini-preview--tabs">
          <span className="mini-tab is-active">Active</span>
          <span className="mini-tab">Tab 2</span>
          <span className="mini-tab">Tab 3</span>
        </div>
      );

    case "calendar":
    case "date-picker":
      return (
        <div className="mini-preview mini-preview--calendar">
          <div className="mini-calendar__header">
            <IqujiIcon decorative name="chevron-left" size={10} />
            <span>Nov 2026</span>
            <IqujiIcon decorative name="chevron-right" size={10} />
          </div>
          <div className="mini-calendar__grid">
            <span className="mini-cal-dot" />
            <span className="mini-cal-dot" />
            <span className="mini-cal-dot is-selected" />
            <span className="mini-cal-dot" />
            <span className="mini-cal-dot" />
          </div>
        </div>
      );

    case "color-picker":
      return (
        <div className="mini-preview mini-preview--colors">
          <span className="mini-color-dot" style={{ background: "#cf2634" }} />
          <span className="mini-color-dot" style={{ background: "#17623c" }} />
          <span className="mini-color-dot" style={{ background: "#174f9b" }} />
          <span className="mini-color-dot" style={{ background: "#755000" }} />
          <span className="mini-color-dot" style={{ background: "#701923" }} />
        </div>
      );

    case "emoji-picker":
      return (
        <div className="mini-preview mini-preview--row mini-preview--emoji">
          <span>😀</span>
          <span>🚀</span>
          <span>✨</span>
          <span>🎨</span>
          <span>🔥</span>
        </div>
      );

    case "pagination":
      return (
        <div className="mini-preview mini-preview--pagination">
          <span className="mini-page-btn">&lt;</span>
          <span className="mini-page-btn is-active">1</span>
          <span className="mini-page-btn">2</span>
          <span className="mini-page-btn">3</span>
          <span className="mini-page-btn">&gt;</span>
        </div>
      );

    case "form-steps":
      return (
        <div className="mini-preview mini-preview--steps">
          <span className="mini-step-circle is-done">✓</span>
          <span className="mini-step-line" />
          <span className="mini-step-circle is-active">2</span>
          <span className="mini-step-line" />
          <span className="mini-step-circle">3</span>
        </div>
      );

    case "alert":
      return (
        <div className="mini-preview mini-preview--alert">
          <IqujiIcon decorative name="circle-info" size={14} />
          <div className="mini-line mini-line--short" />
        </div>
      );

    case "notification":
      return (
        <div className="mini-preview mini-preview--notification">
          <span className="mini-toast__dot" />
          <div className="mini-toast__content">
            <div className="mini-line mini-line--short" />
          </div>
          <IqujiIcon decorative name="close" size={10} />
        </div>
      );

    case "progress-bar":
      return (
        <div className="mini-preview mini-preview--progress">
          <div className="mini-progress-track">
            <div className="mini-progress-fill" style={{ width: "65%" }} />
          </div>
        </div>
      );

    case "skeleton":
      return (
        <div className="mini-preview mini-preview--skeleton">
          <div className="mini-sk-circle" />
          <div className="mini-sk-lines">
            <div className="mini-sk-line" />
            <div className="mini-sk-line mini-sk-line--short" />
          </div>
        </div>
      );

    case "timeline":
      return (
        <div className="mini-preview mini-preview--timeline">
          <div className="mini-tl-item">
            <span className="mini-tl-dot is-active" />
            <div className="mini-line mini-line--short" />
          </div>
          <div className="mini-tl-item">
            <span className="mini-tl-dot" />
            <div className="mini-line mini-line--short" />
          </div>
        </div>
      );

    case "dialog":
    case "confirm-dialog":
    case "form-dialog":
      return (
        <div className="mini-preview mini-preview--modal">
          <div className="mini-modal-window">
            <div className="mini-modal-bar">
              <span className="mini-modal-dot" />
              <span className="mini-modal-dot" />
            </div>
            <div className="mini-line mini-line--short" />
          </div>
        </div>
      );

    case "drawer":
      return (
        <div className="mini-preview mini-preview--drawer">
          <div className="mini-drawer-bg" />
          <div className="mini-drawer-sheet" />
        </div>
      );

    case "tooltip":
    case "popover":
      return (
        <div className="mini-preview mini-preview--popover">
          <div className="mini-popover-bubble">
            <div className="mini-line mini-line--short" />
          </div>
          <div className="mini-popover-arrow" />
        </div>
      );

    case "dropdown-menu":
      return (
        <div className="mini-preview mini-preview--dropdown">
          <div className="mini-drop-item">Edit</div>
          <div className="mini-drop-item">Duplicate</div>
          <div className="mini-drop-item is-danger">Delete</div>
        </div>
      );

    case "search-dialog":
      return (
        <div className="mini-preview mini-preview--search-dialog">
          <div className="mini-search-bar">
            <IqujiIcon decorative name="search" size={12} />
            <span className="mini-placeholder">Command...</span>
          </div>
          <div className="mini-search-results">
            <div className="mini-line mini-line--short" />
            <div className="mini-line" />
          </div>
        </div>
      );

    case "data-table":
    case "table-frame":
      return (
        <div className="mini-preview mini-preview--table">
          <div className="mini-table-header">
            <span>Name</span>
            <span>Status</span>
          </div>
          <div className="mini-table-row">
            <span className="mini-line mini-line--short" />
            <span className="mini-badge mini-badge--success">Ready</span>
          </div>
        </div>
      );

    case "workbench-layout":
    case "app-shell":
    case "desktop-shell":
      return (
        <div className="mini-preview mini-preview--workbench">
          <div className="mini-wb-sidebar" />
          <div className="mini-wb-content">
            <div className="mini-wb-bar" />
            <div className="mini-wb-main" />
          </div>
        </div>
      );

    case "editor-presets":
      return (
        <div className="mini-preview mini-preview--editor">
          <div className="mini-editor-toolbar">
            <span className="mini-ed-btn">B</span>
            <span className="mini-ed-btn">I</span>
            <span className="mini-ed-btn">&lt;/&gt;</span>
          </div>
          <div className="mini-editor-code">
            <span className="mini-code-line color-1">import</span> React
            <span className="mini-code-line color-2">const</span> app = () =&gt;
          </div>
        </div>
      );

    case "theme-preferences":
      return (
        <div className="mini-preview mini-preview--theme">
          <div className="mini-theme-split is-light">
            <IqujiIcon decorative name="sun" size={14} />
          </div>
          <div className="mini-theme-split is-dark">
            <IqujiIcon decorative name="moon" size={14} />
          </div>
        </div>
      );

    case "icons-gallery":
      return (
        <div className="mini-preview mini-preview--icons-cluster">
          <IqujiIcon decorative name="sparkles" size={16} />
          <IqujiIcon decorative name="settings" size={16} />
          <IqujiIcon decorative name="shield" size={16} />
          <IqujiIcon decorative name="folder" size={16} />
          <IqujiIcon decorative name="rocket" size={16} />
        </div>
      );

    case "motion-provider":
      return (
        <div className="mini-preview mini-preview--motion">
          <div className="mini-motion-card">
            <span>Route Enter (y: 4px → 0)</span>
          </div>
        </div>
      );

    case "i18n-provider":
      return (
        <div className="mini-preview mini-preview--i18n">
          <span className="mini-lang-pill">zh-CN</span>
          <IqujiIcon decorative name="arrow-right" size={12} />
          <span className="mini-lang-pill is-active">en-US</span>
        </div>
      );

    case "network-transport":
      return (
        <div className="mini-preview mini-preview--network">
          <span className="mini-badge mini-badge--success">GET 200</span>
          <span className="mini-line mini-line--short" />
        </div>
      );

    case "query-client":
      return (
        <div className="mini-preview mini-preview--query">
          <div className="mini-query-badge">
            <IqujiIcon decorative name="refresh" size={12} />
            <span>Cache: 30s stale</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="mini-preview mini-preview--default">
          <div className="mini-line mini-line--short" />
          <div className="mini-line" />
        </div>
      );
  }
}
