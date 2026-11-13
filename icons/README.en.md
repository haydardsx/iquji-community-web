# @iquji-web/web-icons

[简体中文](README.md) | English

Vector icon library for Iquji Web. Wraps common UI interaction icons and enforces strict WAI-ARIA accessibility constraints (requiring either an explicit accessible label or decorative mark).

---

## Installation

```bash
npm install @iquji-web/web-icons
```

---

## Usage & Accessibility

### Accessibility Constraints

- **Decorative Icons**: When an icon is purely visual and accompanied by text, declare `decorative`:
  ```tsx
  <IqujiIcon decorative name="search" size={16} />
  ```
- **Semantic Icons**: When an icon represents an actionable or meaningful element on its own, provide an accessible `label`:
  ```tsx
  <IqujiIcon label="Close modal" name="close" size={20} />
  ```

### Full Example

```tsx
import { IqujiIcon } from "@iquji-web/web-icons";

export function IconDemo() {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      {/* Search */}
      <IqujiIcon decorative name="search" size={18} />

      {/* Settings & User */}
      <IqujiIcon decorative name="settings" size={18} />
      <IqujiIcon decorative name="user" size={18} />

      {/* Language & Theme */}
      <IqujiIcon decorative name="languages" size={18} />
      <IqujiIcon decorative name="sun" size={18} />
      <IqujiIcon decorative name="moon" size={18} />

      {/* Action button with accessible screen-reader name */}
      <button>
        <IqujiIcon label="Refresh dataset" name="refresh" size={16} />
      </button>
    </div>
  );
}
```

---

## Available Icons

Includes key interface icons such as `arrow-*`, `chevron-*`, `check`, `close`, `settings`, `search`, `sun`, `moon`, `languages`, `home`, `user`, `bell`, `lock`, `filter`, `folder`, `circle-alert`, `circle-info`, and many more.

---

## Development & Build

```bash
bun install --frozen-lockfile
bun run build       # Build dist/
bun run typecheck   # Type verification
bun run test        # Unit tests
bun run check       # Complete check
```
