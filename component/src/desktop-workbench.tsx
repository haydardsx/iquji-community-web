import { IqujiIcon } from "@iquji-community/web-icons";
import {
  type CSSProperties,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IqujiDesktopRail } from "./desktop-rail.js";
import { IqujiDesktopShell } from "./desktop-shell.js";
import { IqujiDesktopTabStrip } from "./desktop-tabs.js";
import { IqujiDesktopTitleBar } from "./desktop-titlebar.js";
import { IqujiTitleBarActions } from "./titlebar-action-tooltip.js";
import { IconButton, IqujiButton } from "./index.js";
import { classNames } from "./utils.js";
import {
  type IqujiWorkbenchDisplayMode,
  type IqujiWorkbenchGeometry,
  IqujiWorkbenchLayout,
} from "./workbench.js";

import type {
  IqujiDesktopWorkbenchFullscreenTarget,
  IqujiDesktopWorkbenchProps,
} from "./desktop-workbench-types.js";
export type * from "./desktop-workbench-types.js";

const DEFAULT_RAIL_WIDTH = 52;

function lengthOf(value: number | string | undefined) {
  if (value === undefined) return "0px";
  return typeof value === "number" ? `${value}px` : value;
}

export function IqujiDesktopWorkbench({
  rail,
  railItems,
  railLabel = "Workspace",
  railFooter,
  railShowDivider = true,
  skipLinkLabel,
  contentId,
  className,

  windowControls,
  windowControlsPlacement = "start",
  windowControlsSpace,
  dragRegion = false,
  titleBarAttributes,
  historyNavigation,
  leadingActions,
  globalActions,
  sidebarToggleLabel = "Toggle sidebar",

  left,
  leftAvailable,
  leftWidth,
  defaultLeftWidth = 260,
  onLeftWidthChange,
  leftMinWidth = 220,
  leftMaxWidth = 420,
  leftCollapsed,
  defaultLeftCollapsed = false,
  onLeftCollapsedChange,
  leftResizeLabel,
  leftClassName,

  center,
  centerTitle,
  centerIcon,
  centerTabLabel,
  centerActions,
  centerMinWidth = 480,
  centerClassName,

  right,
  rightAvailable,
  rightTabs,
  activeRightTabId,
  defaultActiveRightTabId,
  onActiveRightTabChange,
  onRightTabClose,
  onRightTabAdd,
  addRightTabLabel,
  closeRightTabLabel,
  rightTabsLabel = "Right panel tabs",
  rightWidth,
  defaultRightWidth = 460,
  onRightWidthChange,
  rightMinWidth = 280,
  rightMaxWidth = 680,
  rightOpen,
  defaultRightOpen = false,
  onRightOpenChange,
  rightResizeLabel,
  rightToggleLabel = "Toggle right panel",
  rightClassName,

  rightFullscreen,
  defaultRightFullscreen = false,
  onRightFullscreenChange,
  fullscreenTarget,
  defaultFullscreenTarget = "right",
  onFullscreenTargetChange,
  enterFullscreenLabel = "Enter full view",
  exitFullscreenLabel = "Exit full view",
  restoreSplitLabel = "Restore split view",

  onLayoutChange,
}: IqujiDesktopWorkbenchProps) {
  const [internalLeftCollapsed, setInternalLeftCollapsed] =
    useState(defaultLeftCollapsed);
  const [internalRightOpen, setInternalRightOpen] = useState(defaultRightOpen);
  const [internalRightFullscreen, setInternalRightFullscreen] = useState(
    defaultRightFullscreen,
  );
  const [internalFullscreenTarget, setInternalFullscreenTarget] =
    useState<IqujiDesktopWorkbenchFullscreenTarget>(defaultFullscreenTarget);
  const [internalActiveTabId, setInternalActiveTabId] = useState<string | null>(
    () => defaultActiveRightTabId ?? rightTabs?.[0]?.id ?? null,
  );
  const [geometry, setGeometry] = useState<IqujiWorkbenchGeometry | null>(null);
  const [railWidth, setRailWidth] = useState(0);
  const [leadingInset, setLeadingInset] = useState(0);
  const railHostRef = useRef<HTMLDivElement>(null);
  const segmentsRef = useRef<HTMLDivElement>(null);

  const isLeftCollapsed =
    leftCollapsed !== undefined ? leftCollapsed : internalLeftCollapsed;
  const isRightOpen =
    rightOpen !== undefined ? rightOpen : internalRightOpen;
  const isRightFullscreen =
    rightFullscreen !== undefined ? rightFullscreen : internalRightFullscreen;
  const currentFullscreenTarget =
    fullscreenTarget !== undefined
      ? fullscreenTarget
      : internalFullscreenTarget;

  const hasLeft = left !== undefined && left !== null;
  const canToggleLeft = leftAvailable ?? hasLeft;
  const hasTabs = rightTabs !== undefined;
  const tabList = rightTabs ?? [];
  const hasRightNode = right !== undefined && right !== null;
  const hasRightContent =
    rightAvailable ?? (hasTabs ? tabList.length > 0 || hasRightNode : hasRightNode);
  const canToggleRight =
    rightAvailable ?? (hasRightContent || onRightOpenChange !== undefined);

  const resolvedActiveTabId = useMemo(() => {
    if (tabList.length === 0) return null;
    const candidate =
      activeRightTabId !== undefined ? activeRightTabId : internalActiveTabId;
    if (candidate && tabList.some((tab) => tab.id === candidate)) {
      return candidate;
    }
    return tabList[0]?.id ?? null;
  }, [activeRightTabId, internalActiveTabId, tabList]);

  const rightVisible = hasRightContent && isRightOpen;
  const effectiveFullscreen = rightVisible && isRightFullscreen;
  const displayMode: IqujiWorkbenchDisplayMode = !effectiveFullscreen
    ? "split"
    : currentFullscreenTarget === "center"
      ? "fullscreen-center"
      : "fullscreen-right";

  const setLeftCollapsedState = useCallback(
    (next: boolean) => {
      if (leftCollapsed === undefined) setInternalLeftCollapsed(next);
      onLeftCollapsedChange?.(next);
    },
    [leftCollapsed, onLeftCollapsedChange],
  );

  const setRightOpenState = useCallback(
    (next: boolean) => {
      if (rightOpen === undefined) setInternalRightOpen(next);
      onRightOpenChange?.(next);
      if (!next && isRightFullscreen) {
        if (rightFullscreen === undefined) setInternalRightFullscreen(false);
        onRightFullscreenChange?.(false);
      }
    },
    [
      isRightFullscreen,
      onRightFullscreenChange,
      onRightOpenChange,
      rightFullscreen,
      rightOpen,
    ],
  );

  const setFullscreenState = useCallback(
    (next: boolean, target?: IqujiDesktopWorkbenchFullscreenTarget) => {
      if (target !== undefined) {
        if (fullscreenTarget === undefined) setInternalFullscreenTarget(target);
        onFullscreenTargetChange?.(target);
      }
      if (rightFullscreen === undefined) setInternalRightFullscreen(next);
      onRightFullscreenChange?.(next);
    },
    [
      fullscreenTarget,
      onFullscreenTargetChange,
      onRightFullscreenChange,
      rightFullscreen,
    ],
  );

  const setFullscreenTargetState = useCallback(
    (target: IqujiDesktopWorkbenchFullscreenTarget) => {
      if (fullscreenTarget === undefined) setInternalFullscreenTarget(target);
      onFullscreenTargetChange?.(target);
    },
    [fullscreenTarget, onFullscreenTargetChange],
  );

  const selectTab = useCallback(
    (id: string) => {
      if (activeRightTabId === undefined) setInternalActiveTabId(id);
      onActiveRightTabChange?.(id);
    },
    [activeRightTabId, onActiveRightTabChange],
  );

  const handleLayoutChange = useCallback(
    (next: IqujiWorkbenchGeometry) => {
      setGeometry(next);
      onLayoutChange?.(next);
    },
    [onLayoutChange],
  );

  const hasRail = Boolean(rail) || Boolean(railItems && railItems.length > 0);

  useLayoutEffect(() => {
    const host = railHostRef.current;
    if (!hasRail || !host) {
      setRailWidth(0);
      return;
    }
    const measure = () => {
      const measured = host.getBoundingClientRect().width;
      const nextWidth = measured > 0 ? measured : DEFAULT_RAIL_WIDTH;
      setRailWidth((prev) => (prev === nextWidth ? prev : nextWidth));
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(host);
    return () => observer?.disconnect();
  }, [hasRail]);

  useLayoutEffect(() => {
    const segments = segmentsRef.current;
    if (!segments) return;
    const measure = () => {
      const bar = segments.closest("header");
      if (!bar) return;
      const next = Math.max(
        0,
        segments.getBoundingClientRect().left - bar.getBoundingClientRect().left,
      );
      setLeadingInset((prev) => (prev === next ? prev : next));
    };
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(segments);
    return () => observer?.disconnect();
  }, [windowControls, windowControlsPlacement]);

  const resolvedRail = rail ? (
    <div className="iquji-desktop-workbench__rail-host" ref={railHostRef}>
      {rail}
    </div>
  ) : railItems && railItems.length > 0 ? (
    <div className="iquji-desktop-workbench__rail-host" ref={railHostRef}>
      <IqujiDesktopRail
        className="iquji-desktop-workbench__rail"
        footer={railFooter}
        items={railItems}
        label={railLabel}
        showDivider={railShowDivider}
      />
    </div>
  ) : undefined;

  const leftVisible = hasLeft && canToggleLeft && !isLeftCollapsed;
  const effectiveLeftWidth = geometry?.leftWidth ?? (leftVisible ? leftWidth ?? defaultLeftWidth : 0);
  const effectiveRightWidth = geometry?.rightWidth ?? (rightVisible ? rightWidth ?? defaultRightWidth : 0);
  const titleLeftWidth = Math.max(
    0,
    (hasRail ? railWidth || DEFAULT_RAIL_WIDTH : 0) +
      effectiveLeftWidth -
      leadingInset,
  );
  const titleRightWidth = effectiveFullscreen ? 0 : effectiveRightWidth;

  const titleLeadingWidthStyle = {
    "--iquji-desktop-workbench-controls-space":
      windowControlsPlacement === "start" && !windowControls
        ? lengthOf(windowControlsSpace)
        : "0px",
    "--iquji-desktop-workbench-title-left": `${titleLeftWidth}px`,
    "--iquji-desktop-workbench-title-right": `${titleRightWidth}px`,
  } as CSSProperties;

  const rightToggleControl = canToggleRight ? (
    <IconButton
      aria-expanded={rightVisible}
      className="iquji-desktop-workbench__right-toggle"
      compact
      data-active={rightVisible || undefined}
      icon={<IqujiIcon decorative name="panel-right" />}
      label={rightToggleLabel}
      onClick={() => setRightOpenState(!isRightOpen)}
    />
  ) : null;

  const centerHeaderDocument = (
    <div className="iquji-desktop-workbench__center-title">
      {centerIcon ? (
        <span
          aria-hidden="true"
          className="iquji-desktop-workbench__center-icon"
        >
          {centerIcon}
        </span>
      ) : null}
      <div className="iquji-desktop-workbench__center-title-content">
        {centerTitle}
      </div>
    </div>
  );

  const tabStripProps = {
    activeTabId:
      effectiveFullscreen && currentFullscreenTarget === "center"
        ? null
        : resolvedActiveTabId,
    addTabLabel: addRightTabLabel,
    closeTabLabel: closeRightTabLabel,
    label: rightTabsLabel,
    onActiveTabChange: (id: string) => {
      selectTab(id);
      if (effectiveFullscreen) {
        setFullscreenTargetState("right");
      }
    },
    onTabAdd: onRightTabAdd
      ? () => {
          onRightTabAdd();
          if (effectiveFullscreen) setFullscreenTargetState("right");
        }
      : undefined,
    onTabClose: onRightTabClose,
    tabs: tabList,
  };

  const titleBar = (
    <IqujiDesktopTitleBar
      {...titleBarAttributes}
      className="iquji-desktop-workbench__titlebar"
      dragRegion={dragRegion}
      windowControls={windowControls}
      windowControlsPlacement={windowControlsPlacement}
      windowControlsSpace={
        windowControlsPlacement === "end" ? windowControlsSpace : 0
      }
    >
      <div
        className="iquji-desktop-workbench__title-segments"
        data-display-mode={displayMode}
        data-left-visible={leftVisible || undefined}
        data-right-visible={rightVisible || undefined}
        ref={segmentsRef}
        style={titleLeadingWidthStyle}
      >
        <div
          className="iquji-desktop-workbench__title-left"
          {...titleBarAttributes}
        >
          <div className="iquji-desktop-workbench__title-left-start">
            {canToggleLeft ? (
              <IconButton
                aria-expanded={!isLeftCollapsed}
                className="iquji-desktop-workbench__sidebar-toggle"
                compact
                data-active={!isLeftCollapsed || undefined}
                icon={<IqujiIcon decorative name="panel-left" />}
                label={sidebarToggleLabel}
                onClick={() => setLeftCollapsedState(!isLeftCollapsed)}
              />
            ) : null}
            {leadingActions}
          </div>
          {historyNavigation ? (
            <div className="iquji-desktop-workbench__history">
              <IconButton
                compact
                disabled={historyNavigation.canGoBack === false}
                icon={<IqujiIcon decorative name="chevron-left" />}
                label={historyNavigation.backLabel}
                onClick={historyNavigation.onBack}
              />
              <IconButton
                compact
                disabled={historyNavigation.canGoForward === false}
                icon={<IqujiIcon decorative name="chevron-right" />}
                label={historyNavigation.forwardLabel}
                onClick={historyNavigation.onForward}
              />
            </div>
          ) : null}
        </div>

        {!effectiveFullscreen ? (
          <>
            <div
              className={classNames(
                "iquji-desktop-workbench__title-center",
                !rightVisible && "iquji-desktop-workbench__title-single",
              )}
              {...titleBarAttributes}
            >
              {centerHeaderDocument}
              {centerActions || !rightVisible ? (
                <div className="iquji-desktop-workbench__title-actions">
                  {centerActions}
                  {!rightVisible ? globalActions : null}
                  {!rightVisible ? rightToggleControl : null}
                </div>
              ) : null}
            </div>
            {rightVisible ? (
              <div
                className="iquji-desktop-workbench__title-right"
                {...titleBarAttributes}
              >
                <IqujiDesktopTabStrip
                  {...tabStripProps}
                  className="iquji-desktop-workbench__right-tabstrip"
                />
                <div className="iquji-desktop-workbench__title-actions">
                  {globalActions}
                  <IconButton
                    className="iquji-desktop-workbench__enter-fullscreen"
                    compact
                    icon={<IqujiIcon decorative name="maximize" size={15} />}
                    label={enterFullscreenLabel}
                    onClick={() => setFullscreenState(true, "right")}
                  />
                  {rightToggleControl}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div
            className="iquji-desktop-workbench__title-unified"
            {...titleBarAttributes}
          >
            <IqujiDesktopTabStrip
              {...tabStripProps}
              className="iquji-desktop-workbench__unified-tabstrip"
              leadingTab={{
                active: currentFullscreenTarget === "center",
                icon: centerIcon,
                id: "__center__",
                label: centerTabLabel ?? (typeof centerTitle === "string" ? centerTitle : "Workspace"),
                restoreSplit: { label: restoreSplitLabel, onClick: () => setFullscreenState(false) },
                onSelect: () => setFullscreenTargetState("center"),
              }}
            />
            <div className="iquji-desktop-workbench__title-actions">
              {globalActions}
              <IqujiButton
                className="iquji-desktop-workbench__exit-fullscreen"
                compact
                iconStart={<IqujiIcon decorative name="minimize" size={14} />}
                onClick={() => setFullscreenState(false)}
                variant="secondary"
              >
                {exitFullscreenLabel}
              </IqujiButton>
            </div>
          </div>
        )}
      </div>
    </IqujiDesktopTitleBar>
  );

  const hasEmbeddedTabContent = tabList.some(
    (tab) => tab.content !== undefined,
  );
  const renderedRight =
    hasRightContent || hasRightNode ? (
      <div className="iquji-desktop-workbench__right-body">
        {hasEmbeddedTabContent
          ? tabList.map((tab) => {
              const active = tab.id === resolvedActiveTabId;
              return (
                <div
                  aria-hidden={!active || undefined}
                  className="iquji-desktop-workbench__tab-panel"
                  hidden={!active}
                  inert={!active || undefined}
                  key={tab.id}
                  role="tabpanel"
                >
                  {tab.content}
                </div>
              );
            })
          : null}
        {right}
      </div>
    ) : undefined;

  const renderedCenter = (
    <div className="iquji-desktop-workbench__center-body">
      {displayMode === "fullscreen-center" && centerActions ? (
        <div className="iquji-desktop-workbench__center-floating-actions">
          <IqujiTitleBarActions>{centerActions}</IqujiTitleBarActions>
        </div>
      ) : null}
      {center}
    </div>
  );

  return (
    <IqujiDesktopShell
      className={classNames("iquji-desktop-workbench", className)}
      contentId={contentId}
      data-left-visible={leftVisible || undefined}
      rail={resolvedRail}
      skipLinkLabel={skipLinkLabel}
      windowBar={titleBar}
    >
      <IqujiWorkbenchLayout
        center={renderedCenter}
        centerClassName={classNames(
          "iquji-desktop-workbench__center",
          centerClassName,
        )}
        centerMinWidth={centerMinWidth}
        className="iquji-desktop-workbench__layout"
        defaultLeftWidth={defaultLeftWidth}
        defaultRightWidth={defaultRightWidth}
        displayMode={displayMode}
        left={left}
        leftClassName={classNames(
          "iquji-desktop-workbench__left",
          leftClassName,
        )}
        leftCollapsed={!canToggleLeft || isLeftCollapsed}
        leftMaxWidth={leftMaxWidth}
        leftMinWidth={leftMinWidth}
        leftResizeLabel={leftResizeLabel}
        leftWidth={leftWidth}
        onLayoutChange={handleLayoutChange}
        onLeftWidthChange={onLeftWidthChange}
        onRightWidthChange={onRightWidthChange}
        right={renderedRight}
        rightClassName={classNames(
          "iquji-desktop-workbench__right",
          rightClassName,
        )}
        rightCollapsed={!rightVisible}
        rightMaxWidth={rightMaxWidth}
        rightMinWidth={rightMinWidth}
        rightResizeLabel={rightResizeLabel}
        rightWidth={rightWidth}
        surfaceMode="split-card"
      />
    </IqujiDesktopShell>
  );
}
