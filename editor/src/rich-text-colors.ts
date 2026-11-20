import { Mark, mergeAttributes } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import {
  editorHighlightCss,
  isEditorColor,
  isEditorHighlightColor,
} from "./colors.js";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlight: {
      setHighlight: (attrs?: { color?: string }) => ReturnType;
      toggleHighlight: (attrs?: { color?: string }) => ReturnType;
      unsetHighlight: () => ReturnType;
    };
    textColor: {
      setTextColor: (color: string) => ReturnType;
      unsetTextColor: () => ReturnType;
    };
  }
}
const colorGuard = (kind: string, valid: (value: unknown) => boolean) =>
  new Plugin({
    filterTransaction: (transaction) => {
      if (!transaction.docChanged && !transaction.storedMarksSet) return true;
      let accepted = true;
      const check = (
        marks: readonly {
          type: { name: string };
          attrs: Record<string, unknown>;
        }[],
      ) => {
        if (
          marks.some(
            (mark) => mark.type.name === kind && !valid(mark.attrs.color),
          )
        )
          accepted = false;
      };
      transaction.doc.descendants((node) => check(node.marks));
      check(transaction.storedMarks ?? []);
      return accepted;
    },
  });
export const EditorHighlight = Mark.create({
  name: "highlight",
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (node: HTMLElement) =>
          node.getAttribute("data-editor-highlight"),
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "mark",
        getAttrs: (node) => {
          const color = node.getAttribute("data-editor-highlight");
          return color === null || isEditorHighlightColor(color)
            ? { color }
            : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const color: unknown = HTMLAttributes.color;
    const attrs = isEditorHighlightColor(color)
      ? {
          "data-editor-highlight": color,
          style: isEditorColor(color)
            ? `background-color: ${editorHighlightCss(color)}`
            : undefined,
        }
      : {};
    return ["mark", attrs, 0];
  },
  addCommands() {
    return {
      setHighlight:
        (attrs) =>
        ({ commands }) =>
          attrs?.color !== undefined && !isEditorHighlightColor(attrs.color)
            ? false
            : commands.setMark(this.name, { color: attrs?.color ?? null }),
      toggleHighlight:
        (attrs) =>
        ({ commands }) =>
          attrs?.color !== undefined && !isEditorHighlightColor(attrs.color)
            ? false
            : commands.toggleMark(this.name, { color: attrs?.color ?? null }),
      unsetHighlight:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
  addProseMirrorPlugins() {
    return [
      colorGuard(
        this.name,
        (value) => value === null || isEditorHighlightColor(value),
      ),
    ];
  },
});
export const EditorTextColor = Mark.create({
  name: "textColor",
  addAttributes() {
    return { color: { default: null } };
  },
  parseHTML() {
    return [
      {
        tag: "span[data-editor-color]",
        getAttrs: (node) => {
          const color = node.getAttribute("data-editor-color");
          return isEditorColor(color) ? { color } : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const color: unknown = HTMLAttributes.color;
    return [
      "span",
      mergeAttributes(
        isEditorColor(color)
          ? {
              "data-editor-color": color,
              style: `color: ${color}`,
            }
          : {},
      ),
      0,
    ];
  },
  addCommands() {
    return {
      setTextColor:
        (color) =>
        ({ commands }) =>
          isEditorColor(color) && commands.setMark(this.name, { color }),
      unsetTextColor:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
  addProseMirrorPlugins() {
    return [colorGuard(this.name, isEditorColor)];
  },
});
