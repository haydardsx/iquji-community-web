import { afterEach, expect, test } from "bun:test";
import { undo } from "@codemirror/commands";
import type { EditorView } from "@codemirror/view";
import { Editor } from "@tiptap/core";
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiEditorColorControl } from "./editor-color-control.js";
import { IqujiRichTextToolbar } from "./rich-text-toolbar.js";
import { renderEditorMarkdown } from "./markdown.js";
import { formatEditorText } from "./presets.js";
import { IqujiRichTextContent } from "./rich-text-content.js";
import { createRichTextPreset } from "./rich-text-preset.js";
import { IqujiTextEditor } from "./text-editor.js";

let root: Root | null = null;
let host: HTMLDivElement | null = null;
afterEach(async () => {
  await act(async () => root?.unmount());
  host?.remove();
  root = null;
});
const labels = {
  edit: "编辑",
  preview: "预览",
  format: "格式化",
  invalid: "格式无效",
};
const click = async (label: string) => {
  const target = [...document.querySelectorAll("button")].find(
    (node) => node.textContent === label,
  );
  if (!target) throw new Error(label);
  await act(async () => target.click());
};

test("Markdown 源码和历史在预览往返后保留，预览剔除脚本和远程资源", async () => {
  let view: EditorView | null = null;
  let saved = "---\nname: demo\n---\n\n# 标题\n";
  function Harness() {
    const [value, setValue] = useState(saved);
    return (
      <IqujiTextEditor
        preset="markdown"
        value={value}
        onChange={(next) => {
          saved = next;
          setValue(next);
        }}
        ariaLabel="正文"
        labels={labels}
        onReady={(value) => {
          view = value;
        }}
        footer={<div>AI 插槽</div>}
      />
    );
  }
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () => root?.render(<Harness />));
  const current = view as EditorView | null;
  if (!current) throw new Error("编辑器未建立");
  await act(async () =>
    current.dispatch({
      changes: { from: current.state.doc.length, insert: "正文" },
    }),
  );
  await click("预览");
  await click("编辑");
  expect(view as EditorView | null).toBe(current);
  expect(saved).toEndWith("正文");
  await act(async () => undo(current));
  expect(saved).toBe("---\nname: demo\n---\n\n# 标题\n");
  expect(host.textContent).toContain("AI 插槽");
  const safe = renderEditorMarkdown(
    "<script>alert(1)</script>\n\n![图片](https://example.invalid/a.png)\n\n[链接](javascript:alert(1))",
  );
  expect(safe).not.toContain("<script");
  expect(safe).not.toContain("<img");
  expect(safe).not.toContain("javascript:");
});

test("JSON 和 YAML 格式化只接受合法源码，YAML 保留注释", () => {
  expect(formatEditorText("json", '{"a":1}')).toBe('{\n  "a": 1\n}\n');
  expect(() => formatEditorText("json", '{"a":')).toThrow();
  expect(() => formatEditorText("yaml", "a: [")).toThrow();
  expect(formatEditorText("yaml", "# 注释\na: 1\n")).toContain("# 注释");
  expect(formatEditorText("text", "  原文\r\n")).toBe("  原文\r\n");
});

test("富文本颜色覆盖精确选区且可撤销，拒绝 CSS 与非规范颜色", () => {
  const editor = new Editor({
    extensions: createRichTextPreset().extensions,
    content: "<p>前正文后</p>",
  });
  editor.commands.setTextSelection({ from: 2, to: 4 });
  expect(editor.commands.setTextColor("#123456")).toBe(true);
  expect(editor.commands.setHighlight({ color: "#a1b2c3" })).toBe(true);
  expect(editor.getJSON().content?.[0]?.content?.[1]?.marks).toEqual([
    { type: "highlight", attrs: { color: "#a1b2c3" } },
    { type: "textColor", attrs: { color: "#123456" } },
  ]);
  for (const color of ["red", "#ABCDEF", "#fff", "var(--color)"]) {
    expect(editor.commands.setTextColor(color)).toBe(false);
    expect(editor.commands.setHighlight({ color })).toBe(false);
  }
  expect(editor.commands.undo()).toBe(true);
  expect(editor.getText()).toBe("前正文后");
  editor.destroy();
});

test("富文本缩放工具使用紧凑图标按钮并保留可访问名称", () => {
  const editor = new Editor({
    extensions: createRichTextPreset().extensions,
    content: "<p>正文</p>",
  });
  const markup = renderToStaticMarkup(
    <IqujiRichTextToolbar
      editor={editor}
      tools={["zoom"]}
      zoom={100}
      onZoom={() => undefined}
      t={(key) =>
        ({ zoomOut: "缩小", zoomIn: "放大", resetZoom: "重置缩放", toolbar: "工具栏", toolbarDocument: "文档工具" })[
          key
        ] ?? key
      }
    />,
  );
  expect(markup.match(/iquji-icon-button--compact/gu)?.length).toBe(2);
  expect(markup.match(/width="15" height="15"/gu)?.length).toBe(2);
  expect(markup).toContain('aria-label="缩小"');
  expect(markup).toContain('aria-label="放大"');
  editor.destroy();
});

test("色板在等价正文重建后绑定当前文档选区，关闭后的旧按钮不再写入", async () => {
  const editor = new Editor({
    extensions: createRichTextPreset().extensions,
    content: "<p>前正文后</p>",
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root?.render(
      <>
        <IqujiRichTextContent editor={editor} />
        <IqujiEditorColorControl
          editor={editor}
          kind="highlight"
          labels={{
            label: "颜色",
            defaultLabel: "默认",
            customLabel: "自定义",
            hexLabel: "色值",
            applyLabel: "应用",
            cancelLabel: "取消",
          }}
          colorLabel={(value) => value}
        />
      </>,
    ),
  );
  await act(async () => {
    editor.view.focus();
    editor.commands.setTextSelection({ from: 2, to: 4 });
  });
  await click("颜色");
  const option = (label: string) =>
    [
      ...document.querySelectorAll<HTMLButtonElement>(
        ".iquji-popover-popup[data-open] button",
      ),
    ].find((node) => node.textContent === label);
  const blue = option("blue"),
    green = option("green");
  if (!blue || !green) throw new Error("色板未打开");
  await act(async () => {
    editor.commands.setContent(editor.getJSON(), false);
    editor.commands.setTextSelection({ from: 2, to: 4 });
  });
  await act(async () => blue.click());
  expect(editor.getJSON().content?.[0]?.content?.[1]?.marks).toEqual([
    { type: "highlight", attrs: { color: "blue" } },
  ]);
  await act(async () => green.click());
  expect(editor.getJSON().content?.[0]?.content?.[1]?.marks).toEqual([
    { type: "highlight", attrs: { color: "blue" } },
  ]);
  await act(async () => root?.unmount());
  root = null;
  editor.destroy();
});
