# Iquji Web

[简体中文](README.md) | English

A modern, modular, accessible Web UI toolkit and foundation suite. Provides decoupled UI components, rich-text and code editors, design theme tokens, vector icons, motion primitives, internationalization, query state management, and HTTP transport.

> **Live Preview**: Visit [community-web.iquji.com](https://community-web.iquji.com) to explore the interactive component catalog and capabilities overview.

---

## Key Features

- 🧩 **Modular Architecture**: 8 standalone public npm packages. Install and consume only what you need without bloat.
- ♿ **Accessibility First**: Built on Base UI primitives and WAI-ARIA standards, providing robust keyboard navigation and screen-reader support.
- 🎨 **Adaptive Theming**: Semantic CSS tokens with seamless light / dark theme transitions and zero-flash first-paint execution.
- 🌐 **Comprehensive i18n & Motion**: Decoupled dictionary injection and smooth animations that honor `prefers-reduced-motion`.
- ⚡ **Modern Tooling**: Powered by Bun 1.3.14, strict TypeScript declarations, and Biome linting.

---

## Package Directory

| Package | Description | Documentation |
| :--- | :--- | :--- |
| **`@iquji-web/web-component`** | Core UI components: forms, layouts, workbenches, desktop shells, overlays | [Chinese](component/README.md) · [English](component/README.en.md) |
| **`@iquji-web/web-theme`** | Theme provider, light/dark switching, prepaint script, and design tokens | [Chinese](theme/README.md) · [English](theme/README.en.md) |
| **`@iquji-web/web-icons`** | Vector icon library with semantic accessibility and decorative support | [Chinese](icons/README.md) · [English](icons/README.en.md) |
| **`@iquji-web/web-motion`** | Route entrance animations and reduced-motion adaptation | [Chinese](motion/README.md) · [English](motion/README.en.md) |
| **`@iquji-web/web-i18n`** | Lightweight i18n provider, locale persistence, and template interpolation | [Chinese](i18n/README.md) · [English](i18n/README.en.md) |
| **`@iquji-web/web-query`** | React Query client configuration and robust retry policies | [Chinese](query/README.md) · [English](query/README.en.md) |
| **`@iquji-web/web-network`** | Raw HTTP transport abstractions, injectable fetch, timeouts, and cancellation | [Chinese](network/README.md) · [English](network/README.en.md) |
| **`@iquji-web/web-editor`** | Markdown / JSON / YAML / TOML source and rich text editor presets | [Chinese](editor/README.md) · [English](editor/README.en.md) |
| **`@iquji-web/web-preview`** | Interactive component catalog and capability showcase (private package) | [Chinese](preview/README.md) · [English](preview/README.en.md) |

---

## Quick Start

### 1. Installation

Install the required packages using your package manager of choice (e.g. `@iquji-web/web-component`):

```bash
# npm
npm install @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons

# pnpm
pnpm add @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons

# Bun
bun add @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons
```

> **Note**: `react` and `react-dom` (>= 19) are peerDependencies provided by the consuming application.

### 2. Import Styles

Import theme tokens first, followed by component styles at your application's entry point:

```tsx
// Must import theme tokens before component styles
import "@iquji-web/web-theme/tokens.css";
import "@iquji-web/web-component/styles.css";
```

### 3. Basic Usage

```tsx
import { IqujiThemeProvider } from "@iquji-web/web-theme";
import { IqujiOverlayProvider, IqujiButton, IqujiField, IqujiInput } from "@iquji-web/web-component";
import { IqujiIcon } from "@iquji-web/web-icons";

export function App() {
  return (
    <IqujiThemeProvider defaultMode="system" storageKey="app.theme">
      <IqujiOverlayProvider>
        <div style={{ padding: 24, maxWidth: 480 }}>
          <IqujiField label="Server Name" required>
            <IqujiInput placeholder="Enter production host" />
          </IqujiField>
          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <IqujiButton>Save Changes</IqujiButton>
            <IqujiButton variant="secondary">Cancel</IqujiButton>
          </div>
        </div>
      </IqujiOverlayProvider>
    </IqujiThemeProvider>
  );
}
```

---

## Development & Testing

This project requires **Bun 1.3.14** for package management and building.

```bash
# Install root dependencies
bun install

# Run global automated checks (typecheck, tests, linter, packaging integrity)
bun run check

# Start interactive preview development server (listens on http://127.0.0.1:5175)
cd preview && bun run dev

# Pack release tarballs
bun run pack -- <output-directory>
```

### Dependency Architecture

```
icons, theme, motion, i18n, query, network (independent leaf packages)
    └── component (depends on icons, theme)
          └── editor (depends on component, icons, theme)
                └── preview (integrates all packages)
```

---

## Automatic publishing

A push to `main` automatically increments the patch version, checks every package, and publishes all eight npm packages. Versions live in a separate `vX.Y.Z` release snapshot; `main` keeps its development baseline. No manual version edit or tag push is required. Rapid pushes may be combined into one release of the latest source.

Temporary registry or download cache failures receive bounded retries using the same version, uploading only missing packages. Existing packages must pass integrity and file content checks; published versions are never overwritten. A formal GitHub Release is created only after all packages pass verification. Rerunning the same completed source does not create another version. Permission, integrity, or content errors stop publication and require a fix before rerunning from Actions.

## Contributing & License

- Issues and Pull Requests are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md).
- Licensed under the [MIT License](LICENSE).
