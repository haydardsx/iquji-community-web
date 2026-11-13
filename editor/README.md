# Web Editor

`@iquji-web/web-editor` 是 React 编辑器公共实现，统一通过 `dist` 导出。导入 `@iquji-web/web-editor/styles.css` 装配基础样式。

- `IqujiTextEditor`：`markdown`、`json`、`yaml`、`text` 源码预设，CodeMirror 6 管理输入、选区、历史和语法诊断。Markdown 预览不改变源码；JSON/YAML 格式化由显式操作触发，非法源码仍可编辑。
- `IqujiRichTextEditor`、`useIqujiRichTextEditor`：Tiptap 富文本装配。`createRichTextPreset()` 提供基础 schema；宿主也可直接注入自己的 extensions 和 serialize。
- `IqujiRichTextContent`、`IqujiRichTextToolbar`、`IqujiEditorViewport`：供复杂宿主组合正文、工具栏和页面布局；节点扩展、工具插槽及底部 AI UI 由宿主注入。
- `IqujiEditorColorControl`：文字色与背景色的精确选区适配。浮层打开期间正文或选区变化后拒绝旧操作；普通关闭不会强抢外部焦点。

公共包不读取项目身份、网络、文件系统、知识引用或 AI 会话，也不负责保存、发布或执行文件。`documentKey` 改变会为源码文件建立独立编辑器实例；同一文件的预览切换保留历史。AI 接受、撤销及跨文件草稿由宿主负责，不能写进通用编辑器。

颜色协议：`textColor.attrs.color` 为小写六位十六进制，默认文字色通过删除 mark 表示。`highlight` 保留 yellow/green/blue/purple/pink，支持相同规范的自定义颜色。应用持久化方必须使用匹配的正文合同。

执行 `bun run check` 验证产物、类型和公共行为。
