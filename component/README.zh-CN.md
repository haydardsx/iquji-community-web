# @iquji-community/web-component

[English](README.md)

用于表单、表格、对话框、导航、日志和交互终端的 React 组件。

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-component @iquji-community/web-theme
```

```tsx
import "@iquji-community/web-theme/tokens.css";
import "@iquji-community/web-component/styles.css";
import { IqujiButton } from "@iquji-community/web-component";

export function SaveButton() {
  return <IqujiButton type="submit">保存</IqujiButton>;
}
```

## 交互终端

`IqujiTerminal` 使用本包的 `styles.css` 渲染终端。传入可访问名称 `label`、返回清理函数的 `connect(surface)` 和处理初始化失败的 `onError`。同一会话应保持 `connect` 引用稳定。终端接口提供 `getSize()`、`onData(listener)`、`onResize(listener)` 和 `write(bytes)`，订阅方法均返回取消函数。输入和输出均使用 `Uint8Array`，尺寸包含 `cols` 与 `rows`。按 `Shift+Tab` 可将焦点移出终端。
