# @iquji-community/web-component

[简体中文](README.zh-CN.md)

React components for forms, tables, dialogs, navigation and logs.

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-component @iquji-community/web-theme
```

```tsx
import "@iquji-community/web-theme/tokens.css";
import "@iquji-community/web-component/styles.css";
import { IqujiButton } from "@iquji-community/web-component";

export function SaveButton() {
  return <IqujiButton type="submit">Save</IqujiButton>;
}
```
