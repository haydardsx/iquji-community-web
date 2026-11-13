# @iquji-web/web-editor

简体中文 | [English](README.en.md)

Iquji Web 文本与代码编辑器套件，基于 CodeMirror 6 与 Tiptap / ProseMirror 构建，开箱即用支持富文本排版与 Markdown、JSON、YAML、TOML 源码编辑。

---

## 安装

```bash
npm install @iquji-web/web-editor @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons
```

> **样式引入**：
> ```tsx
> import "@iquji-web/web-theme/tokens.css";
> import "@iquji-web/web-component/styles.css";
> import "@iquji-web/web-editor/styles.css";
> ```

---

## 核心特性与使用

### 1. 源码编辑器预设 (`IqujiTextEditor`)

支持 Markdown、JSON、YAML、TOML 及纯文本高亮、行号与格式化：

```tsx
import { IqujiTextEditor } from "@iquji-web/web-editor";
import { useState } from "react";

export function CodeEditorDemo() {
  const [content, setContent] = useState('{\n  "name": "iquji"\n}');

  return (
    <IqujiTextEditor
      language="json"
      value={content}
      onChange={setContent}
      minHeight="280px"
    />
  );
}
```

### 2. 富文本编辑器 (`IqujiRichTextEditor`)

内置加粗、斜体、下划线、标题层级、对齐、颜色提取与色板交互：

```tsx
import { IqujiRichTextEditor } from "@iquji-web/web-editor";
import { useState } from "react";

export function RichEditorDemo() {
  const [html, setHtml] = useState("<p>欢迎使用 Iquji Web 富文本编辑器！</p>");

  return (
    <IqujiRichTextEditor
      value={html}
      onChange={setHtml}
      placeholder="请输入正文..."
    />
  );
}
```

---

## 开发与构建

```bash
bun install --frozen-lockfile
bun run build       # 编译打包到 dist/
bun run typecheck   # 类型校验
bun run test        # 单元测试
bun run check       # 自动化完整自检
```
