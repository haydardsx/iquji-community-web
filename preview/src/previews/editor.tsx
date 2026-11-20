import { IqujiButton } from "@iquji-community/web-component";
import {
  createRichTextPreset,
  EDITOR_ALIGNMENT_TOOLS,
  EDITOR_HIGHLIGHT_COLORS,
  EDITOR_HIGHLIGHT_PALETTE,
  EDITOR_TEXT_PALETTE,
  EditorHighlight,
  type EditorHighlightPreset,
  EditorTextColor,
  editorHighlightCss,
  formatEditorText,
  IQUJI_EDITOR_PRESETS,
  IQUJI_FORMATTABLE_PRESETS,
  IqujiEditorColorControl,
  IqujiEditorLayout,
  IqujiEditorViewport,
  IqujiRichTextContent,
  IqujiRichTextEditor,
  type IqujiRichTextEditorProps,
  IqujiRichTextToolbar,
  IqujiTextEditor,
  type IqujiTextSelection,
  isEditorColor,
  isEditorHighlightColor,
  isFormattablePreset,
  renderEditorMarkdown,
  textPresetExtensions,
  tomlDiagnostics,
  useIqujiRichTextEditor,
  yamlDiagnostics,
} from "@iquji-community/web-editor";
import { useEffect, useMemo, useState } from "react";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

const PRESETS = ["markdown", "json", "yaml", "toml", "shell", "text"] as const;
type TextPreset = (typeof PRESETS)[number];

type BilingualText = readonly [chinese: string, english: string];

const SAMPLE_VALUES: Record<TextPreset, BilingualText> = {
  markdown: [
    "# 社区编辑器\n\n编辑源码或切换预览。预览会清理 HTML。",
    "# Community editor\n\nEdit the source or switch to the preview, which sanitizes HTML.",
  ],
  json: ['{\n  "ready": true\n}\n', '{\n  "ready": true\n}\n'],
  yaml: ["ready: true\n", "ready: true\n"],
  shell: [
    '# 示例\nprintf "%s\\n" "$MESSAGE" | sort\n',
    '# Example\nprintf "%s\\n" "$MESSAGE" | sort\n',
  ],
  toml: [
    'host = "example.com"\nport = 8080\n',
    'host = "example.com"\nport = 8080\n',
  ],
  text: ["这是一个纯文本编辑器预设。", "This is the plain-text editor preset."],
};

const COLOR_LABELS: Record<EditorHighlightPreset, BilingualText> = {
  yellow: ["黄色", "Yellow"],
  green: ["绿色", "Green"],
  blue: ["蓝色", "Blue"],
  purple: ["紫色", "Purple"],
  pink: ["粉色", "Pink"],
};

const TOOLBAR_TEXT: Record<string, BilingualText> = {
  toolbar: ["富文本工具栏", "Rich text toolbar"],
  toolbarText: ["文字格式", "Text formatting"],
  toolbarDocument: ["文档格式", "Document formatting"],
  toolbarStyles: ["文字样式", "Text styles"],
  toolbarMarks: ["文字标记", "Text marks"],
  toolbarHistory: ["编辑历史", "Edit history"],
  toolbarParagraph: ["段落格式", "Paragraph formatting"],
  toolbarAlignment: ["段落对齐", "Paragraph alignment"],
  toolbarView: ["视图", "View"],
  textStyle: ["文字样式", "Text style"],
  paragraph: ["正文", "Paragraph"],
  heading1: ["一级标题", "Heading 1"],
  heading2: ["二级标题", "Heading 2"],
  heading3: ["三级标题", "Heading 3"],
  bold: ["加粗", "Bold"],
  italic: ["斜体", "Italic"],
  underline: ["下划线", "Underline"],
  undo: ["撤销", "Undo"],
  redo: ["重做", "Redo"],
  bulletList: ["无序列表", "Bulleted list"],
  orderedList: ["有序列表", "Numbered list"],
  "align.left": ["左对齐", "Align left"],
  "align.center": ["居中对齐", "Center"],
  "align.right": ["右对齐", "Align right"],
  "align.justify": ["两端对齐", "Justify"],
  zoomOut: ["缩小", "Zoom out"],
  resetZoom: ["恢复缩放", "Reset zoom"],
  zoomIn: ["放大", "Zoom in"],
};

