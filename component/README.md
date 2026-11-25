# @iquji-community/web-component

[简体中文](README.zh-CN.md)

React components for forms, tables, dialogs, navigation, logs and interactive terminals.

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

## Interactive terminal

`IqujiTerminal` renders a terminal with the package's `styles.css`. Pass an accessible `label`, a `connect(surface)` callback that returns a cleanup function, and an `onError` callback for initialization failures. Keep `connect` stable for the same session. The surface provides `getSize()`, `onData(listener)`, `onResize(listener)` and `write(bytes)`. Both subscriptions return cleanup functions. Input and output use `Uint8Array`; sizes contain `cols` and `rows`. Use `Shift+Tab` to move focus out of the terminal.
