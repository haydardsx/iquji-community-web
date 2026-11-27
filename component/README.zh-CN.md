# @iquji-community/web-component

[English](README.md)

用于表单、表格、对话框、导航和日志的 React 组件。

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

`IqujiTerminal` 已迁至 `@iquji-community/web-terminal`。请按[交互终端指南](https://community-web.iquji.com/zh/terminal#example-terminal)更新 JavaScript 和 CSS 导入。
