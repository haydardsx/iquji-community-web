# @iquji-community/web-terminal

[简体中文](README.zh-CN.md)

An interactive React terminal with a byte-stream interface. The component loads xterm.js when it mounts and disposes it when it unmounts.

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-terminal
```

```tsx
import "@iquji-community/web-terminal/styles.css";
import { IqujiTerminal, type IqujiTerminalSurface } from "@iquji-community/web-terminal";

const encoder = new TextEncoder();

function connect(surface: IqujiTerminalSurface) {
  surface.write(encoder.encode("Type to echo your input.\r\n"));
  return surface.onData((bytes) => surface.write(bytes));
}

export function EchoTerminal() {
  return (
    <IqujiTerminal
      label="Echo terminal"
      connect={connect}
      onError={() => console.error("The terminal could not start.")}
    />
  );
}
```

Keep `connect` stable for the same session and return a function that closes the connection and removes subscriptions. The surface provides `getSize()`, `onData(listener)`, `onResize(listener)` and `write(bytes)`. Input and output use `Uint8Array`. The size has `cols` and `rows`. Both subscriptions return cleanup functions. Press `Shift+Tab` to move focus out of the terminal.

The stylesheet includes xterm.js styles and works on its own. It uses Community Web theme tokens when the app imports `@iquji-community/web-theme/tokens.css`.

To migrate from `@iquji-community/web-component`, update the imports for `IqujiTerminal` and its types and add the terminal stylesheet shown above.
