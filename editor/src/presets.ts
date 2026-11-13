import { json, jsonParseLinter } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { yaml } from "@codemirror/lang-yaml";
import { StreamLanguage } from "@codemirror/language";
import { toml as tomlMode } from "@codemirror/legacy-modes/mode/toml";
import { type Diagnostic, linter } from "@codemirror/lint";
import type { Extension } from "@codemirror/state";
import { TomlError, parse } from "smol-toml";
import { parseDocument } from "yaml";

export type IqujiTextPreset = "markdown" | "json" | "yaml" | "toml" | "text";
export type IqujiEditorPreset = "richText" | IqujiTextPreset;
export const IQUJI_EDITOR_PRESETS = [
  "richText",
  "markdown",
  "json",
  "yaml",
  "toml",
  "text",
] as const;

/** TOML 只提供高亮与语法诊断，不提供格式化：自动重排会丢失注释与键顺序。 */
export const IQUJI_FORMATTABLE_PRESETS = ["json", "yaml"] as const;

export function isFormattablePreset(preset: IqujiTextPreset): boolean {
  return (IQUJI_FORMATTABLE_PRESETS as readonly string[]).includes(preset);
}

export function textPresetExtensions(preset: IqujiTextPreset): Extension[] {
  if (preset === "markdown") return [markdown()];
  if (preset === "json") return [json(), linter(jsonParseLinter())];
  if (preset === "yaml")
    return [
      yaml(),
      linter((view) => yamlDiagnostics(view.state.doc.toString())),
    ];
  if (preset === "toml")
    return [
      StreamLanguage.define(tomlMode),
      linter((view) => tomlDiagnostics(view.state.doc.toString())),
    ];
  return [];
}
export function yamlDiagnostics(value: string): Diagnostic[] {
  return parseDocument(value, { uniqueKeys: true }).errors.map((error) => ({
    from: Math.min(error.pos[0], value.length),
    to: Math.min(Math.max(error.pos[1], error.pos[0] + 1), value.length),
    severity: "error",
    message: error.message,
  }));
}
export function tomlDiagnostics(value: string): Diagnostic[] {
  if (value.trim() === "") return [];
  try {
    parse(value);
    return [];
  } catch (error) {
    if (!(error instanceof TomlError)) throw error;
    const from = offsetOfLineColumn(value, error.line, error.column);
    return [
      {
        from,
        to: Math.min(from + 1, value.length),
        severity: "error",
        message: error.message.split("\n")[0]?.trim() || "TOML 语法错误",
      },
    ];
  }
}
/** 行号从 1 起、列号从 1 起，与 smol-toml 的错误定位一致。 */
function offsetOfLineColumn(value: string, line: number, column: number): number {
  let offset = 0;
  for (let index = 1; index < line; index += 1) {
    const next = value.indexOf("\n", offset);
    if (next < 0) return Math.min(offset, value.length);
    offset = next + 1;
  }
  return Math.min(offset + Math.max(column - 1, 0), value.length);
}
export function formatEditorText(
  preset: IqujiTextPreset,
  value: string,
): string {
  if (preset === "json")
    return `${JSON.stringify(JSON.parse(value), null, 2)}\n`;
  if (preset === "yaml") {
    const document = parseDocument(value, { uniqueKeys: true });
    if (document.errors.length) throw new Error(document.errors[0]?.message);
    return document.toString();
  }
  return value;
}
