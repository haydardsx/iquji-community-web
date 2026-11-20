export const EDITOR_HIGHLIGHT_COLORS = [
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
] as const;
export type EditorHighlightPreset = (typeof EDITOR_HIGHLIGHT_COLORS)[number];
export type EditorColor = `#${string}`;
export type EditorHighlightColor = EditorHighlightPreset | EditorColor;
export const EDITOR_HIGHLIGHT_PALETTE: Record<
  EditorHighlightPreset,
  EditorColor
> = {
  yellow: "#fef08a",
  green: "#bbf7d0",
  blue: "#bfdbfe",
  purple: "#ddd6fe",
  pink: "#fbcfe8",
};
export const EDITOR_TEXT_PALETTE = [
  "#171717",
  "#525252",
  "#b91c1c",
  "#c2410c",
  "#a16207",
  "#15803d",
  "#0e7490",
  "#1d4ed8",
  "#7e22ce",
  "#be185d",
] as const;
export const isEditorColor = (value: unknown): value is EditorColor =>
  typeof value === "string" && /^#[0-9a-f]{6}$/u.test(value);
export const isEditorHighlightColor = (
  value: unknown,
): value is EditorHighlightColor =>
  isEditorColor(value) ||
  EDITOR_HIGHLIGHT_COLORS.includes(value as EditorHighlightPreset);
export const editorHighlightCss = (value: EditorHighlightColor): string =>
  isEditorColor(value) ? value : EDITOR_HIGHLIGHT_PALETTE[value];
