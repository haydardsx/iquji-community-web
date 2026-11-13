# @iquji-web/web-editor

[简体中文](README.md) | English

Text and code editing suite for Iquji Web. Built with CodeMirror 6 and Tiptap / ProseMirror, providing out-of-the-box rich-text formatting and syntax presets for Markdown, JSON, YAML, and TOML.

---

## Installation

```bash
npm install @iquji-web/web-editor @iquji-web/web-component @iquji-web/web-theme @iquji-web/web-icons
```

> **Style Imports**:
> ```tsx
> import "@iquji-web/web-theme/tokens.css";
> import "@iquji-web/web-component/styles.css";
> import "@iquji-web/web-editor/styles.css";
> ```

---

## Usage

### 1. Code & Source Editor (`IqujiTextEditor`)

Supports syntax highlighting, line numbers, and formatting for Markdown, JSON, YAML, TOML, and plain text:

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

### 2. Rich Text Editor (`IqujiRichTextEditor`)

Features bold, italics, underline, heading tiers, text alignment, and accessible color picker integration:

```tsx
import { IqujiRichTextEditor } from "@iquji-web/web-editor";
import { useState } from "react";

export function RichEditorDemo() {
  const [html, setHtml] = useState("<p>Welcome to Iquji Web Rich Text Editor!</p>");

  return (
    <IqujiRichTextEditor
      value={html}
      onChange={setHtml}
      placeholder="Type your content here..."
    />
  );
}
```

---

## Development & Build

```bash
bun install --frozen-lockfile
bun run build       # Compile dist/
bun run typecheck   # Typecheck
bun run test        # Unit tests
bun run check       # Complete verification suite
```
