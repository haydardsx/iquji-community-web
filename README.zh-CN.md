# Iquji Community Web

[English](README.md)

Iquji Community Web 提供八个可单独安装的 npm 包。可以在[在线预览](https://haydardsx.github.io/iquji-community-web/)切换语言并试用组件。

| 包 | 用途 |
| --- | --- |
| [`@iquji-community/web-component`](component/README.zh-CN.md) | 用于表单、表格、对话框、导航、日志和交互终端的 React 组件。 |
| [`@iquji-community/web-editor`](editor/README.zh-CN.md) | 适用于 React 的富文本和代码编辑器。代码编辑器支持 Markdown、JSON、YAML、TOML、Shell 和纯文本。 |
| [`@iquji-community/web-theme`](theme/README.zh-CN.md) | 提供 CSS 主题变量和 React 主题上下文，支持浅色、深色和跟随系统。 |
| [`@iquji-community/web-icons`](icons/README.zh-CN.md) | React 图标。装饰图标可设置 decorative，表达含义的图标可设置无障碍标签。 |
| [`@iquji-community/web-motion`](motion/README.zh-CN.md) | 提供动画预设和 React 动效上下文，支持系统的减少动态效果偏好。 |
| [`@iquji-community/web-i18n`](i18n/README.zh-CN.md) | 支持中英文切换、词典和文本插值。 |
| [`@iquji-community/web-network`](network/README.zh-CN.md) | 提供 HTTP 请求和带类型的 JSON 响应，支持超时、取消和注入 fetch，并提供同源 WebSocket 终端通道。 |
| [`@iquji-community/web-query`](query/README.zh-CN.md) | 提供 TanStack Query 客户端和 React 上下文，可配置重试行为。 |

在仓库根目录使用 Bun 1.3.14、Node.js 24 和 npm 构建所有包、运行测试并检查制品。

```sh
bun run check
```

## 提交改动

从最新的 `main` 创建用途分支，例如 `feat/interactive-terminal`。分支名由变更类型、斜杠及小写英文主题组成，主题可用连字符分词。提交和 PR 标题使用 `类型(scope): 具体改动`，例如 `fix(component): 调整窗口后保持终端焦点`。

每次克隆后运行以下命令启用 Git 钩子。提交时会针对暂存文件运行包和预览检查，并检查分支名及提交标题。省略 `--install` 可单独检查暂存内容。候选通过 CI 后才进入公开开发分支，PR 检查通过后才能合入 `main`。

```sh
python3 scripts/check_staged.py --install
```

## 发行

受保护的 `main` 分支检查通过后，仓库所有者从 `main` 启动 **Create Community Web release tag**，填写 `vX.Y.Z` 标签和完整提交号。八个包的版本都须与标签一致。对当前同一提交重试会复用匹配的标签。标签创建后触发 npm 发行工作流。[建标工作流](.github/workflows/tag-main.yml)

使用已登录的 GitHub CLI 执行 `node scripts/tag-main.mjs vX.Y.Z <提交号>` 可进行只读预检。

本项目以 [MIT 许可证](LICENSE)发布。
