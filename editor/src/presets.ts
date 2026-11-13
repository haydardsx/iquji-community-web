import { json, jsonParseLinter } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { yaml } from "@codemirror/lang-yaml";
import { type Diagnostic, linter } from "@codemirror/lint";
import type { Extension } from "@codemirror/state";
import { parseDocument } from "yaml";

export type IqujiTextPreset = "markdown" | "json" | "yaml" | "text";
export type IqujiEditorPreset = "richText" | IqujiTextPreset;
export const IQUJI_EDITOR_PRESETS = [
  "richText",
  "markdown",
  "json",
  "yaml",
  "text",
] as const;

export function textPresetExtensions(preset: IqujiTextPreset): Extension[] {
  if (preset === "markdown") return [markdown()];
  if (preset === "json") return [json(), linter(jsonParseLinter())];
  if (preset === "yaml")
    return [
      yaml(),
      linter((view) => yamlDiagnostics(view.state.doc.toString())),
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
