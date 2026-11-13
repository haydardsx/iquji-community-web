# Web theme

`@iquji-cloud/web-theme` 只提供通用 theme 能力，JavaScript、类型声明、必要样式及功能测试随源码交付。

安装使用本目录锁文件，运行 `bun install --frozen-lockfile` 和 `bun run check`。正式入口只导出 `dist` 中的 JavaScript、类型声明和独立 CSS，不要求消费者编译本包源码。

`--iquji-color-action-primary`、`--iquji-color-action-danger` 及各自的 `-hover` 变量提供填充操作背景，`--iquji-color-action-contrast` 提供白色前景；它们独立于阅读用强调色和状态提醒色。应用覆盖操作变量时仍须保持明暗主题的可读对比度，不用状态提醒的浅色文字充当红底按钮背景。禁用操作使用 `--iquji-color-disabled-fill` 和 `--iquji-color-disabled-text`。

输入类控件使用独立的 `--iquji-color-control-border`、`--iquji-color-control-hover-border`、`--iquji-color-control-focus-border` 和 `--iquji-control-focus-shadow`。默认以明暗主题的中性描边与 1px 柔和外晕标识聚焦；品牌色覆盖不会生成粗色环。按钮、导航等键盘入口仍使用 `--iquji-focus-ring`，高对比度模式保留系统可见焦点。
