# @iquji-community/web-editor

[English](README.md)

适用于 React 的富文本和代码编辑器。代码编辑器支持 Markdown、JSON、YAML、TOML、Shell 和纯文本。

```sh
npm install react@19.2.4 react-dom@19.2.4 @iquji-community/web-editor @iquji-community/web-theme @iquji-community/web-component
```

```tsx
import "@iquji-community/web-theme/tokens.css";
import "@iquji-community/web-component/styles.css";
import "@iquji-community/web-editor/styles.css";
import { IqujiTextEditor } from "@iquji-community/web-editor/text";
import { useState } from "react";

export function Editor() {
  const [value, setValue] = useState("{}");
  return (
    <IqujiTextEditor
      preset="json"
      ariaLabel="JSON 文档"
      labels={{ edit: "编辑", preview: "预览", format: "格式化", invalid: "格式有误" }}
      value={value}
      onChange={setValue}
    />
  );
}
```
