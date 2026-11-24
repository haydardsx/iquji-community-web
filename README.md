# Iquji Community Web

[简体中文](README.zh-CN.md)

Iquji Community Web is a React and TypeScript UI toolkit for building admin dashboards and developer tools. Its eight npm packages include data tables, forms, rich text and code editors, and an interactive terminal.

```sh
npm install @iquji-community/web-component @iquji-community/web-theme
```

Explore the [component documentation and interactive examples](https://community-web.iquji.com/).

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

## Submitting a change

Start a branch from the latest `main`, for example `feat/interactive-terminal`. Use a change type followed by a slash and a lowercase topic with hyphens. Write commit and PR titles as `type(scope): description`, for example `fix(component): keep terminal focus after resizing`.

Enable the repository's Git hooks once per clone. Each commit runs the package and preview checks against the staged files and validates the branch and commit title. To run the staged checks yourself, omit `--install`. A change enters the public development branch after candidate CI succeeds and enters `main` through a passing PR.

```sh
python3 scripts/check_staged.py --install
```

## Releases

After CI succeeds on the protected `main` branch, the repository owner runs **Create Community Web release tag** from `main` with the `vX.Y.Z` tag and the full commit SHA. All eight package versions must match the tag. A retry for the same current commit reuses its matching tag. Creating the tag triggers the npm release workflow. [Create a release tag](.github/workflows/tag-main.yml)

Run `node scripts/tag-main.mjs vX.Y.Z <commit-sha>` with an authenticated GitHub CLI to run the read-only preflight.

Released under the [MIT License](LICENSE).
