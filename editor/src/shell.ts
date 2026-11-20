import { HighlightStyle, LRLanguage, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import { parser } from "@fig/lezer-bash";
import { parseMixed } from "@lezer/common";
import { styleTags, tags } from "@lezer/highlight";

// Bash 主语法保留命令位置；双引号内部由 Shell 分词器识别变量和转义。
const quotedShell = StreamLanguage.define(shell);
const language = LRLanguage.define({
  name: "shell",
  parser: parser.configure({
    props: [styleTags({ "CommandName/Literal": tags.function(tags.name) })],
    wrap: parseMixed((node) => node.name === "String" ? { parser: quotedShell.parser } : null),
  }),
  languageData: { commentTokens: { line: "#" } },
});

const colors = HighlightStyle.define([
  { tag: tags.name, color: "var(--iquji-color-info-text)" },
  { tag: tags.keyword, color: "var(--iquji-color-accent-strong)", fontWeight: "600" },
  { tag: tags.variableName, color: "var(--iquji-color-warning-text)" },
  { tag: tags.string, color: "var(--iquji-color-positive-text)" },
  { tag: tags.comment, color: "var(--iquji-color-muted)", fontStyle: "italic" },
  { tag: [tags.operator, tags.separator, tags.bracket], color: "var(--iquji-color-accent-strong)" },
]);

export const shellExtensions = [language, syntaxHighlighting(colors)];
