# @iquji-web/web-i18n

[简体中文](README.md) | English

Lightweight internationalization runtime for Iquji Web. Features dictionary injection, locale persistence, automatic browser language detection, and template string interpolation.

---

## Installation

```bash
npm install @iquji-web/web-i18n
```

---

## Usage

### 1. Dictionaries & Provider Configuration

```tsx
import { IqujiLocaleProvider, useIqujiLocale } from "@iquji-web/web-i18n";

const catalogs = {
  "zh-CN": {
    "app.title": "控制台",
    "welcome.user": "欢迎回来，{name}！你有 {count} 条未读消息。",
  },
  "en-US": {
    "app.title": "Dashboard",
    "welcome.user": "Welcome back, {name}! You have {count} unread messages.",
  },
} as const;

export function App() {
  return (
    <IqujiLocaleProvider catalogs={catalogs} defaultLocale="en-US" storageKey="app.locale">
      <UserProfile />
    </IqujiLocaleProvider>
  );
}

function UserProfile() {
  const { locale, setLocale, translate } = useIqujiLocale();

  return (
    <div>
      <h1>{translate("app.title")}</h1>
      <p>{translate("welcome.user", { name: "Alice", count: 3 })}</p>

      <button onClick={() => setLocale(locale === "en-US" ? "zh-CN" : "en-US")}>
        Toggle Language (Current: {locale})
      </button>
    </div>
  );
}
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
