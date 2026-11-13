# Iquji Web

[简体中文](README.md) | English

Public Web foundation packages for components, editors, themes, icons, motion, internationalization, query state, and HTTP transport. Each release package can be installed, checked, built, and packed into a local tarball from this repository. Packages and documentation must not depend on Enterprise code or source code from consuming repositories.

| Package | Features |
| --- | --- |
| [component](component/README.md) | Forms, layouts, desktop shells, three-pane workbenches, settings pages, pagination, overlays, and component styles |
| [theme](theme/README.md) | Themes, preferences, first-paint scripts, and semantic CSS variables |
| [icons](icons/README.md) | Icons and accessibility attributes |
| [motion](motion/README.md) | Shared motion primitives and reduced-motion support |
| [i18n](i18n/README.md) | Internationalization state with application-provided dictionaries |
| [query](query/README.md) | QueryClient, queries, and retry policies |
| [network](network/README.md) | Raw HTTP transport, injectable fetch, timeouts, cancellation, and JSON adapters |
| [editor](editor/README.md) | Rich text and Markdown/JSON/YAML/TXT source presets |

## Development

Use Bun `1.3.14`. In the package directory, run `bun install --frozen-lockfile`, then `bun run build` to build or `bun run check` to build, check types, and run functional tests.

`component` depends on the public `icons` and `theme` packages. When setting it up for the first time, install and build `icons` and `theme` before installing and building `component`. `editor` depends on the public `component`, `icons`, and `theme` packages; the remaining packages can be used independently. Dependencies between Community packages must stay within the public Community packages.

The [preview](preview/README.md) is a public feature catalog with interactive examples, available through [GitHub Pages](https://community-web.iquji.com). It is not an npm release package. It must cover every public JavaScript, type, and CSS export of every release package. Examples use local state or injected substitutes and do not access real services. Test-support exports, test files, build scripts, and generated artifacts do not need individual pages; new release exports must be added to both the coverage inventory and examples.

Release package entry points export JavaScript, type declarations, and required CSS from `dist`. Applications must explicitly import `@iquji-cloud/web-theme/tokens.css` before `@iquji-cloud/web-component/styles.css`. Applications supply visible text, dictionaries, storage keys, and business callbacks. The component-level `IqujiColorPicker` can also be used independently for other color fields.

In this repository, “workspace” means a package or preview application's build workspace. It does not refer to a consuming product's project identity, project association, or application working directory.

## Installation and releases

Install the `@iquji-cloud/web-*` release packages with npm, pnpm, Yarn, or Bun, for example:

```sh
npm install @iquji-cloud/web-component
```

The application provides React and other `peerDependencies`. Import styles in the order described above.

At the repository root, `bun run check` checks all release packages and the preview, including the release archives. Run `bun run pack -- <empty-output-directory>` to create tarballs without development dependencies, source scripts, or local overrides. Checks write temporary tarballs outside the repository.

Version tags such as `v0.1.0` trigger publishing. The tag version must match all eight release packages. A maintainer must authenticate with npm for the initial publication. For subsequent releases, configure GitHub Actions trusted publishing for each package with repository `haydardsx/iquji-community-web`, workflow `release.yml`, and environment `npm`. Published versions are never overwritten; reruns publish only missing versions whose contents match the expected release.

Pages deploys from `main` after checks pass and uploads only the preview's static build directory. Manage the custom domain in GitHub Pages settings. The build uses the base path supplied by Pages and supports both project subpaths and standalone domains.

## Contributing and license

This project uses the [MIT License](LICENSE). Code and documentation contributions must follow the [contribution guide](CONTRIBUTING.md). The eight release packages are published to npm; the preview and repository tooling retain their private-package markers. `bun run check` and CI verify the package inventory, preview coverage, and temporary tarball output.
