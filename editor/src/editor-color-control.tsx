import {
  IqujiColorPicker,
  type IqujiColorPickerProps,
} from "@iquji-cloud/web-component";
import type { Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import { useEditorState } from "@tiptap/react";
import { type ReactElement, useEffect, useRef } from "react";
import {
  EDITOR_HIGHLIGHT_COLORS,
  EDITOR_HIGHLIGHT_PALETTE,
  EDITOR_TEXT_PALETTE,
  editorHighlightCss,
  isEditorColor,
  isEditorHighlightColor,
} from "./colors.js";

export interface IqujiEditorColorControlProps {
  editor: Editor | null;
  kind: "highlight" | "textColor";
  disabled?: boolean | undefined;
  selectionOnly?: boolean | undefined;
  trigger?: ReactElement | undefined;
  labels: Pick<
    IqujiColorPickerProps,
    | "label"
    | "defaultLabel"
    | "customLabel"
    | "hexLabel"
    | "applyLabel"
    | "cancelLabel"
  >;
  colorLabel(value: string): string;
}
export function IqujiEditorColorControl({
  editor,
  kind,
  disabled = false,
  selectionOnly = false,
  trigger,
  labels,
  colorLabel,
}: IqujiEditorColorControlProps) {
  const captured = useRef<{ editor: Editor; state: EditorState } | null>(null);
  const open = useRef(false);
  const changed = useRef(false);
  const returnFocus = useRef(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: value }) => ({
      color: value?.getAttributes(kind).color as unknown,
      allowed: Boolean(
        value?.isEditable &&
          (!selectionOnly || !value.state.selection.empty) &&
          value.can().setMark(kind, {
            color: kind === "highlight" ? "yellow" : "#171717",
          }),
      ),
    }),
  });
  const color =
    kind === "highlight" && isEditorHighlightColor(state?.color)
      ? editorHighlightCss(state.color)
      : isEditorColor(state?.color)
        ? state.color
        : null;
  const blocked = disabled || !state?.allowed;
  useEffect(
    () => () => {
      if (editor && !editor.isDestroyed)
        editor.view.dom.removeAttribute("data-editor-color-menu-open");
    },
    [editor],
  );
  return (
    <IqujiColorPicker
      {...labels}
      value={color}
      disabled={blocked}
      trigger={trigger}
      presets={
        kind === "highlight"
          ? EDITOR_HIGHLIGHT_COLORS.map((name) => ({
              value: EDITOR_HIGHLIGHT_PALETTE[name],
              label: colorLabel(name),
            }))
          : EDITOR_TEXT_PALETTE.map((value) => ({
              value,
              label: colorLabel(value),
            }))
      }
      onOpenChange={(next, reason) => {
        returnFocus.current =
          !next &&
          ["selection", "cancel", "escape-key", "trigger-press"].includes(
            reason,
          );
        open.current = next;
        if (!editor || editor.isDestroyed) return;
        if (next) {
          changed.current = false;
          captured.current = { editor, state: editor.state };
          editor.view.dom.setAttribute("data-editor-color-menu-open", "");
        } else editor.view.dom.removeAttribute("data-editor-color-menu-open");
      }}
      finalFocus={() => {
        if (
          open.current ||
          !returnFocus.current ||
          !editor ||
          editor.isDestroyed ||
          !editor.isEditable ||
          captured.current?.editor !== editor
        )
          return false;
        // 保留 ProseMirror 的范围；浮层默认 DOM focus 不能恢复正文选区。
        if (
          changed.current ||
          captured.current.state.doc.eq(editor.state.doc)
        ) {
          editor.view.focus();
          return editor.view.dom;
        }
        return false;
      }}
      onChange={(value) => {
        const original = captured.current;
        if (
          !open.current ||
          !editor ||
          editor.isDestroyed ||
          !editor.isEditable ||
          blocked ||
          original?.editor !== editor ||
          !original.state.doc.eq(editor.state.doc) ||
          !original.state.selection.eq(editor.state.selection)
        )
          return;
        // 先恢复正文 DOM 选区，避免宿主浮层把色板内的 DOM 选区发布为无效文字选择。
        editor.view.focus();
        if (
          !original.state.doc.eq(editor.state.doc) ||
          !original.state.selection.eq(editor.state.selection)
        )
          return;
        // 等价文档也可能已被重建，Selection 必须重新绑定当前 doc，不能复用旧 ResolvedPos。
        const selection = original.state.selection
          .getBookmark()
          .resolve(editor.state.doc);
        editor.view.dispatch(editor.state.tr.setSelection(selection));
        const chain = editor.chain();
        if (value === null) chain.unsetMark(kind).run();
        else {
          const name =
            kind === "highlight"
              ? EDITOR_HIGHLIGHT_COLORS.find(
                  (entry) => EDITOR_HIGHLIGHT_PALETTE[entry] === value,
                )
              : undefined;
          chain.setMark(kind, { color: name ?? value }).run();
        }
        changed.current = true;
      }}
    />
  );
}
