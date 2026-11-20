import { type KeyboardEvent, useId, useMemo, useRef, useState } from "react";
import { IqujiButton, IqujiInput, type IqujiButtonVariant } from "./index.js";
import { IqujiPopover } from "./floating.js";

export type IqujiEmojiOption = { value: string; label: string; keywords?: string; category?: string };
export interface IqujiEmojiPickerProps {
  value: string | null;
  options: readonly IqujiEmojiOption[];
  onChange(value: string | null): void;
  label: string;
  searchLabel: string;
  emptyLabel: string;
  clearLabel: string;
  allLabel?: string;
  disabled?: boolean;
  variant?: IqujiButtonVariant;
}
/** Emoji 序列作为完整值处理，候选、分类文案和资料保存由调用方提供。 */
export function IqujiEmojiPicker({ value, options, onChange, label, searchLabel, emptyLabel, clearLabel, allLabel, disabled, variant = "primary" }: IqujiEmojiPickerProps) {
  const [open, setOpen] = useState(false), [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null), [active, setActive] = useState(0);
  const id = useId(), buttons = useRef(new Map<number, HTMLButtonElement>());
  const categories = useMemo(() => [...new Set(options.flatMap(option => option.category ? [option.category] : []))], [options]);
  const filtered = useMemo(() => options.filter(option => (!category || option.category === category) && `${option.label} ${option.keywords ?? ""} ${option.value}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())), [options, search, category]);
  const navigate = (event: KeyboardEvent<HTMLDivElement>) => {
    const offset = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 6, ArrowUp: -6 }[event.key];
    if (offset === undefined && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? filtered.length - 1 : Math.max(0, Math.min(filtered.length - 1, active + (offset ?? 0)));
    setActive(next); buttons.current.get(next)?.focus();
  };
  return <IqujiPopover open={open} onOpenChange={next => { setOpen(next); if (!next) { setSearch(""); setCategory(null); setActive(0); } }} trigger={<IqujiButton variant={variant} disabled={disabled} aria-label={label}>{value ?? label}</IqujiButton>}>
    <section className="iquji-emoji-picker" aria-label={label}>
      <label htmlFor={id}>{searchLabel}</label>
      <IqujiInput id={id} value={search} onChange={event => { setSearch(event.target.value); setActive(0); }} onKeyDown={event => { if (event.key === "ArrowDown" && filtered.length) { event.preventDefault(); buttons.current.get(0)?.focus(); } }} />
      {categories.length > 0 && <div className="iquji-emoji-picker__categories" role="group" aria-label={label}>
        <IqujiButton compact variant="ghost" aria-pressed={category === null} onClick={() => { setCategory(null); setActive(0); }}>{allLabel ?? searchLabel}</IqujiButton>
        {categories.map(item => <IqujiButton compact key={item} variant="ghost" aria-pressed={category === item} onClick={() => { setCategory(item); setActive(0); }}>{item}</IqujiButton>)}
      </div>}
      <div className="iquji-emoji-picker__grid" role="group" aria-label={label} onKeyDown={navigate}>
        {filtered.map((option, index) => <IqujiButton key={option.value} ref={element => { if (element) buttons.current.set(index, element); else buttons.current.delete(index); }} tabIndex={index === Math.min(active, filtered.length - 1) ? 0 : -1} variant="ghost" aria-label={option.label} aria-pressed={value === option.value} title={option.label} onFocus={() => setActive(index)} onClick={() => { onChange(option.value); setOpen(false); setSearch(""); setCategory(null); setActive(0); }}>{option.value}</IqujiButton>)}
      </div>
      {!filtered.length && <p role="status">{emptyLabel}</p>}
      <IqujiButton variant="ghost" onClick={() => { onChange(null); setOpen(false); }}>{clearLabel}</IqujiButton>
    </section>
  </IqujiPopover>;
}
