import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { classNames } from "./utils.js";

const DEFAULT_LEFT_WIDTH = 240;
const DEFAULT_LEFT_MIN = 180;
const DEFAULT_LEFT_MAX = 420;
const DEFAULT_RIGHT_WIDTH = 420;
const DEFAULT_RIGHT_MIN = 280;
const DEFAULT_RIGHT_MAX = 640;
const DEFAULT_CENTER_MIN = 480;
const RESIZE_STEP = 16;

type PaneSide = "left" | "right";

export type IqujiWorkbenchGeometry = {
  leftWidth: number;
  centerWidth: number;
  rightWidth: number;
};

export type IqujiWorkbenchSurfaceMode = "flat" | "split-card";
export type IqujiWorkbenchDisplayMode =
  | "split"
  | "fullscreen-center"
  | "fullscreen-right";

export type IqujiWorkbenchLayoutProps = {
  left?: ReactNode;
  center: ReactNode;
  right?: ReactNode;
  leftWidth?: number | undefined;
  defaultLeftWidth?: number | undefined;
  onLeftWidthChange?: ((width: number) => void) | undefined;
  leftMinWidth?: number | undefined;
  leftMaxWidth?: number | undefined;
  leftCollapsed?: boolean | undefined;
  rightWidth?: number | undefined;
  defaultRightWidth?: number | undefined;
  onRightWidthChange?: ((width: number) => void) | undefined;
  rightMinWidth?: number | undefined;
  rightMaxWidth?: number | undefined;
  rightCollapsed?: boolean | undefined;
  centerMinWidth?: number | undefined;
  surfaceMode?: IqujiWorkbenchSurfaceMode | undefined;
  displayMode?: IqujiWorkbenchDisplayMode | undefined;
  onLayoutChange?: ((geometry: IqujiWorkbenchGeometry) => void) | undefined;
  leftResizeLabel?: string | undefined;
  rightResizeLabel?: string | undefined;
  className?: string | undefined;
  leftClassName?: string | undefined;
  centerClassName?: string | undefined;
  rightClassName?: string | undefined;
  workspaceClassName?: string | undefined;
};

