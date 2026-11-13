# @iquji-web/web-i18n

简体中文 | [English](README.en.md)

Iquji Web 轻量国际化方案，支持应用级词典注入、语言状态持久化、浏览器语言自动识别及模板参数插值。

---

## 安装

```bash
npm install @iquji-web/web-i18n
```

---

## 核心特性与使用

### 1. 定义词典与注入 Provider

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
    <IqujiLocaleProvider catalogs={catalogs} defaultLocale="zh-CN" storageKey="app.locale">
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

      <button onClick={() => setLocale(locale === "zh-CN" ? "en-US" : "zh-CN")}>
        切换语言 (当前: {locale})
      </button>
    </div>
  );
}
```

---

## 开发与构建

```bash
bun install --frozen-lockfile
bun run build       # 编译打包到 dist/
bun run typecheck   # 类型校验
bun run test        # 单元测试
bun run check       # 完整自检
```
