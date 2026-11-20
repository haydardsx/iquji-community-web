import type { ReactNode } from "react";

export type EditorAlignment = "left" | "center" | "right" | "justify";
export type EditorFormatIconName =
  | EditorAlignment
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "code"
  | "highlight"
  | "image"
  | "link"
  | "divider"
  | "table"
  | "blockquote"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "formatBrush"
  | "find"
  | "attachment"
  | "indent"
  | "outdent"
  | "clearFormatting"
  | "undo"
  | "redo"
  | "minus"
  | "plus"
  | "chevron-down";

const paths: Record<Exclude<EditorFormatIconName, EditorAlignment>, string> = {
  bold: "M6 4h7a4 4 0 0 1 0 8H6V4Zm0 8h8a4 4 0 0 1 0 8H6v-8Z",
  italic: "M10 4h9M5 20h9M15 4 9 20",
  underline: "M6 3v7a6 6 0 0 0 12 0V3M4 21h16",
  strike:
    "M18 6c-1-2-3-3-6-3-4 0-6 2-6 5 0 2 2 3 6 4m-6 6c1 2 3 3 6 3 4 0 6-2 6-5 0-1-1-2-2-3M3 12h18",
  code: "m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16",
  highlight:
    "m9 11 6-6 5 5-6 6-5-5Zm0 0-3 3 4 4 3-3M6 14l-3 7 7-3M14 4l1-1 6 6-1 1M3 22h8",
  link: "m9 15 6-6m-4-3 2-2a5 5 0 0 1 7 7l-3 3a5 5 0 0 1-7 0m3 4-2 2a5 5 0 0 1-7-7l3-3a5 5 0 0 1 7 0",
  image: "M3 3h18v18H3V3Zm0 13 5-5 4 4 3-3 6 6M16 7h.01",
  divider: "M3 12h18M8 5h8M8 19h8",
  table: "M3 3h18v18H3V3Zm0 6h18M3 15h18M9 3v18M15 3v18",
  blockquote: "M10 5H4v8h6V5Zm0 8c0 4-2 6-5 7M21 5h-6v8h6V5Zm0 8c0 4-2 6-5 7",
  bulletList: "M9 5h12M9 12h12M9 19h12M3 5h.01M3 12h.01M3 19h.01",
  orderedList:
    "M9 5h12M9 12h12M9 19h12M2 3h1v5M2 8h2M2 12c3-2 3 1 1 2l-1 2h3M2 19h2l-1 1c3 0 2 3-1 2",
  taskList: "M9 5h12M9 12h12M9 19h12M2 4l2 2 3-3M2 11l2 2 3-3M2 18l2 2 3-3",
  formatBrush: "M3 3h14v7H3V3Zm14 3h4v8H10v4M8 18h4v4H8v-4Z",
  find: "M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-2 4 7 7",
  attachment: "m9 17 9-9a3 3 0 0 0-4-4L4 14a5 5 0 0 0 7 7L21 11M7 15l9-9",
  indent: "M3 4h18M3 20h18M12 9h9M12 15h9m-18-7 4 4-4 4M7 12H2",
  outdent: "M3 4h18M3 20h18M12 9h9M12 15h9m-14-7-4 4 4 4M3 12h5",
  clearFormatting:
    "M4 4h14M11 4l-3 12m5 1 5-5 5 5-5 5h-3l-4-4 2-1Zm0 0 5 5M2 21h7",
  undo: "M8 4 3 9l5 5M3 9h10a7 7 0 0 1 7 7v4",
  redo: "m16 4 5 5-5 5m5-5H11a7 7 0 0 0-7 7v4",
  minus: "M4 12h16",
  plus: "M4 12h16M12 4v16",
  "chevron-down": "m6 9 6 6 6-6",
};

export function EditorFormatIcon({ name }: { name: EditorFormatIconName }) {
  let shape: ReactNode;
  if (
    name === "left" ||
    name === "center" ||
    name === "right" ||
    name === "justify"
  ) {
    const shortStart = name === "right" ? 9 : name === "center" ? 6 : 3;
    const shortEnd = name === "left" ? 15 : name === "center" ? 18 : 21;
    shape = (
      <path
        d={`M3 4h18M3 14h18M${shortStart} 9h${shortEnd - shortStart}M${shortStart} 19h${shortEnd - shortStart}`}
      />
    );
  } else shape = <path d={paths[name]} />;
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {shape}
    </svg>
  );
}
