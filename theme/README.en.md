# @iquji-web/web-theme

[简体中文](README.md) | English

Design tokens and the theme runtime for Iquji Web. Provides semantic CSS variables, light/dark mode and density switching, persistent context provider, and zero-flash first-paint prepaint scripts.

---

## Installation

```bash
npm install @iquji-web/web-theme
```

---

## Importing Tokens

Import the theme tokens at your application entry point before any component styles:

```tsx
import "@iquji-web/web-theme/tokens.css";
```

CSS Tokens dynamically adapt via `[data-theme="light"]` and `[data-theme="dark"]`:
- Surface & Canvas: `--iquji-color-canvas`, `--iquji-color-surface`, `--iquji-color-border`, `--iquji-color-text`, `--iquji-color-muted`
- Action & Accents: `--iquji-color-accent`, `--iquji-color-action-primary`, `--iquji-color-action-danger`
- Spacing & Typography: `--iquji-space-1` through `--iquji-space-16`, `--iquji-font-size-*`
- Radius & Shadows: `--iquji-radius-*`, `--iquji-shadow-*`

---

## Theme Provider & Hook

```tsx
import { IqujiThemeProvider, useIqujiTheme } from "@iquji-web/web-theme";

export function App() {
  return (
    <IqujiThemeProvider defaultMode="system" storageKey="app.theme">
      <ThemeToggle />
    </IqujiThemeProvider>
  );
}

function ThemeToggle() {
  const { mode, resolvedTheme, setMode } = useIqujiTheme();

  return (
    <button onClick={() => setMode(resolvedTheme === "dark" ? "light" : "dark")}>
      Current: {resolvedTheme} (mode: {mode})
    </button>
  );
}
```

---

## Prepaint Script (Zero-Flash)

Inject `IqujiThemePrepaintScript` in SSR HTML or your document `<head>` to execute synchronously before React hydration, preventing dark mode flashes on page load:

```tsx
import { IqujiThemePrepaintScript } from "@iquji-web/web-theme";

<head>
  <IqujiThemePrepaintScript storageKey="app.theme" defaultMode="system" />
</head>
```

---

## Development & Build

```bash
bun install --frozen-lockfile
bun run build       # Compile dist/
bun run typecheck   # Typecheck
bun run test        # Unit tests
bun run check       # Complete test suite
```
