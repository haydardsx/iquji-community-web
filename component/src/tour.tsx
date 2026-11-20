import { Popover } from "@base-ui/react/popover";
import { IqujiIcon } from "@iquji-community/web-icons";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IconButton } from "./index.js";
import { useIqujiNotificationContainer } from "./overlay-layer.js";
import { useIqujiOverlayContainer } from "./overlay-scope.js";
import { useTourTarget } from "./tour-target.js";

export type IqujiTourStep = {
  id: string;
  target: () => HTMLElement | null;
  title: ReactNode;
  description: ReactNode;
  placement?: "top" | "right" | "bottom" | "left";
};

export type IqujiTourProps = {
  open: boolean;
  step: IqujiTourStep;
  progress?: ReactNode;
  actions?: ReactNode;
  closeLabel: string;
  onClose: () => void;
};

/** 在目标旁显示当前步骤，外部组件可控制步骤和操作。 */
export function IqujiTour({
  open,
  step,
  progress,
  actions,
  closeLabel,
  onClose,
}: IqujiTourProps) {
  const scope = useIqujiOverlayContainer();
  const container = scope && "current" in scope ? scope.current : scope;
  const topContainer = useIqujiNotificationContainer();
  // 后开的确认框接管交互后暂时收起教程，关闭确认框即可继续同一步。
  const active = open && (!topContainer || container === topContainer);
  const target = useTourTarget(active, step.id, step.target);
  const [card, setCard] = useState<HTMLDivElement | null>(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    if (!card) return;
    const measure = () => {
      const { width, height } = card.getBoundingClientRect();
      setCardSize((current) =>
        current.width === width && current.height === height
          ? current
          : { width, height },
      );
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(card);
    return () => resize.disconnect();
  }, [card]);
  // 缺失目标或四周均容不下说明卡时移入视口，普通字段由定位器翻转避让。
  const constrainToViewport =
    !target.rect ||
    (cardSize.width > 0 &&
      cardSize.height > 0 &&
      target.rect.top < cardSize.height + 32 &&
      target.height - target.rect.bottom < cardSize.height + 32 &&
      target.rect.left < cardSize.width + 32 &&
      target.width - target.rect.right < cardSize.width + 32);
  const close = () => {
    if (card?.contains(document.activeElement)) {
      const selector = "input, textarea, select, button, a[href], [tabindex]";
      const field = target.element?.matches(selector)
        ? target.element
        : target.element?.querySelector<HTMLElement>(selector);
      field?.focus({ preventScroll: true });
    }
    onClose();
  };
  const onCloseRef = useRef(close);
  onCloseRef.current = close;
  useEffect(() => {
    if (!active) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || event.isComposing)
        return;
      // 字段自己的选择菜单先消费 Escape，教程在下一次按键时退出。
      const root = container ?? document;
      if (
        root.querySelector(
          ".iquji-select__popup[data-open], .iquji-menu-popup[data-open], .iquji-popover-popup[data-open]",
        )
      )
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onCloseRef.current();
    };
    document.addEventListener("keydown", escape, true);
    return () => document.removeEventListener("keydown", escape, true);
  }, [active, container]);
  const anchor = useMemo(
    () => ({
      contextElement: target.element ?? undefined,
      getBoundingClientRect: () =>
        target.rect ?? new DOMRect(target.width / 2, target.height / 3, 0, 0),
    }),
    [target],
  );
  if (!active) return null;
  const padding = 6;
  const left = Math.max(0, (target.rect?.left ?? 0) - padding);
  const top = Math.max(0, (target.rect?.top ?? 0) - padding);
  const right = Math.min(target.width, (target.rect?.right ?? 0) + padding);
  const bottom = Math.min(target.height, (target.rect?.bottom ?? 0) + padding);
  const hole = target.rect && right > left && bottom > top;
  const masks: CSSProperties[] = hole
    ? [
        { left: 0, top: 0, width: "100%", height: top },
        { left: 0, top: bottom, width: "100%", bottom: 0 },
        { left: 0, top, width: left, height: bottom - top },
        { left: right, top, right: 0, height: bottom - top },
      ]
    : [{ inset: 0 }];
  return (
    <Popover.Root
      open
      modal={false}
      onOpenChange={(_next, details) => details.cancel()}
    >
      <Popover.Portal container={container ?? undefined}>
        <div
          className="iquji-tour"
          data-step={step.id}
          data-target-missing={!hole || undefined}
          style={{ zIndex: container ? 1 : 1002 }}
        >
          {masks.map((style, index) => (
            <div
              key={index}
              className="iquji-tour__mask"
              style={style}
              aria-hidden="true"
            />
          ))}
          {hole && (
            <div
              className="iquji-tour__spotlight"
              aria-hidden="true"
              style={{
                left,
                top,
                width: right - left,
                height: bottom - top,
              }}
            />
          )}
          <Popover.Positioner
            anchor={anchor}
            side={target.rect ? (step.placement ?? "bottom") : "bottom"}
            align="center"
            sideOffset={16}
            collisionPadding={16}
            sticky={constrainToViewport}
            className="iquji-tour__positioner"
          >
            <Popover.Popup
              ref={setCard}
              initialFocus={false}
              finalFocus={false}
              className="iquji-tour__card"
            >
              <div className="iquji-tour__body">
                <div className="iquji-tour__header">
                  <div aria-live="polite">
                    {progress && (
                      <div className="iquji-tour__progress">{progress}</div>
                    )}
                    <Popover.Title className="iquji-tour__title">
                      {step.title}
                    </Popover.Title>
                  </div>
                  <IconButton
                    compact
                    label={closeLabel}
                    icon={<IqujiIcon decorative name="close" />}
                    onClick={close}
                  />
                </div>
                <Popover.Description
                  render={<div />}
                  aria-live="polite"
                  className="iquji-tour__description"
                >
                  {step.description}
                </Popover.Description>
                {actions && (
                  <div className="iquji-tour__actions">{actions}</div>
                )}
              </div>
              {hole && !constrainToViewport && (
                <Popover.Arrow className="iquji-tour__arrow" />
              )}
            </Popover.Popup>
          </Popover.Positioner>
        </div>
      </Popover.Portal>
    </Popover.Root>
  );
}
