import { IqujiButton } from "@iquji-cloud/web-component";
import {
  createRichTextPreset,
  EDITOR_ALIGNMENT_TOOLS,
  EDITOR_HIGHLIGHT_COLORS,
  EDITOR_HIGHLIGHT_PALETTE,
  EDITOR_TEXT_PALETTE,
  EditorHighlight,
  EditorTextColor,
  editorHighlightCss,
  formatEditorText,
  IQUJI_EDITOR_PRESETS,
  IqujiEditorColorControl,
  IqujiEditorLayout,
  IqujiEditorViewport,
  IqujiRichTextContent,
  IqujiRichTextEditor,
  type IqujiRichTextEditorProps,
  IqujiRichTextToolbar,
  IqujiTextEditor,
  isEditorColor,
  isEditorHighlightColor,
  renderEditorMarkdown,
  textPresetExtensions,
  useIqujiRichTextEditor,
  yamlDiagnostics,
} from "@iquji-cloud/web-editor";
import { useMemo, useState } from "react";
import type { ComponentPreview } from "../catalog";

const PRESETS = ["markdown", "json", "yaml", "text"] as const;
type TextPreset = (typeof PRESETS)[number];

const SAMPLE_VALUES: Record<TextPreset, string> = {
  markdown: "# Community editor\n\n编辑源码或切换预览，HTML 会被安全清理。",
  json: '{\n  "package": "web-editor",\n  "ready": true\n}\n',
  yaml: "package: web-editor\nready: true\n",
  text: "这是一个纯文本编辑器预设。",
};

function EditorUtilities() {
  const markdown = renderEditorMarkdown(
    "**安全 Markdown**\n\n<script>alert(1)</script>",
  );
  const formatted = formatEditorText("json", '{"ready":true}');
  const diagnostics = yamlDiagnostics("ready: true\nready: false");
  const extensions = textPresetExtensions("json");
  const validColor = isEditorColor("#1d4ed8");
  const validHighlight = isEditorHighlightColor("yellow");
  return (
    <div className="catalog-preview-stack">
      <IqujiEditorLayout
        footer={
          <span className="catalog-preview-copy">底部插槽由宿主提供。</span>
        }
        toolbar={<span className="catalog-preview-copy">工具栏插槽</span>}
      >
        <p className="catalog-preview-copy">
          IqujiEditorLayout 只组合工具栏、正文和扩展插槽。
        </p>
      </IqujiEditorLayout>
      <div className="catalog-preview-grid">
        {EDITOR_HIGHLIGHT_COLORS.map((name) => (
          <span className="catalog-color-swatch" key={name}>
            <i style={{ backgroundColor: EDITOR_HIGHLIGHT_PALETTE[name] }} />
            {name}
          </span>
        ))}
      </div>
      <p className="catalog-preview-copy">
        文字色板 {EDITOR_TEXT_PALETTE.length} 色；合法文字色{" "}
        {String(validColor)}；合法背景色 {String(validHighlight)}； yellow
        背景色 {editorHighlightCss("yellow")}； JSON 扩展 {extensions.length}{" "}
        个；重复 YAML 键诊断 {diagnostics.length} 条；富文本 mark：
        {EditorHighlight.name}/{EditorTextColor.name}。
      </p>
      <code className="catalog-code-block">{formatted}</code>
      <code className="catalog-code-block">{markdown}</code>
    </div>
  );
}

