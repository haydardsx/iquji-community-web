import { useEffect, useRef, useState } from "react";

type TourTarget = {
  id: string;
  element: HTMLElement | null;
  rect: DOMRect | null;
  width: number;
  height: number;
};

/** 只读取真实目标，延迟挂载和抽屉切换时保留当前教程步骤。 */
export function useTourTarget(
  open: boolean,
  id: string,
  resolve: () => HTMLElement | null,
) {
  const resolver = useRef(resolve);
  resolver.current = resolve;
  const [target, setTarget] = useState<TourTarget>({
    id,
    element: null,
    rect: null,
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight,
  });
  useEffect(() => {
    if (!open) return;
    let frame = 0;
    let observed: HTMLElement | null = null;
    let revealed: HTMLElement | null = null;
    const resize = new ResizeObserver(() => schedule());
    const measure = () => {
      frame = 0;
      const candidate = resolver.current();
      const element =
        candidate?.isConnected && !candidate.closest("[hidden], [inert]")
          ? candidate
          : null;
      if (observed !== element) {
        resize.disconnect();
        if (element) resize.observe(element);
        observed = element;
      }
      if (element && revealed !== element) {
        element.scrollIntoView?.({
          block: "nearest",
          inline: "nearest",
          behavior: "instant",
        });
        revealed = element;
      }
      const bounds = element?.getBoundingClientRect();
      const rect =
        bounds && bounds.width > 0 && bounds.height > 0 ? bounds : null;
      const width = window.innerWidth;
      const height = window.innerHeight;
      setTarget((current) => {
        if (
          current.id === id &&
          current.element === element &&
          current.width === width &&
          current.height === height &&
          current.rect?.x === rect?.x &&
          current.rect?.y === rect?.y &&
          current.rect?.width === rect?.width &&
          current.rect?.height === rect?.height
        )
          return current;
        return { id, element, rect, width, height };
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "hidden",
        "inert",
        "style",
        "class",
        "data-open",
        "data-starting-style",
      ],
    });
    window.addEventListener("resize", schedule);
    document.addEventListener("scroll", schedule, true);
    document.addEventListener("transitionend", schedule, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutations.disconnect();
      window.removeEventListener("resize", schedule);
      document.removeEventListener("scroll", schedule, true);
      document.removeEventListener("transitionend", schedule, true);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [open, id]);
  return target.id === id ? target : { ...target, element: null, rect: null };
}