function EditorUtilities() {
  const t = usePreviewText();
  const markdown = renderEditorMarkdown(
    t("**安全的 Markdown**", "**Sanitized Markdown**") +
      "\n\n<script></script>",
  );
  const formatted = formatEditorText("json", '{"ready":true}');
  const diagnostics = yamlDiagnostics("ready: true\nready: false");
  const tomlIssues = tomlDiagnostics("serverPort = \n");
  const extensions = textPresetExtensions("json");
  const validColor = isEditorColor("#1d4ed8");
  const validHighlight = isEditorHighlightColor("yellow");
  return (
    <div className="catalog-preview-stack">
      <IqujiEditorLayout
        footer={
          <span className="catalog-preview-copy">
            {t(
              "应用可以传入底部内容。",
              "The application can supply a footer.",
            )}
          </span>
        }
        toolbar={
          <span className="catalog-preview-copy">
            {t("工具栏插槽", "Toolbar slot")}
          </span>
        }
      >
        <p className="catalog-preview-copy">
          {t(
            "编辑器布局组合工具栏、正文和扩展插槽。",
            "The editor layout combines the toolbar, content, and slots.",
          )}
        </p>
      </IqujiEditorLayout>
      <div className="catalog-preview-grid">
        {EDITOR_HIGHLIGHT_COLORS.map((name) => (
          <span className="catalog-color-swatch" key={name}>
            <i style={{ backgroundColor: EDITOR_HIGHLIGHT_PALETTE[name] }} />
            {t(...COLOR_LABELS[name])}
          </span>
        ))}
      </div>
      <dl className="catalog-preview-copy">
        <dt>{t("文字色板", "Text palette")}</dt>
        <dd>
          {t(
            `${EDITOR_TEXT_PALETTE.length} 种颜色`,
            `${EDITOR_TEXT_PALETTE.length} colors`,
          )}
        </dd>
        <dt>{t("颜色校验", "Color validation")}</dt>
        <dd>
          <code>#1d4ed8</code>{" "}
          {validColor ? t("有效", "valid") : t("无效", "invalid")}
          {" · "}
          {t("黄色", "Yellow")} <code>{editorHighlightCss("yellow")}</code>{" "}
          {validHighlight ? t("有效", "valid") : t("无效", "invalid")}
        </dd>
        <dt>{t("可格式化的预设", "Formattable presets")}</dt>
        <dd>
          {IQUJI_FORMATTABLE_PRESETS.map((preset) => preset.toUpperCase()).join(
            t("、", ", "),
          )}
        </dd>
        <dt>{t("TOML 格式化支持", "TOML formatting support")}</dt>
        <dd>
          {isFormattablePreset("toml")
            ? t("支持", "Supported")
            : t("不支持", "Unsupported")}
        </dd>
        <dt>{t("JSON 扩展数量", "JSON extension count")}</dt>
        <dd>{extensions.length}</dd>
        <dt>{t("语法诊断数量", "Syntax diagnostic count")}</dt>
        <dd>
          YAML ({diagnostics.length}) · TOML ({tomlIssues.length})
        </dd>
        <dt>{t("富文本标记标识", "Rich text mark identifiers")}</dt>
        <dd>
          <code>{EditorHighlight.name}</code> ·{" "}
          <code>{EditorTextColor.name}</code>
        </dd>
      </dl>
      <code className="catalog-code-block">{formatted}</code>
      <code className="catalog-code-block">{markdown}</code>
    </div>
  );
}

function RichTextAssemblyDemo() {
  const t = usePreviewText();
  const [zoom, setZoom] = useState(100);
  const [edited, setEdited] = useState(false);
  const sample = useMemo<IqujiRichTextEditorProps["value"]>(
    () => ({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [
            { type: "text", text: t("正文排版工具", "Text formatting tools") },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: t(
                "选择文字后可调整颜色、格式与对齐方式。",
                "Select text to change its color, formatting, or alignment.",
              ),
            },
          ],
        },
      ],
    }),
    [t],
  );
  const assembly = useMemo(() => createRichTextPreset(), []);
  const editor = useIqujiRichTextEditor({
    assembly,
    content: sample,
    editable: true,
    editorProps: {
      attributes: {
        "aria-label": t("富文本排版示例", "Rich text formatting example"),
      },
    },
    onUpdate: () => setEdited(true),
  });
  useEffect(() => {
    if (
      !edited &&
      editor &&
      !editor.isDestroyed &&
      JSON.stringify(editor.getJSON()) !== JSON.stringify(sample)
    ) {
      editor.commands.setContent(sample, false);
    }
  }, [edited, editor, sample]);
  const labels = {
    label: t("文字颜色", "Text color"),
    defaultLabel: t("恢复默认", "Restore default"),
    customLabel: t("自定义颜色", "Custom color"),
    hexLabel: t("十六进制", "Hex value"),
    applyLabel: t("应用", "Apply"),
    cancelLabel: t("取消", "Cancel"),
  };
  const toolbar = (
    <IqujiRichTextToolbar
      editor={editor}
      onZoom={setZoom}
      slots={{
        marks: (
          <>
            <IqujiEditorColorControl
              colorLabel={(color) =>
                isEditorHighlightColor(color) && !isEditorColor(color)
                  ? t(...COLOR_LABELS[color])
                  : color
              }
              editor={editor}
              kind="highlight"
              labels={{ ...labels, label: t("背景色", "Highlight color") }}
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
      t={(key) => {
        const label = TOOLBAR_TEXT[key];
        return label ? t(...label) : key;
      }}
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
        "zoom",
        ...Object.values(EDITOR_ALIGNMENT_TOOLS),
      ]}
      zoom={zoom}
    />
  );
  return (
    <IqujiEditorViewport
      footer={
        <span className="catalog-preview-copy">
          {t(`本地草稿 · 缩放 ${zoom}%`, `Local draft · Zoom ${zoom}%`)}
        </span>
      }
      toolbar={toolbar}
      zoom={zoom}
    >
      <IqujiRichTextContent editor={editor} />
    </IqujiEditorViewport>
  );
}

