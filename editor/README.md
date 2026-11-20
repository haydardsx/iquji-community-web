# @iquji-community/web-editor

[简体中文](README.zh-CN.md)

Rich text and code editors for React. The text editor supports Markdown, JSON, YAML, TOML, Shell and plain text.

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
      ariaLabel="JSON document"
      labels={{ edit: "Edit", preview: "Preview", format: "Format", invalid: "Invalid JSON" }}
      value={value}
      onChange={setValue}
    />
  );
}
```
