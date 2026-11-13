import { useCallback, useEffect, useRef, useState } from "react";
import { restoreIqujiOverlayFocus } from "./overlay-focus.js";

export function useIqujiOverlayPresence(
  open: boolean,
  onCloseComplete?: () => void,
) {
  const [present, setPresent] = useState(open);
  const currentOpen = useRef(open),
    completed = useRef(!open),
    pending = useRef(false),
    completion = useRef(onCloseComplete);
  currentOpen.current = open;
  completion.current = onCloseComplete;
  if (open) {
    completed.current = false;
    pending.current = false;
  }
  useEffect(() => {
    if (open) setPresent(true);
  }, [open]);
  const complete = useCallback((nextOpen: boolean) => {
    // 旧退出回调不得卸载刚重新打开的容器，也不得重复通知消费者。
    if (nextOpen || currentOpen.current || completed.current) return;
    completed.current = true;
    pending.current = true;
    setPresent(false);
  }, []);
  const notify = useCallback(() => {
    if (currentOpen.current || !pending.current) return;
    pending.current = false;
    completion.current?.();
  }, []);
  return { active: open || present, complete, notify };
}

export function useIqujiOverlayCompletion(
  presence: ReturnType<typeof useIqujiOverlayPresence>,
  registered: boolean,
  finalFocus: () => HTMLElement | boolean,
) {
  const { active, notify } = presence;
  useEffect(() => {
    if (active || registered) return;
    let cancelled = false;
    // 父层恢复焦点陷阱与 BaseUI 的退出焦点清理完成后，宿主才可恢复业务入口。
    queueMicrotask(() => {
      if (!cancelled) {
        restoreIqujiOverlayFocus(finalFocus);
        notify();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [active, registered, notify, finalFocus]);
}
