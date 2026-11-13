import type { Editor, Extensions, JSONContent } from "@tiptap/core";
import { type UseEditorOptions, useEditor } from "@tiptap/react";
import { type ReactNode, useEffect, useRef } from "react";
import { IqujiEditorLayout } from "./editor-layout.js";
import { IqujiRichTextContent } from "./rich-text-content.js";

export interface IqujiRichTextAssembly {
  extensions: Extensions;
  serialize?(content: JSONContent): JSONContent;
}
export type IqujiRichTextOptions = UseEditorOptions & {
  assembly: IqujiRichTextAssembly;
};

/** 文档 schema 通过装配注入，公共编辑器不识别业务引用或保存协议。 */
export function useIqujiRichTextEditor({
  assembly,
  ...options
}: IqujiRichTextOptions) {
  return useEditor({
    ...options,
    extensions: assembly.extensions,
    immediatelyRender: false,
  });
}
export interface IqujiRichTextEditorProps {
  assembly: IqujiRichTextAssembly;
  value: JSONContent;
  onChange(value: JSONContent): void;
  readOnly?: boolean;
  ariaLabel: string;
  toolbar?: ReactNode | ((editor: Editor | null) => ReactNode);
  footer?: ReactNode;
  onReady?(editor: Editor | null): void;
}
export function IqujiRichTextEditor(props: IqujiRichTextEditorProps) {
  const current = useRef(props);
  current.current = props;
  const editor = useIqujiRichTextEditor({
    assembly: props.assembly,
    content: props.value,
    editable: !props.readOnly,
    editorProps: {
      attributes: { "aria-label": props.ariaLabel, class: "iquji-rich-editor" },
    },
    onUpdate: ({ editor: value }) =>
      current.current.onChange(
        current.current.assembly.serialize?.(value.getJSON()) ??
          value.getJSON(),
      ),
  });
  useEffect(() => {
    current.current.onReady?.(editor);
    return () => current.current.onReady?.(null);
  }, [editor]);
  useEffect(() => {
    if (
      !editor ||
      editor.isDestroyed ||
      JSON.stringify(editor.getJSON()) === JSON.stringify(props.value)
    )
      return;
    editor.commands.setContent(props.value, false);
  }, [editor, props.value]);
  useEffect(() => {
    editor?.setEditable(!props.readOnly, false);
  }, [editor, props.readOnly]);
  return (
    <IqujiEditorLayout
      toolbar={
        typeof props.toolbar === "function"
          ? props.toolbar(editor)
          : props.toolbar
      }
      footer={props.footer}
    >
      <IqujiRichTextContent editor={editor} />
    </IqujiEditorLayout>
  );
}
