# Web icons

`@iquji-cloud/web-icons` 只提供通用 icons 能力，JavaScript、类型声明、必要样式及功能测试随源码交付。

安装使用本目录锁文件，运行 `bun install --frozen-lockfile` 和 `bun run check`。正式入口只导出 `dist` 中的 JavaScript、类型声明，不要求消费者编译本包源码。

公开类型由 React SVG 属性、尺寸、独立描边和可访问性约束组成，不暴露底层图标库类型。仓外消费者使用正式类型产物验证图标名、SVG 属性和可访问性联合，不需要读取本包源码或修补第三方声明。
