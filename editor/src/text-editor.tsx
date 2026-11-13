import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import {
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from "@codemirror/language";
import { lintGutter } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import {
  Annotation,
  Compartment,
  EditorState,
  Transaction,
} from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
} from "@codemirror/view";
import { IqujiButton } from "@iquji-web/web-component";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { IqujiEditorLayout } from "./editor-layout.js";
import { renderEditorMarkdown } from "./markdown.js";
import {
  formatEditorText,
  type IqujiTextPreset,
  textPresetExtensions,
} from "./presets.js";

const externalUpdate = Annotation.define<boolean>();

export type IqujiTextSelection = {
  from: number;
  to: number;
  text: string;
  document: string;
};
export interface IqujiTextEditorProps {
  preset: IqujiTextPreset;
  value: string;
  onChange(value: string): void;
  ariaLabel: string;
  labels: { edit: string; preview: string; format: string; invalid: string };
  documentKey?: string | undefined;
  readOnly?: boolean | undefined;
  footer?: ReactNode;
  className?: string | undefined;
  onSelectionChange?(selection: IqujiTextSelection): void;
  onReady?(view: EditorView | null): void;
}

export function IqujiTextEditor(props: IqujiTextEditorProps) {
  const { preset, value, documentKey, readOnly = false, labels } = props;
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView | null>(null);
  const current = useRef(props);
  current.current = props;
  const editable = useRef(new Compartment());
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!host.current) return;
    setPreview(false);
    setError("");
    const notifySelection = (view: EditorView) => {
      const range = view.state.selection.main;
      current.current.onSelectionChange?.({
        from: range.from,
        to: range.to,
        text: view.state.sliceDoc(range.from, range.to),
        document: view.state.doc.toString(),
      });
    };
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: current.current.value,
        extensions: [
          lineNumbers(),
          history(),
          drawSelection(),
          highlightActiveLine(),
          indentOnInput(),
          bracketMatching(),
          highlightSelectionMatches(),
          syntaxHighlighting(defaultHighlightStyle),
          lintGutter(),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({
            "aria-label": current.current.ariaLabel,
            spellcheck: "false",
            "data-document-key": documentKey ?? "",
          }),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            indentWithTab,
          ]),
          editable.current.of([
            EditorState.readOnly.of(Boolean(current.current.readOnly)),
            EditorView.editable.of(!current.current.readOnly),
          ]),
          ...textPresetExtensions(preset),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setError("");
              if (
                !update.transactions.some((transaction) =>
                  transaction.annotation(externalUpdate),
                )
              )
                current.current.onChange(update.state.doc.toString());
            }
            if (update.docChanged || update.selectionSet)
              notifySelection(update.view);
          }),
        ],
      }),
    });
    editor.current = view;
    current.current.onReady?.(view);
    notifySelection(view);
    return () => {
      current.current.onReady?.(null);
      editor.current = null;
      view.destroy();
    };
  }, [preset, documentKey]);
  useEffect(() => {
    const view = editor.current;
    if (!view || view.state.doc.toString() === value) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
      selection: {
        anchor: Math.min(view.state.selection.main.anchor, value.length),
        head: Math.min(view.state.selection.main.head, value.length),
      },
      annotations: [
        Transaction.addToHistory.of(false),
        externalUpdate.of(true),
      ],
    });
  }, [value]);
  useEffect(() => {
    editor.current?.dispatch({
      effects: editable.current.reconfigure([
        EditorState.readOnly.of(readOnly),
        EditorView.editable.of(!readOnly),
      ]),
    });
  }, [readOnly]);
  const html = useMemo(
    () => (preset === "markdown" && preview ? renderEditorMarkdown(value) : ""),
    [preset, preview, value],
  );
  const format = () => {
    if (readOnly || !editor.current) return;
    try {
      const view = editor.current;
      const next = formatEditorText(preset, view.state.doc.toString());
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: next },
      });
      view.focus();
    } catch {
      setError(labels.invalid);
    }
  };
  return (
    <IqujiEditorLayout
      className={props.className}
      footer={props.footer}
      toolbar={
        <>
          {preset === "markdown" && (
            <fieldset
              className="iquji-editor-modes"
              aria-label={props.ariaLabel}
            >
              <IqujiButton
                compact
                variant="ghost"
                aria-pressed={!preview}
                onClick={() => setPreview(false)}
              >
                {labels.edit}
              </IqujiButton>
              <IqujiButton
                compact
                variant="ghost"
                aria-pressed={preview}
                onClick={() => setPreview(true)}
              >
                {labels.preview}
              </IqujiButton>
            </fieldset>
          )}
          {(preset === "json" || preset === "yaml") && (
            <IqujiButton
              compact
              variant="ghost"
              disabled={readOnly}
              onClick={format}
            >
              {labels.format}
            </IqujiButton>
          )}
        </>
      }
    >
      {error && (
        <p role="status" className="iquji-editor-error">
          {error}
        </p>
      )}
      <div className="iquji-text-editor" ref={host} hidden={preview} />
      {preview && (
        <article
          className="iquji-editor-preview"
          aria-label={labels.preview}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML 已经过 DOMPurify 白名单并禁用脚本和远程资源。
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </IqujiEditorLayout>
  );
}
