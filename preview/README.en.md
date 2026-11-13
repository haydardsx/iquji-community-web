# Community Web Capability Showcase (Preview)

[简体中文](README.md) | English

Interactive preview and capability showcase for Iquji Web foundation packages. Built on Vite + React 19, deployed to [GitHub Pages](https://community-web.iquji.com).

---

## Key Features

- 🌟 **HeroUI-Inspired Overview**: Visual component grid, metrics cards, and miniature previews.
- 🌓 **One-Click Theme Toggle**: Powered by `@iquji-web/web-theme`, providing instant, zero-flash transitions between light and dark modes.
- 🌐 **Comprehensive Bilingual Support**: Powered by `@iquji-web/web-i18n`, supporting instantaneous language switching across top navigation, sidebar, overview cards, and component descriptions.
- 🔍 **Instant Search & Filter**: Real-time matching against component titles, categories, descriptions, and keywords.
- 🛡️ **100% Export Coverage**: Strict AST coverage tests (`coverage.test.ts`) guaranteeing every public API export in the release packages has a live interactive demo.

---

## Local Development

Before running for the first time, make sure dependencies and packages are built, then execute:

```bash
# Install dependencies
bun install --frozen-lockfile

# Start development server (listens on http://127.0.0.1:5175)
bun run dev
```

---

## Checks & Build

```bash
# Code style & formatting (Biome)
bun run lint

# TypeScript verification
bun run typecheck

# Coverage & preview test suite
bun run test

# Static production build (outputs to dist/)
bun run build
```

---

## Adding New Previews

When adding new public exports or components to `@iquji-web/*`:
1. Register the export in `COMMUNITY_PREVIEW_COVERAGE` inside `src/catalog.ts`;
2. Add an interactive demo in `src/previews/` with proper category, title, bilingual descriptions, and keywords;
3. Run `bun test ./src` to verify AST coverage tests pass.