function RichTextAssemblyDemo() {
  const [zoom, setZoom] = useState(100);
  const [value, setValue] = useState<IqujiRichTextEditorProps["value"]>({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "可装配的正文工具" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "选择文字后可调整颜色、格式与对齐方式。" },
        ],
      },
    ],
  });
  const assembly = useMemo(() => createRichTextPreset(), []);
  const editor = useIqujiRichTextEditor({
    assembly,
    content: value,
    editable: true,
    onUpdate: ({ editor: current }) => setValue(current.getJSON()),
  });
  const labels = {
    label: "文字颜色",
    defaultLabel: "恢复默认",
    customLabel: "自定义颜色",
    hexLabel: "十六进制",
    applyLabel: "应用",
    cancelLabel: "取消",
  };
  const toolbar = (
    <IqujiRichTextToolbar
      actions={
        <IqujiButton
          onClick={() => setZoom((current) => Math.min(current + 10, 150))}
        >
          放大
        </IqujiButton>
      }
      canClear
      editor={editor}
      onClear={() => editor?.chain().focus().unsetAllMarks().run()}
      onZoom={setZoom}
      slots={{
        marks: (
          <>
            <IqujiEditorColorControl
              colorLabel={(color) => color}
              editor={editor}
              kind="highlight"
              labels={{ ...labels, label: "背景色" }}
            />
            <IqujiEditorColorControl
              colorLabel={(color) => color}
              editor={editor}
              kind="textColor"
              labels={labels}
            />
          </>
        ),
      }}
      t={(key) => key}
      tools={[
        "textStyle",
        "bold",
        "italic",
        "underline",
        "highlight",
        "textColor",
        "undo",
        "redo",
        "bulletList",
        "orderedList",
        ...Object.values(EDITOR_ALIGNMENT_TOOLS),
      ]}
      zoom={zoom}
    />
  );
  return (
    <IqujiEditorViewport
      footer={
        <span className="catalog-preview-copy">本地草稿；缩放 {zoom}%</span>
      }
      toolbar={toolbar}
      zoom={zoom}
    >
      <IqujiRichTextContent editor={editor} />
    </IqujiEditorViewport>
  );
}

function EditorDemo() {
  const [preset, setPreset] = useState<TextPreset>("markdown");
  const [value, setValue] = useState(SAMPLE_VALUES.markdown);
  const [selection, setSelection] = useState("未选择文本");
  const [richValue, setRichValue] = useState({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "富文本组件的内容和保存协议由宿主注入。" },
        ],
      },
    ],
  });
  const assembly = useMemo(() => createRichTextPreset(), []);

  return (
    <div className="catalog-preview-stack catalog-preview-wide">
      <p className="catalog-preview-copy">
        可用预设：{IQUJI_EDITOR_PRESETS.join("、")}
      </p>
      <div className="catalog-preview-grid">
        {PRESETS.map((option) => (
          <IqujiButton
            compact
            key={option}
            onClick={() => {
              setPreset(option);
              setValue(SAMPLE_VALUES[option]);
            }}
            variant={preset === option ? "primary" : "secondary"}
          >
            {option}
          </IqujiButton>
        ))}
      </div>
      <IqujiTextEditor
        ariaLabel={`${preset} 源码编辑器`}
        footer={
          <span className="catalog-preview-copy">选择会同时包含当前源码。</span>
        }
        labels={{
          edit: "编辑",
          preview: "预览",
          format: "格式化",
          invalid: "内容格式无效",
        }}
        onChange={setValue}
        onSelectionChange={(next) =>
          setSelection(
            next.text ? `${next.from}-${next.to}: ${next.text}` : "未选择文本",
          )
        }
        preset={preset}
        value={value}
      />
      <p className="catalog-preview-copy">当前源码长度：{value.length}</p>
      <p aria-live="polite" className="catalog-preview-copy">
        当前选区：{selection}
      </p>
      <IqujiRichTextEditor
        ariaLabel="富文本编辑器"
        assembly={assembly}
        onChange={setRichValue}
        value={richValue}
      />
      <p className="catalog-preview-copy">
        富文本 JSON 节点：{richValue.content?.length ?? 0} 个
      </p>
      <RichTextAssemblyDemo />
      <EditorUtilities />
    </div>
  );
}

export const editorPreviews: readonly ComponentPreview[] = [
  {
    id: "editor-presets",
    name: "源码与富文本编辑器",
    packageId: "editor",
    packageName: "@iquji-cloud/web-editor",
    category: "编辑器",
    description:
      "操作源码预设和富文本，并查看宿主组合、工具栏、选区与颜色协议。",
    keywords: "editor markdown json yaml text rich text tiptap toolbar colors",
    render: () => <EditorDemo />,
  },
];
