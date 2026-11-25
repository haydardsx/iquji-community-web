# Iquji Community Web

[简体中文](README.zh-CN.md)

Iquji Community Web provides eight npm packages. Explore the components and switch languages in the [live preview](https://haydardsx.github.io/iquji-community-web/).

| Package | Purpose |
| --- | --- |
| [`@iquji-community/web-component`](component/README.md) | React components for forms, tables, dialogs, navigation, logs and interactive terminals. |
| [`@iquji-community/web-editor`](editor/README.md) | Rich text and code editors for React. The text editor supports Markdown, JSON, YAML, TOML, Shell and plain text. |
| [`@iquji-community/web-theme`](theme/README.md) | CSS tokens, a React theme provider and light, dark and system modes. |
| [`@iquji-community/web-icons`](icons/README.md) | React icons with explicit decorative and accessible label options. |
| [`@iquji-community/web-motion`](motion/README.md) | Animation presets and a React provider that respects reduced motion preferences. |
| [`@iquji-community/web-i18n`](i18n/README.md) | English and Chinese locale selection, message dictionaries and string interpolation. |
| [`@iquji-community/web-network`](network/README.md) | HTTP requests, typed JSON responses with timeouts and cancellation, and a same-origin WebSocket terminal transport. |
| [`@iquji-community/web-query`](query/README.md) | A TanStack Query client and React provider with configurable retry behavior. |

From the repository root, use Bun 1.3.14, Node.js 24 and npm to build the packages, run tests and verify the archives.

```sh
bun run check
```

Released under the [MIT License](LICENSE).
