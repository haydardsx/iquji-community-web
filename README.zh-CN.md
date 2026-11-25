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

本项目以 [MIT 许可证](LICENSE)发布。
