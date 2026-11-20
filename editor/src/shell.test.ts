import { expect, test } from "bun:test";
import { ensureSyntaxTree, highlightingFor } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { highlightTree, tags } from "@lezer/highlight";
import { formatEditorText, IQUJI_EDITOR_PRESETS, isFormattablePreset, textPresetExtensions } from "./presets.js";

test("Shell 根据语法位置区分命令、管道、变量、引号和注释", () => {
  const doc = '# example\nif example-tool "$MODE" | filter; then example-tool plain; fi';
  const state = EditorState.create({ doc, extensions: textPresetExtensions("shell") });
  const colors = new Map<string, string>();
  const tree = ensureSyntaxTree(state, doc.length, 2000);
  if (!tree) throw new Error("Shell 样例未完成解析。");
  highlightTree(tree, { style: (types) => highlightingFor(state, types) }, (from, to, color) => {
    colors.set(doc.slice(from, to), color);
  });
  const examples = [
    ["# example", tags.comment], ["if", tags.keyword], ["example-tool", tags.name],
    ["filter", tags.name], ["|", tags.operator], ["$MODE", tags.variableName], ['"', tags.string],
  ] as const;
  for (const [value, type] of examples) {
    expect(colors.get(value)).toBeTruthy();
    expect(colors.get(value)).toBe(highlightingFor(state, [type])!);
  }
  expect(colors.has("plain")).toBe(false);
  expect(IQUJI_EDITOR_PRESETS).toContain("shell");
  expect(isFormattablePreset("shell")).toBe(false);
  expect(formatEditorText("shell", doc)).toBe(doc);
});
