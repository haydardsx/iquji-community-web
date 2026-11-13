import {
  IconButton,
  IqujiButton,
  IqujiSelect,
} from "@iquji-web/web-component";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import type { ReactNode } from "react";
import {
  type EditorAlignment,
  EditorFormatIcon,
} from "./editor-format-icon.js";

export const EDITOR_ALIGNMENT_TOOLS = {
  left: "alignLeft",
  center: "alignCenter",
  right: "alignRight",
  justify: "alignJustify",
} as const;
export type EditorToolbarSlots = {
  marks?: ReactNode;
  history?: ReactNode;
  paragraph?: ReactNode;
  spacing?: ReactNode;
  insert?: ReactNode;
};

export interface IqujiRichTextToolbarProps {
  editor: Editor | null;
  tools: readonly string[];
  slots?: EditorToolbarSlots;
  canClear?: boolean;
  onClear?: () => void;
  insertAvailable?: boolean;
  className?: string;
  disabled?: boolean;
  t: (key: string) => string;
  zoom: number;
  onZoom: (zoom: number) => void;
  actions?: ReactNode;
}
const textFormats = ["bold", "italic", "underline", "strike"] as const;

export function IqujiRichTextToolbar({
  editor,
  disabled,
  t,
  zoom,
  onZoom,
  actions,
  tools,
  slots = {},
  canClear = false,
  onClear,
  insertAvailable = false,
  className,
}: IqujiRichTextToolbarProps) {
  const has = (tool: string) => tools.includes(tool);
  const any = (...features: string[]) => features.some(has);
  const selection = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      heading:
        [1, 2, 3].find((level) => current?.isActive("heading", { level })) ?? 0,
      marks: textFormats.map((name) => ({
        active: current?.isActive(name),
        allowed: current?.can().toggleMark(name) ?? false,
      })),
      alignment: (["left", "center", "right", "justify"] as const).filter(
        (textAlign) =>
          current?.isActive({
            textAlign: textAlign === "left" ? null : textAlign,
          }),
      ),
      canAlign: current?.can().setTextAlign("center") ?? false,
      bulletList: current?.isActive("bulletList"),
      canBulletList: current?.can().toggleBulletList() ?? false,
      canOrderedList: current?.can().toggleOrderedList() ?? false,
      canClear,
      orderedList: current?.isActive("orderedList"),
      table: current?.isActive("table"),
      undo: current?.can().undo() ?? false,
      redo: current?.can().redo() ?? false,
    }),
  });
  const command = (
    tool: string,
    label: string,
    icon: ReactNode,
    run: () => void,
    active?: boolean,
    blocked = false,
  ) =>
    has(tool) ? (
      <IconButton
        key={tool}
        compact
        variant="ghost"
        label={t(label)}
        icon={icon}
        aria-pressed={active}
        disabled={disabled || !editor?.isEditable || blocked}
        onClick={() => {
          if (
            !disabled &&
            editor?.isEditable &&
            !editor.isDestroyed &&
            !blocked
          )
            run();
        }}
      />
    ) : null;
  const group = (name: string, children: ReactNode, view = false) => (
    <fieldset
      key={name}
      className={`iquji-editor-tool-group${view ? " iquji-editor-view-tools" : ""}`}
      aria-label={t(name)}
    >
      {children}
    </fieldset>
  );
  const textGroups = [
    has("textStyle") &&
      group(
        "toolbarStyles",
        <IqujiSelect
          compact
          aria-label={t("textStyle")}
          disabled={disabled || !editor?.isEditable}
          value={String(selection?.heading ?? 0)}
          options={[0, 1, 2, 3].map((level) => ({
            value: String(level),
            label: t(level ? `heading${level}` : "paragraph"),
          }))}
          onValueChange={(value) => {
            if (!value || disabled || !editor?.isEditable || editor.isDestroyed)
              return;
            if (value === "0") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .setHeading({ level: Number(value) as 1 | 2 | 3 })
                .run();
          }}
        />,
      ),
    any(
      ...textFormats,
      "highlight",
      "textColor",
      "formatBrush",
      "clearFormatting",
    ) &&
      group(
        "toolbarMarks",
        <>
          {textFormats.map((name, index) =>
            command(
              name,
              name,
              <EditorFormatIcon name={name} />,
              () => {
                editor?.chain().focus().toggleMark(name).run();
              },
              selection?.marks[index]?.active,
              !selection?.marks[index]?.allowed,
            ),
          )}
          {slots.marks}
          {command(
            "clearFormatting",
            "clearFormatting",
            <EditorFormatIcon name="clearFormatting" />,
            () => {
              onClear?.();
            },
            undefined,
            !selection?.canClear,
          )}
        </>,
      ),
    any("undo", "redo", "findReplace") &&
      group(
        "toolbarHistory",
        <>
          {command(
            "undo",
            "undo",
            <EditorFormatIcon name="undo" />,
            () => {
              editor?.chain().focus().undo().run();
            },
            undefined,
            !selection?.undo,
          )}
          {command(
            "redo",
            "redo",
            <EditorFormatIcon name="redo" />,
            () => {
              editor?.chain().focus().redo().run();
            },
            undefined,
            !selection?.redo,
          )}
          {slots.history}
        </>,
      ),
  ].filter(Boolean);
  const documentGroups = [
    any("bulletList", "orderedList", "taskList", "indent") &&
      group(
        "toolbarParagraph",
        <>
          {command(
            "bulletList",
            "bulletList",
            <EditorFormatIcon name="bulletList" />,
            () => {
              editor?.chain().focus().toggleBulletList().run();
            },
            selection?.bulletList,
            !selection?.canBulletList,
          )}
          {command(
            "orderedList",
            "orderedList",
            <EditorFormatIcon name="orderedList" />,
            () => {
              editor?.chain().focus().toggleOrderedList().run();
            },
            selection?.orderedList,
            !selection?.canOrderedList,
          )}
          {slots.paragraph}
        </>,
      ),
    any(...Object.values(EDITOR_ALIGNMENT_TOOLS), "lineHeight") &&
      group(
        "toolbarAlignment",
        <>
          {(
            ["left", "center", "right", "justify"] satisfies EditorAlignment[]
          ).map((alignment) =>
            command(
              EDITOR_ALIGNMENT_TOOLS[alignment],
              `align.${alignment}`,
              <EditorFormatIcon name={alignment} />,
              () => {
                if (alignment === "left")
                  editor?.chain().focus().unsetTextAlign().run();
                else editor?.chain().focus().setTextAlign(alignment).run();
              },
              selection?.alignment.includes(alignment),
              !selection?.canAlign,
            ),
          )}
          {slots.spacing}
        </>,
      ),
    (insertAvailable ||
      (has("tableEditing") && selection?.table) ||
      (has("customActions") && actions)) &&
      group(
        "toolbarInsert",
        <>
          {slots.insert}
          {has("customActions") && actions}
        </>,
      ),
    has("zoom") &&
      group(
        "toolbarView",
        <>
          <IconButton
            compact
            variant="ghost"
            label={t("zoomOut")}
            icon={<EditorFormatIcon name="minus" />}
            disabled={zoom <= 75}
            onClick={() => onZoom(zoom - 25)}
          />
          <IqujiButton
            compact
            variant="ghost"
            type="button"
            className="iquji-editor-zoom"
            title={t("resetZoom")}
            onClick={() => onZoom(100)}
          >
            {zoom}%
          </IqujiButton>
          <IconButton
            compact
            variant="ghost"
            label={t("zoomIn")}
            icon={<EditorFormatIcon name="plus" />}
            disabled={zoom >= 150}
            onClick={() => onZoom(zoom + 25)}
          />
        </>,
        true,
      ),
  ].filter(Boolean);
  if (!textGroups.length && !documentGroups.length) return null;
  return (
    <div
      className={["iquji-editor-format-toolbar", className]
        .filter(Boolean)
        .join(" ")}
      role="toolbar"
      aria-label={t("toolbar")}
    >
      {textGroups.length > 0 && (
        <fieldset
          className="iquji-editor-tool-row"
          aria-label={t("toolbarText")}
        >
          {textGroups}
        </fieldset>
      )}
      {documentGroups.length > 0 && (
        <fieldset
          className="iquji-editor-tool-row"
          aria-label={t("toolbarDocument")}
        >
          {documentGroups}
        </fieldset>
      )}
    </div>
  );
}
