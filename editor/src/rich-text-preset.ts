import type { Extensions } from "@tiptap/core";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorHighlight, EditorTextColor } from "./rich-text-colors.js";
import type { IqujiRichTextAssembly } from "./rich-text-editor.js";

/** 默认正文预设；引用、附件身份与协作绑定通过宿主扩展加入。 */
export function createRichTextPreset(
  extensions: Extensions = [],
): IqujiRichTextAssembly {
  return {
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      EditorHighlight,
      EditorTextColor,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: null,
      }),
      ...extensions,
    ],
  };
}