function EditorDemo() {
  const t = usePreviewText();
  const [preset, setPreset] = useState<TextPreset>("markdown");
  const [draft, setDraft] = useState<string>();
  const [selection, setSelection] = useState<IqujiTextSelection>();
  const [richDraft, setRichDraft] =
    useState<IqujiRichTextEditorProps["value"]>();
  const value = draft ?? t(...SAMPLE_VALUES[preset]);
  const richValue = richDraft ?? {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: t(
              "应用提供富文本内容和保存逻辑。",
              "The application supplies the rich text content and save logic.",
            ),
          },
        ],
      },
    ],
  };
  const assembly = useMemo(() => createRichTextPreset(), []);
  const presetLabel = (option: (typeof IQUJI_EDITOR_PRESETS)[number]) => {
    if (option === "shell") return "Shell";
    if (option === "text") return t("纯文本", "Plain text");
    if (option === "richText") return t("富文本", "Rich text");
    return option === "markdown" ? "Markdown" : option.toUpperCase();
  };

  return (
    <div className="catalog-preview-stack catalog-preview-wide">
      <p className="catalog-preview-copy">
        {t("可用预设：", "Available presets: ")}
        {IQUJI_EDITOR_PRESETS.map(presetLabel).join(t("、", ", "))}
      </p>
      <div className="catalog-preview-grid">
        {PRESETS.map((option) => (
          <IqujiButton
            compact
            key={option}
            onClick={() => {
              setPreset(option);
              setDraft(undefined);
            }}
            variant={preset === option ? "primary" : "secondary"}
          >
            {presetLabel(option)}
          </IqujiButton>
        ))}
      </div>
      <IqujiTextEditor
        ariaLabel={t(
          `${presetLabel(preset)}编辑器`,
          `${presetLabel(preset)} editor`,
        )}
        footer={
          <span className="catalog-preview-copy">
            {t(
              "选区数据包含当前源码。",
              "Selection data includes the current source.",
            )}
          </span>
        }
        labels={{
          edit: t("编辑", "Edit"),
          preview: t("预览", "Preview"),
          format: t("格式化", "Format"),
          invalid: t("内容格式无效", "Invalid content format"),
        }}
        onChange={setDraft}
        onSelectionChange={setSelection}
        preset={preset}
        value={value}
      />
      <p className="catalog-preview-copy">
        {t(`当前源码长度：${value.length}`, `Source length: ${value.length}`)}
      </p>
      <p aria-live="polite" className="catalog-preview-copy">
        {t("当前选区：", "Current selection: ")}
        {selection?.text
          ? `${selection.from}–${selection.to} · ${selection.text}`
          : t("未选择文本", "No text selected")}
      </p>
      <IqujiRichTextEditor
        ariaLabel={t("富文本编辑器", "Rich text editor")}
        assembly={assembly}
        onChange={setRichDraft}
        value={richValue}
      />
      <p className="catalog-preview-copy">
        {t("富文本 JSON 节点数：", "Rich text JSON nodes: ")}
        {richValue.content?.length ?? 0}
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
    packageName: "@iquji-community/web-editor",
    category: "编辑器",
    description:
      "操作 Markdown、JSON、YAML、TOML、Shell 源码预设和富文本，并查看宿主组合、工具栏、选区与颜色协议。",
    keywords:
      "editor markdown json yaml toml shell text rich text tiptap toolbar colors config",
    render: () => <EditorDemo />,
  },
];
