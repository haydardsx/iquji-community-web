import {
  createContext,
  type FocusEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export function useIqujiOverlayModal(open: boolean, isTopLayer: boolean) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!open || !isTopLayer) setFocused(false);
  }, [open, isTopLayer]);
  return {
    modal:
      !open || (isTopLayer && focused)
        ? ("trap-focus" as const)
        : (false as const),
    onFocusCapture(event: FocusEvent<HTMLElement>) {
      // 先让保留 Portal 的公开 focusin 恢复 Tab 入口，再启用顶层焦点陷阱。
      if (open && isTopLayer && event.currentTarget.contains(event.target))
        setFocused(true);
    },
  };
}

type Layer = {
  id: string;
  kind: "drawer" | "dialog";
  order: number;
  ancestors: readonly string[];
  container: HTMLElement | null;
  open: boolean;
};
type LayerContext = {
  layers: Layer[];
  register(layer: Layer): void;
  unregister(id: string): void;
};
const Context = createContext<LayerContext | null>(null);
const Ancestors = createContext<readonly string[]>([]);
const locks = new WeakMap<HTMLElement, { count: number; overflow: string }>();
let nextOrder = 0;

function orderedLayers(layers: Layer[]) {
  const pending = [...layers].sort((left, right) => left.order - right.order);
  const result: Layer[] = [];
  while (pending.length) {
    // 祖先必须先于仍活动的后代；其余分支继续按实际打开顺序排列。
    const index = pending.findIndex(
      (layer) => !pending.some((other) => layer.ancestors.includes(other.id)),
    );
    result.push(...pending.splice(index, 1));
  }
  return result;
}

export function IqujiOverlayAncestry({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const ancestors = useContext(Ancestors);
  const value = useMemo(() => [...ancestors, id], [ancestors, id]);
  return <Ancestors.Provider value={value}>{children}</Ancestors.Provider>;
}

export function IqujiOverlayProvider({ children }: { children: ReactNode }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const register = useCallback(
    (layer: Layer) =>
      setLayers((current) =>
        orderedLayers([
          ...current.filter((value) => value.id !== layer.id),
          layer,
        ]),
      ),
    [],
  );
  const unregister = useCallback(
    (id: string) =>
      setLayers((current) =>
        orderedLayers(current.filter((layer) => layer.id !== id)),
      ),
    [],
  );
  const locked = layers.length > 0;
  useEffect(() => {
    if (!locked) return;
    const body = document.body;
    const lock = locks.get(body) ?? { count: 0, overflow: body.style.overflow };
    lock.count++;
    locks.set(body, lock);
    body.style.overflow = "hidden";
    return () => {
      if (--lock.count === 0) {
        body.style.overflow = lock.overflow;
        locks.delete(body);
      }
    };
  }, [locked]);
  const value = useMemo(
    () => ({ layers, register, unregister }),
    [layers, register, unregister],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function IqujiOverlayBoundary({ children }: { children: ReactNode }) {
  return useContext(Context) ? (
    children
  ) : (
    <IqujiOverlayProvider>{children}</IqujiOverlayProvider>
  );
}

export function useIqujiOverlayLayer(
  id: string,
  kind: Layer["kind"],
  active: boolean,
  open: boolean,
  container: HTMLElement | null,
) {
  const opening = useRef({ open: false, order: 0 });
  // React 先执行子层 effect；打开顺序在渲染时记录，不能靠 effect 登记顺序决定顶层。
  if (open && !opening.current.open) opening.current.order = ++nextOrder;
  opening.current.open = open;
  const order = opening.current.order;
  const ancestors = useContext(Ancestors);
  const context = useContext(Context);
  const register = context?.register,
    unregister = context?.unregister;
  useEffect(() => {
    if (!active || !register || !unregister) return;
    register({ id, kind, order, ancestors, container, open });
    return () => unregister(id);
  }, [
    active,
    id,
    kind,
    order,
    ancestors,
    container,
    open,
    register,
    unregister,
  ]);
  const layers = context?.layers ?? [];
  const index = layers.findIndex((layer) => layer.id === id);
  const base = 1000 + Math.max(index, 0) * 20;
  return {
    registered: index !== -1,
    isTopLayer: !layers.length || layers.at(-1)?.id === id,
    backdrop: base,
    surface: base + 1,
    floating: base + 2,
  };
}

export function useIqujiNotificationContainer() {
  const context = useContext(Context);
  return (
    [...(context?.layers ?? [])].reverse().find((layer) => layer.open)
      ?.container ?? undefined
  );
}
