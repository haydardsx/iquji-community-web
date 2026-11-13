import { IqujiIcon } from "@iquji-web/web-icons";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { IqujiDialog } from "./overlays.js";

export type IqujiSearchDialogItem = {
  id: string;
  title: string;
  description?: string | undefined;
  metadata?: ReactNode;
  icon?: ReactNode;
  keywords?: string | undefined;
  disabled?: boolean | undefined;
};

export type IqujiSearchDialogGroup = {
  id: string;
  label: string;
  items: readonly IqujiSearchDialogItem[];
};

export type IqujiSearchDialogProps = {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  placeholder: string;
  emptyLabel: string;
  closeLabel: string;
  groups: readonly IqujiSearchDialogGroup[];
  onSelect(id: string): void;
};

export function IqujiSearchDialog({
  open,
  onOpenChange,
  title,
  placeholder,
  emptyLabel,
  closeLabel,
  groups,
  onSelect,
}: IqujiSearchDialogProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const options = useRef(new Map<string, HTMLElement>());
  const composing = useRef(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return groups.flatMap((group) => {
      const items = group.items.filter((item) =>
        [item.title, item.description, item.keywords]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase()
          .includes(term),
      );
      return items.length ? [{ ...group, items }] : [];
    });
  }, [groups, query]);
  const enabled = useMemo(
    () =>
      filtered.flatMap((group) => group.items.filter((item) => !item.disabled)),
    [filtered],
  );
  const active = enabled.find((item) => item.id === activeId) ?? enabled[0];
  const selectedId = active?.id;
  const optionId = (itemId: string) =>
    `${id}-option-${encodeURIComponent(itemId)}`;

  useEffect(() => {
    setQuery("");
    setActiveId(null);
    composing.current = false;
  }, [open]);
  useEffect(() => {
    if (activeId && !enabled.some((item) => item.id === activeId))
      setActiveId(null);
  }, [activeId, enabled]);
  useEffect(() => {
    if (open && selectedId)
      options.current.get(selectedId)?.scrollIntoView?.({ block: "nearest" });
  }, [selectedId, open, query]);

  const select = (item: IqujiSearchDialogItem) => {
    if (!open || item.disabled) return;
    onSelect(item.id);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      composing.current ||
      event.nativeEvent.isComposing ||
      event.keyCode === 229
    ) {
      if (event.key === "Escape") event.stopPropagation();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (active) select(active);
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (!enabled.length) return;
    const index = active
      ? enabled.findIndex((item) => item.id === active.id)
      : 0;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? enabled.length - 1
          : (index + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) %
            enabled.length;
    setActiveId(enabled[next]?.id ?? null);
  };

  return (
    <IqujiDialog
      className="iquji-search-dialog"
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      closeLabel={closeLabel}
      initialFocusRef={input}
      width="min(560px, 92vw)"
    >
      <div className="iquji-search-dialog__query">
        <IqujiIcon decorative name="search" />
        <input
          aria-activedescendant={
            open && active ? optionId(active.id) : undefined
          }
          aria-autocomplete="list"
          aria-controls={`${id}-results`}
          aria-expanded={open}
          aria-label={title}
          autoComplete="off"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveId(null);
          }}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          ref={input}
          role="combobox"
          spellCheck={false}
          type="text"
          value={query}
        />
      </div>
      <div className="iquji-search-dialog__results">
        <div aria-label={title} id={`${id}-results`} role="listbox">
          {filtered.map((group) => {
            const labelId = `${id}-group-${encodeURIComponent(group.id)}`;
            return (
              // biome-ignore lint/a11y/useSemanticElements: listbox 分组使用 ARIA 组，避免引入 fieldset 的表单控件语义。
              <div
                aria-labelledby={labelId}
                className="iquji-search-dialog__group"
                key={group.id}
                role="group"
              >
                <div className="iquji-search-dialog__group-label" id={labelId}>
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const itemId = optionId(item.id);
                  const hasMetadata =
                    item.metadata !== undefined && item.metadata !== null;
                  const descriptionIds = [
                    item.description ? `${itemId}-description` : null,
                    hasMetadata ? `${itemId}-metadata` : null,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <button
                      aria-describedby={descriptionIds || undefined}
                      aria-disabled={item.disabled || undefined}
                      aria-labelledby={`${itemId}-title`}
                      aria-selected={active?.id === item.id}
                      className="iquji-search-dialog__option"
                      disabled={item.disabled}
                      id={itemId}
                      key={item.id}
                      onClick={() => select(item)}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseMove={() => {
                        if (!item.disabled) setActiveId(item.id);
                      }}
                      ref={(element) => {
                        if (element) options.current.set(item.id, element);
                        else options.current.delete(item.id);
                      }}
                      role="option"
                      tabIndex={-1}
                      type="button"
                    >
                      {item.icon && (
                        <span
                          aria-hidden="true"
                          className="iquji-search-dialog__icon"
                        >
                          {item.icon}
                        </span>
                      )}
                      <span className="iquji-search-dialog__item-content">
                        <span
                          className="iquji-search-dialog__item-title"
                          id={`${itemId}-title`}
                        >
                          {item.title}
                        </span>
                        {item.description && (
                          <span
                            className="iquji-search-dialog__description"
                            id={`${itemId}-description`}
                          >
                            {item.description}
                          </span>
                        )}
                      </span>
                      {hasMetadata && (
                        <span
                          className="iquji-search-dialog__metadata"
                          id={`${itemId}-metadata`}
                        >
                          {item.metadata}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        {!filtered.length && (
          <p className="iquji-search-dialog__empty" role="status">
            {emptyLabel}
          </p>
        )}
      </div>
    </IqujiDialog>
  );
}