function numberOr(value: number | undefined, fallback: number) {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function widthBounds(
  minValue: number | undefined,
  maxValue: number | undefined,
) {
  const min = Math.max(0, Math.round(numberOr(minValue, 0)));
  const max = Math.max(min, Math.round(numberOr(maxValue, min)));
  return { min, max };
}

function clampWidth(value: number, min: number, max: number) {
  const lower = Math.max(0, Math.min(min, max));
  const upper = Math.max(lower, max);
  return Math.min(Math.max(value, lower), upper);
}

export function IqujiWorkbenchLayout({
  left,
  center,
  right,
  leftWidth,
  defaultLeftWidth,
  onLeftWidthChange,
  leftMinWidth,
  leftMaxWidth,
  leftCollapsed = false,
  rightWidth,
  defaultRightWidth,
  onRightWidthChange,
  rightMinWidth,
  rightMaxWidth,
  rightCollapsed = false,
  centerMinWidth,
  surfaceMode = "flat",
  displayMode = "split",
  onLayoutChange,
  leftResizeLabel = "Resize left panel",
  rightResizeLabel = "Resize right panel",
  className,
  leftClassName,
  centerClassName,
  rightClassName,
  workspaceClassName,
}: IqujiWorkbenchLayoutProps) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const previousGeometry = useRef<IqujiWorkbenchGeometry | null>(null);
  const dragRef = useRef<{
    side: PaneSide;
    pointerId: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [resizing, setResizing] = useState<PaneSide | null>(null);

  const leftBounds = widthBounds(
    leftMinWidth ?? DEFAULT_LEFT_MIN,
    leftMaxWidth ?? DEFAULT_LEFT_MAX,
  );
  const rightBounds = widthBounds(
    rightMinWidth ?? DEFAULT_RIGHT_MIN,
    rightMaxWidth ?? DEFAULT_RIGHT_MAX,
  );
  const leftDefault = clampWidth(
    numberOr(defaultLeftWidth, DEFAULT_LEFT_WIDTH),
    leftBounds.min,
    leftBounds.max,
  );
  const rightDefault = clampWidth(
    numberOr(defaultRightWidth, DEFAULT_RIGHT_WIDTH),
    rightBounds.min,
    rightBounds.max,
  );
  const [internalLeftWidth, setInternalLeftWidth] = useState(leftDefault);
  const [internalRightWidth, setInternalRightWidth] = useState(rightDefault);

  const leftValue = clampWidth(
    numberOr(leftWidth, internalLeftWidth),
    leftBounds.min,
    leftBounds.max,
  );
  const rightValue = clampWidth(
    numberOr(rightWidth, internalRightWidth),
    rightBounds.min,
    rightBounds.max,
  );
  const centerMin = Math.max(
    1,
    Math.round(numberOr(centerMinWidth, DEFAULT_CENTER_MIN)),
  );
  const hasLeft = left !== undefined && left !== null;
  const hasRight = right !== undefined && right !== null;
  const leftVisible = hasLeft && !leftCollapsed;
  const fullscreenCenter = displayMode === "fullscreen-center";
  const fullscreenRight = displayMode === "fullscreen-right";
  const rightVisible =
    hasRight && !rightCollapsed && !fullscreenCenter;
  const centerHidden = fullscreenRight && rightVisible;
  const rightHidden = !rightVisible;

  useLayoutEffect(() => {
    if (!onLayoutChange) {
      previousGeometry.current = null;
      return;
    }
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      // Grid 在窄窗口中会压缩侧栏，顶栏需要实际宽度，不能反向覆盖用户设定。
      const geometry = {
        leftWidth: leftRef.current?.getBoundingClientRect().width ?? 0,
        centerWidth: centerRef.current?.getBoundingClientRect().width ?? 0,
        rightWidth: rightRef.current?.getBoundingClientRect().width ?? 0,
      };
      const previous = previousGeometry.current;
      if (
        previous?.leftWidth === geometry.leftWidth &&
        previous.centerWidth === geometry.centerWidth &&
        previous.rightWidth === geometry.rightWidth
      )
        return;
      previousGeometry.current = geometry;
      onLayoutChange(geometry);
    };
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    for (const pane of [
      leftRef.current,
      centerRef.current,
      rightRef.current,
    ]) {
      if (pane) observer?.observe(pane);
    }
    measure();
    return () => {
      disposed = true;
      observer?.disconnect();
    };
  }, [
    centerHidden,
    hasLeft,
    hasRight,
    leftVisible,
    onLayoutChange,
    rightVisible,
  ]);

  const limitForSide = (side: PaneSide, requested: number) => {
    const bounds = side === "left" ? leftBounds : rightBounds;
    const otherWidth =
      side === "left"
        ? rightVisible && displayMode === "split"
          ? rightValue
          : 0
        : leftVisible
          ? leftValue
          : 0;
    const measuredWidth = rootRef.current?.getBoundingClientRect().width ?? 0;
    const requiredCenter = centerHidden ? 0 : centerMin;
    // 隐藏容器或测试环境没有真实布局时不能把宽度算成 0，否则每次调整都会被压回最小值。
    const available =
      measuredWidth > 0
        ? measuredWidth - requiredCenter - otherWidth
        : Number.POSITIVE_INFINITY;
    return clampWidth(requested, bounds.min, Math.min(bounds.max, available));
  };

  const changeLeftWidth = (next: number) => {
    const limited = limitForSide("left", next);
    if (leftWidth === undefined) {
      setInternalLeftWidth(limited);
    }
    onLeftWidthChange?.(limited);
  };

  const changeRightWidth = (next: number) => {
    const limited = limitForSide("right", next);
    if (rightWidth === undefined) {
      setInternalRightWidth(limited);
    }
    onRightWidthChange?.(limited);
  };

  const changeSideWidth = (side: PaneSide, next: number) => {
    if (side === "left") {
      changeLeftWidth(next);
    } else {
      changeRightWidth(next);
    }
  };

  const currentWidth = (side: PaneSide) =>
    side === "left" ? leftValue : rightValue;

  const startDrag = (side: PaneSide, event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus();
    if (typeof event.currentTarget.setPointerCapture === "function") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const pane = side === "left" ? leftRef.current : rightRef.current;
    dragRef.current = {
      side,
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: pane?.getBoundingClientRect().width || currentWidth(side),
    };
    setResizing(side);
  };

  const moveDrag = (side: PaneSide, event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.side !== side || drag.pointerId !== event.pointerId) {
      return;
    }
    const delta = event.clientX - drag.startX;
    changeSideWidth(side, drag.startWidth + (side === "left" ? delta : -delta));
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setResizing(null);
    if (
      typeof event.currentTarget.releasePointerCapture === "function" &&
      event.currentTarget.hasPointerCapture?.(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (
    side: PaneSide,
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    const step = event.shiftKey ? RESIZE_STEP * 4 : RESIZE_STEP;
    const current = currentWidth(side);
    let next: number | null = null;
    if (event.key === "ArrowLeft") {
      next = current + (side === "left" ? -step : step);
    } else if (event.key === "ArrowRight") {
      next = current + (side === "left" ? step : -step);
    } else if (event.key === "Home") {
      next = side === "left" ? leftBounds.min : rightBounds.min;
    } else if (event.key === "End") {
      next = side === "left" ? leftBounds.max : rightBounds.max;
    }
    if (next === null) return;
    event.preventDefault();
    changeSideWidth(side, next);
  };

  const resetWidth = (side: PaneSide, event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    changeSideWidth(side, side === "left" ? leftDefault : rightDefault);
  };

  const effectiveRightWidth =
    rightHidden ? 0 : rightValue;
  const style = {
    "--iquji-workbench-left-width": `${leftVisible ? leftValue : 0}px`,
    "--iquji-workbench-right-width": `${effectiveRightWidth}px`,
    "--iquji-workbench-center-min-width": `${centerHidden ? 0 : centerMin}px`,
  } as CSSProperties;

  const renderResizer = (side: PaneSide) => {
    const bounds = side === "left" ? leftBounds : rightBounds;
    const value = currentWidth(side);
    const paneId =
      side === "left" ? `${generatedId}-left` : `${generatedId}-right`;
    return (
      <div
        aria-controls={paneId}
        aria-label={side === "left" ? leftResizeLabel : rightResizeLabel}
        aria-orientation="vertical"
        aria-valuemax={bounds.max}
        aria-valuemin={bounds.min}
        aria-valuenow={value}
        className={classNames(
          "iquji-workbench__resizer",
          `iquji-workbench__resizer--${side}`,
        )}
        onDoubleClick={(event) => resetWidth(side, event)}
        onKeyDown={(event) => handleKeyDown(side, event)}
        onPointerCancel={finishDrag}
        onPointerDown={(event) => startDrag(side, event)}
        onPointerMove={(event) => moveDrag(side, event)}
        onPointerUp={finishDrag}
        role="separator"
        tabIndex={0}
      />
    );
  };

  const centerPane = (
    <div
      aria-hidden={centerHidden || undefined}
      className={classNames(
        "iquji-workbench__pane",
        "iquji-workbench__pane--center",
        centerClassName,
      )}
      id={`${generatedId}-center`}
      inert={centerHidden || undefined}
      ref={centerRef}
    >
      {center}
    </div>
  );

  const rightPane = hasRight ? (
    <div
      aria-hidden={rightHidden || undefined}
      className={classNames(
        "iquji-workbench__pane",
        "iquji-workbench__pane--right",
        rightClassName,
      )}
      id={`${generatedId}-right`}
      inert={rightHidden || undefined}
      ref={rightRef}
    >
      {rightVisible && displayMode === "split" ? renderResizer("right") : null}
      {right}
    </div>
  ) : null;

  return (
    <div
      className={classNames(
        "iquji-workbench",
        leftCollapsed && "iquji-workbench--left-collapsed",
        rightHidden && "iquji-workbench--right-collapsed",
        className,
      )}
      data-display-mode={displayMode}
      data-left-visible={leftVisible || undefined}
      data-resizing={resizing ?? undefined}
      data-surface-mode={surfaceMode}
      ref={rootRef}
      style={style}
    >
      {hasLeft ? (
        <div
          aria-hidden={leftCollapsed || undefined}
          className={classNames(
            "iquji-workbench__pane",
            "iquji-workbench__pane--left",
            leftClassName,
          )}
          id={`${generatedId}-left`}
          inert={leftCollapsed || undefined}
          ref={leftRef}
        >
          {left}
          {leftVisible ? renderResizer("left") : null}
        </div>
      ) : null}
      {surfaceMode === "split-card" ? (
        <div
          className={classNames(
            "iquji-workbench__workspace",
            workspaceClassName,
          )}
        >
          {centerPane}
          {rightPane}
        </div>
      ) : (
        <>
          {centerPane}
          {rightPane}
        </>
      )}
    </div>
  );
}
