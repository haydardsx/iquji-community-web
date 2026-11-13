# Iquji Web

简体中文 | [English](README.en.md)

公开 Web 基础包，提供组件、编辑器、主题、图标、动效、国际化、查询状态和 HTTP 传输。每个正式包都能从本仓独立安装、检查、构建并产出本地 tarball；包和文档不得依赖 Enterprise 或消费仓源码。

| 包 | 能力 |
| --- | --- |
| [component](component/README.md) | 表单、布局、桌面壳、三栏工作台、设置页、分页、浮层和组件样式 |
| [theme](theme/README.md) | 主题、偏好、首帧脚本和语义样式变量 |
| [icons](icons/README.md) | 图标与可访问性属性 |
| [motion](motion/README.md) | 通用动效与 reduced-motion |
| [i18n](i18n/README.md) | 应用注入词典的国际化状态 |
| [query](query/README.md) | QueryClient、查询与重试策略 |
| [network](network/README.md) | 原始 HTTP 传输、可注入 fetch、超时、取消与 JSON 适配器 |
| [editor](editor/README.md) | 富文本与 Markdown/JSON/YAML/TXT 源码预设 |

使用 Bun 1.3.14。在目标包目录运行 `bun install --frozen-lockfile` 安装，再运行 `bun run build` 构建，或运行 `bun run check` 完成构建、类型检查与功能测试。

component 使用公开的 icons 和 theme。首次开发 component 时，先分别在 icons 和 theme 中安装并构建，再安装并构建 component。editor 使用公开的 component、icons 和 theme；其余包可独立使用。Community 包之间的依赖必须保持在公开 Community 闭包内。

[preview](preview/README.md) 是公开能力目录和交互示例，不属于 npm 正式包，通过 GitHub Pages 提供[在线能力预览](https://community-web.iquji.com)。它必须覆盖每个正式包的公开 JavaScript、类型和 CSS 出口；示例使用本地状态或注入替身，不访问真实服务。测试支持出口、测试文件、构建脚本和生成产物不要求单独做页面，但新增正式出口必须同步覆盖清单和示例。

正式包入口导出 `dist` 中的 JavaScript、类型声明及必要 CSS。主题样式由 `@iquji-web/web-theme/tokens.css` 提供，组件样式由 `@iquji-web/web-component/styles.css` 提供，应用按此顺序显式导入。可见文案、词典、存储键和业务回调由应用传入。

本仓“工作区”指各包或预览应用的构建工作区，不代表消费产品的项目身份、项目关联或应用工作目录。

本项目采用 MIT License。代码与文档贡献须遵循[贡献指南](CONTRIBUTING.md)；八个正式包发布到 npm，preview 与仓库工具保持私有包标记。`bun run check` 和 CI 会验证包目录清单、preview 覆盖与临时 tarball 产出；tarball 只写入临时目录，不进入仓库。

[editor](editor/README.md) 提供富文本与源码预设；组件层 `IqujiColorPicker` 可独立用于其他颜色字段。

## 安装与发布

使用 npm、pnpm、Yarn 或 Bun 安装 `@iquji-web/web-*` 正式包，例如 `npm install @iquji-web/web-component`。React 等 peerDependencies 由应用提供；样式按上文顺序导入。

仓根 `bun run check` 检查全部正式包与 preview，并验证发布包；`bun run pack -- <空输出目录>` 生成不带开发依赖、源码脚本或本地 overrides 的 tarball。

每次 push 到 `main` 都会触发自动发布规划，检查最新 `main` 源码快照，给八个包统一递增 patch 版本，并同步包间依赖与锁文件。版本提交保存在独立的 `vX.Y.Z` 标签中，不回写 `main`；开发分支中的版本是基线，正式版本、对应源码和完成状态以标签及 GitHub Release 为准。快速连续推送可能合并为最新源码快照，不为中间提交逐一发版。自动发布只从启用后的更新开始，不回放旧历史。

同一源码快照重跑复用原标签；存在未完成版本时，先补齐该版本再规划最新源码。已发布包先校验注册表完整性，再逐文件核对内容和可执行权限，一致时跳过，缺失时补发；不会覆盖旧版本或把不同内容当作成功。只有八个包都可从 npm 读取且内容一致，才登记 GitHub Release 和成功部署。

可信发布限定仓库 `haydardsx/iquji-community-web`、工作流 `release.yml`、环境 `npm`。自动规划使用 GitHub 的短期工作流凭据创建版本标签并调度标签发布；上传 npm 使用 OIDC，无需长期 npm token。手动运行 `release.yml` 时，`automatic` 在 main 恢复自动流程，`publish` 在版本标签恢复发布，`verify` 只读核验所选修订；也可在发布标签检出后运行 `bun run release -- --verify-published`。

Pages 从通过检查的 main 部署，仅上传 preview 的静态构建目录。自定义域名由 GitHub Pages 设置管理；构建使用 Pages 提供的 base path，同时支持项目子路径和独立域名。
