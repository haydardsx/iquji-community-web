import { type RefObject, useCallback, useRef } from "react";

export function resolveIqujiOverlayInitialFocus(
  ref: RefObject<HTMLElement | null> | undefined,
) {
  if (!ref) return undefined;
  return () => {
    const target = ref.current;
    return target?.isConnected &&
      !target.matches(':disabled, [aria-disabled="true"]') &&
      !target.closest("[hidden], [inert]")
      ? target
      : true;
  };
}

const floatingTriggers = new WeakMap<HTMLElement, HTMLElement>();

export function useIqujiFloatingTriggerRefs() {
  const trigger = useRef<HTMLElement | null>(null);
  const popup = useRef<HTMLDivElement | null>(null);
  const triggerRef = useCallback((element: HTMLElement | null) => {
    trigger.current = element;
    if (element && popup.current) floatingTriggers.set(popup.current, element);
  }, []);
  const popupRef = useCallback((element: HTMLDivElement | null) => {
    popup.current = element;
    if (element && trigger.current)
      floatingTriggers.set(element, trigger.current);
  }, []);
  return { triggerRef, popupRef };
}

const resolveReturnTarget = (element: HTMLElement): HTMLElement => {
  const visited = new Set<HTMLElement>();
  let target = element;
  while (!visited.has(target)) {
    visited.add(target);
    const popup = target.closest<HTMLElement>(
      ".iquji-menu-popup, .iquji-popover-popup",
    );
    const trigger = popup ? floatingTriggers.get(popup) : undefined;
    if (!trigger) break;
    target = trigger;
  }
  return target;
};

export function restoreIqujiOverlayFocus(
  resolveTarget: () => HTMLElement | boolean,
) {
  const target = resolveTarget();
  // 父层仍处于非模态过渡时归还焦点，让底层 Portal 同步恢复其原有键盘入口。
  if (target instanceof HTMLElement) target.focus({ preventScroll: true });
}

export function useIqujiOverlayReturnFocus(open: boolean | undefined) {
  const wasOpen = useRef(false);
  const currentOpen = useRef(open);
  currentOpen.current = open;
  const returnTarget = useRef<HTMLElement | null>(null);
  // 菜单关闭会撤销 aria-controls；在子容器自动聚焦前保留真实入口，避免返回隐藏菜单项。
  if (open && !wasOpen.current) {
    const activeElement =
      typeof document === "undefined" ? null : document.activeElement;
    returnTarget.current =
      typeof HTMLElement !== "undefined" &&
      activeElement instanceof HTMLElement &&
      activeElement !== document.body &&
      activeElement !== document.documentElement
        ? resolveReturnTarget(activeElement)
        : null;
  }
  wasOpen.current = Boolean(open);
  return useCallback(() => {
    // 连续关闭又打开同一确认框时，上一轮退出的焦点回调不能抢走新容器的焦点。
    if (currentOpen.current) return false;
    const target = returnTarget.current;
    const active =
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusedPopup = active
      ? active.closest<HTMLElement>(
          "[data-iquji-overlay-surface][data-open], .iquji-floating-popup[data-open]",
        )
      : null;
    // 相邻容器替换时，新容器已经接管焦点；旧容器退出只允许返回这个容器内的入口。
    if (focusedPopup && !focusedPopup.contains(target)) return false;
    if (
      active &&
      active !== target &&
      active.matches('input, textarea, select, [contenteditable="true"]') &&
      !active.closest("[hidden], [inert]") &&
      !active.closest("[data-iquji-overlay-surface]:not([data-open])")
    )
      return false;
    if (!target) return true;
    if (
      target.hasAttribute("data-iquji-overlay-surface") &&
      active !== target &&
      target.contains(active)
    )
      return false;
    if (
      !target.isConnected ||
      target.matches(':disabled, [aria-disabled="true"]') ||
      target.closest("[hidden], [inert]")
    )
      return false;
    return target;
  }, []);
}
