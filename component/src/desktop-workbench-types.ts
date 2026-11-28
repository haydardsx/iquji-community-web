import type { ReactNode } from "react";
import type { IqujiDesktopRailItem } from "./desktop-rail.js";
import type { IqujiDesktopTab } from "./desktop-tabs.js";
import type { IqujiWorkbenchGeometry } from "./workbench.js";

export type IqujiDesktopWorkbenchTab = IqujiDesktopTab & {
  content?: ReactNode;
};

export type IqujiDesktopWorkbenchFullscreenTarget = "center" | "right";

export type IqujiDesktopWorkbenchHistoryNavigation = {
  canGoBack?: boolean | undefined;
  canGoForward?: boolean | undefined;
  onBack?: (() => void) | undefined;
  onForward?: (() => void) | undefined;
  backLabel: string;
  forwardLabel: string;
};

export type IqujiDesktopWorkbenchProps = {
  rail?: ReactNode;
  railItems?: readonly IqujiDesktopRailItem[] | undefined;
  railLabel?: string | undefined;
  railFooter?: ReactNode;
  railShowDivider?: boolean | undefined;
  skipLinkLabel?: string | undefined;
  contentId?: string | undefined;
  className?: string | undefined;

  windowControls?: ReactNode;
  windowControlsPlacement?: "start" | "end" | undefined;
  windowControlsSpace?: number | string | undefined;
  dragRegion?: boolean | undefined;
  titleBarAttributes?: { [key: `data-${string}`]: string | undefined };
  historyNavigation?: IqujiDesktopWorkbenchHistoryNavigation | undefined;
  leadingActions?: ReactNode;
  globalActions?: ReactNode;
  sidebarToggleLabel?: string | undefined;

  left?: ReactNode;
  leftAvailable?: boolean | undefined;
  leftWidth?: number | undefined;
  defaultLeftWidth?: number | undefined;
  onLeftWidthChange?: ((width: number) => void) | undefined;
  leftMinWidth?: number | undefined;
  leftMaxWidth?: number | undefined;
  leftCollapsed?: boolean | undefined;
  defaultLeftCollapsed?: boolean | undefined;
  onLeftCollapsedChange?: ((collapsed: boolean) => void) | undefined;
  leftResizeLabel?: string | undefined;
  leftClassName?: string | undefined;

  center: ReactNode;
  centerTitle?: ReactNode;
  centerIcon?: ReactNode;
  centerTabLabel?: string | undefined;
  centerActions?: ReactNode;
  centerMinWidth?: number | undefined;
  centerClassName?: string | undefined;

  right?: ReactNode;
  rightAvailable?: boolean | undefined;
  rightTabs?: readonly IqujiDesktopWorkbenchTab[] | undefined;
  activeRightTabId?: string | null | undefined;
  defaultActiveRightTabId?: string | null | undefined;
  onActiveRightTabChange?: ((id: string) => void) | undefined;
  onRightTabClose?: ((id: string) => void) | undefined;
  onRightTabAdd?: (() => void) | undefined;
  addRightTabLabel?: string | undefined;
  closeRightTabLabel?: ((tab: IqujiDesktopTab) => string) | undefined;
  rightTabsLabel?: string | undefined;
  rightWidth?: number | undefined;
  defaultRightWidth?: number | undefined;
  onRightWidthChange?: ((width: number) => void) | undefined;
  rightMinWidth?: number | undefined;
  rightMaxWidth?: number | undefined;
  rightOpen?: boolean | undefined;
  defaultRightOpen?: boolean | undefined;
  onRightOpenChange?: ((open: boolean) => void) | undefined;
  rightResizeLabel?: string | undefined;
  rightToggleLabel?: string | undefined;
  rightClassName?: string | undefined;

  rightFullscreen?: boolean | undefined;
  defaultRightFullscreen?: boolean | undefined;
  onRightFullscreenChange?: ((fullscreen: boolean) => void) | undefined;
  fullscreenTarget?: IqujiDesktopWorkbenchFullscreenTarget | undefined;
  defaultFullscreenTarget?: IqujiDesktopWorkbenchFullscreenTarget | undefined;
  onFullscreenTargetChange?:
    | ((target: IqujiDesktopWorkbenchFullscreenTarget) => void)
    | undefined;
  enterFullscreenLabel?: string | undefined;
  exitFullscreenLabel?: string | undefined;
  restoreSplitLabel?: string | undefined;

  onLayoutChange?: ((geometry: IqujiWorkbenchGeometry) => void) | undefined;
};
