import { Component, createRef, type ReactNode, type RefObject } from "react";

type Size = { width: number; height: number };
type Props = {
  open: boolean;
  expanded: boolean;
  children: (ref: RefObject<HTMLDivElement | null>) => ReactNode;
};

/** auto 高度必须在提交前测量，直接 transition 无法在 WebKit 中连续插值。 */
export class FormDialogResize extends Component<
  Props,
  Record<string, never>,
  Size | null
> {
  private popup = createRef<HTMLDivElement>();
  private animation: Animation | null = null;
  private motion: MediaQueryList | null = null;

  componentDidMount() {
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.motion.addEventListener("change", this.preferenceChanged);
    window.addEventListener("resize", this.stop);
  }

  getSnapshotBeforeUpdate(previous: Props): Size | null {
    if (
      !previous.open ||
      !this.props.open ||
      previous.expanded === this.props.expanded
    )
      return null;
    const bounds = this.popup.current?.getBoundingClientRect();
    return bounds ? { width: bounds.width, height: bounds.height } : null;
  }

  componentDidUpdate(
    _previous: Props,
    _state: Record<string, never>,
    before: Size | null,
  ) {
    if (!this.props.open) {
      this.stop();
      return;
    }
    if (!before) return;
    this.stop();
    const popup = this.popup.current;
    if (!popup || this.motion?.matches || typeof popup.animate !== "function")
      return;
    const after = popup.getBoundingClientRect();
    if (before.width === after.width && before.height === after.height) return;
    const style = getComputedStyle(popup);
    const token = style.getPropertyValue("--iquji-motion-overlay").trim();
    const duration =
      Number.parseFloat(token) * (token.endsWith("ms") ? 1 : 1000);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const animation = popup.animate(
      [
        {
          width: `${before.width}px`,
          height: `${before.height}px`,
          maxHeight: `${before.height}px`,
        },
        {
          width: `${after.width}px`,
          height: `${after.height}px`,
          maxHeight: `${after.height}px`,
        },
      ],
      {
        duration,
        easing:
          style.getPropertyValue("--iquji-ease-standard").trim() || "ease",
      },
    );
    this.animation = animation;
    animation.onfinish = () => {
      if (this.animation === animation) this.animation = null;
    };
  }

  componentWillUnmount() {
    this.stop();
    this.motion?.removeEventListener("change", this.preferenceChanged);
    window.removeEventListener("resize", this.stop);
  }

  private stop = () => {
    const animation = this.animation;
    this.animation = null;
    animation?.cancel();
  };

  private preferenceChanged = () => {
    if (this.motion?.matches) this.stop();
  };

  render() {
    return this.props.children(this.popup);
  }
}
