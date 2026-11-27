# @iquji-community/web-terminal

[English](README.md)

提供字节流接口的 React 交互式终端。组件在挂载时加载 xterm.js，在卸载时释放终端资源。

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-terminal
```

```tsx
import "@iquji-community/web-terminal/styles.css";
import { IqujiTerminal, type IqujiTerminalSurface } from "@iquji-community/web-terminal";

const encoder = new TextEncoder();

function connect(surface: IqujiTerminalSurface) {
  surface.write(encoder.encode("输入字符后在终端中回显。\r\n"));
  return surface.onData((bytes) => surface.write(bytes));
}

export function EchoTerminal() {
  return (
    <IqujiTerminal
      label="回显终端"
      connect={connect}
      onError={() => console.error("终端启动失败。")}
    />
  );
}
```

同一会话应保持 `connect` 引用稳定，并返回关闭连接和移除订阅的函数。终端接口提供 `getSize()`、`onData(listener)`、`onResize(listener)` 和 `write(bytes)`。输入和输出均使用 `Uint8Array`，尺寸包含 `cols` 与 `rows`。两个订阅方法都返回取消函数。按 `Shift+Tab` 可将焦点移出终端。

样式表内含 xterm.js 样式，可以独立使用。App 引入 `@iquji-community/web-theme/tokens.css` 后，终端样式会使用 Community Web 主题 token。

从 `@iquji-community/web-component` 迁移时，请按上面的示例更新 `IqujiTerminal` 和相关类型的导入，并添加终端样式表。
