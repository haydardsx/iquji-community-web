import { Toast } from "@base-ui/react/toast";
import { IqujiIcon, type IqujiIconName } from "@iquji-web/web-icons";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { IqujiTone } from "./feedback.js";
import { IconButton } from "./index.js";
import { useIqujiNotificationContainer } from "./overlay-layer.js";

export type IqujiNotificationPlacement =
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight";

export type IqujiNotificationOptions = {
  key?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: Exclude<IqujiTone, "neutral">;
  /** 自动关闭时间，单位毫秒；0 表示保持显示。默认 5000ms。 */
  duration?: number;
  actions?: ReactNode;
  onClose?: () => void;
};

export type IqujiNotificationApi = {
  open(options: IqujiNotificationOptions): string;
  close(key?: string): void;
};

export type IqujiNotificationProviderProps = {
  children: ReactNode;
  closeLabel: string;
  label?: string;
  placement?: IqujiNotificationPlacement;
  duration?: number;
  maxCount?: number;
};

type NotificationData = { actions?: ReactNode; revision: number };
const Context = createContext<IqujiNotificationApi | null>(null);
const TimerPauseContext = createContext(false);
const icons: Record<Exclude<IqujiTone, "neutral">, IqujiIconName> = {
  info: "circle-info",
  success: "check-circle",
  warning: "circle-alert",
  danger: "x-circle",
};

export function IqujiNotificationProvider({
  children,
  closeLabel,
  label = "通知",
  placement = "topRight",
  duration = 5000,
  maxCount = 3,
}: IqujiNotificationProviderProps) {
  if (!closeLabel.trim()) throw new Error("通知必须提供 closeLabel");
  if (!Number.isFinite(duration) || duration < 0)
    throw new Error("通知 duration 必须为非负有限数");
  if (!Number.isInteger(maxCount) || maxCount < 1)
    throw new Error("通知 maxCount 必须为正整数");
  return (
    <Toast.Provider timeout={duration} limit={maxCount}>
      <NotificationContent
        closeLabel={closeLabel}
        label={label}
        placement={placement}
        duration={duration}
        maxCount={maxCount}
      >
        {children}
      </NotificationContent>
    </Toast.Provider>
  );
}

function NotificationContent({
  children,
  closeLabel,
  label,
  placement,
  duration,
  maxCount,
}: Required<IqujiNotificationProviderProps>) {
  const { add, close, update, toasts } =
    Toast.useToastManager<NotificationData>();
  const container = useIqujiNotificationContainer();
  const prefix = useId();
  const sequence = useRef(0);
  const active = useRef(new Map<string, string>());
  const [windowFocused, setWindowFocused] = useState(true);
  useEffect(() => {
    const win = document.defaultView;
    if (!win) return;
    const handleBlur = (event: FocusEvent) => {
      if (event.target === win) setWindowFocused(false);
    };
    const handleFocus = (event: FocusEvent) => {
      if (!event.relatedTarget && event.target !== win) setWindowFocused(true);
    };
    // 与 Toast 的窗口焦点规则保持一致，仅暂停视觉反馈，关闭仍由 Toast 管理。
    win.addEventListener("blur", handleBlur, true);
    win.addEventListener("focus", handleFocus, true);
    return () => {
      win.removeEventListener("blur", handleBlur, true);
      win.removeEventListener("focus", handleFocus, true);
    };
  }, []);
  const open = useCallback(
    (options: IqujiNotificationOptions) => {
      const timeout = options.duration ?? duration;
      if (!Number.isFinite(timeout) || timeout < 0)
        throw new Error("通知 duration 必须为非负有限数");
      const key = options.key ?? `${prefix}-${++sequence.current}`;
      const existing = active.current.get(key);
      const id = existing ?? `${prefix}-notification-${++sequence.current}`;
      const configuration = {
        title: options.title,
        description: options.description,
        type: options.tone ?? "info",
        timeout,
        data: { actions: options.actions, revision: ++sequence.current },
        onClose: () => {
          if (active.current.get(key) === id) active.current.delete(key);
          options.onClose?.();
        },
      };
      if (existing) {
        update(existing, configuration);
      } else {
        // Base UI 的上限只隐藏旧项；主动关闭可同时释放常驻通知和定时器。
        while (active.current.size >= maxCount) {
          const oldest = active.current.values().next().value;
          if (!oldest) break;
          close(oldest);
        }
        active.current.set(key, id);
        add({ ...configuration, id });
      }
      return key;
    },
    [add, close, update, duration, maxCount, prefix],
  );
  const dismiss = useCallback(
    (key?: string) => {
      if (key === undefined) close();
      else {
        const id = active.current.get(key);
        if (id) close(id);
      }
    },
    [close],
  );
  const api = useMemo(() => ({ open, close: dismiss }), [open, dismiss]);
  return (
    <Context.Provider value={api}>
      {children}
      {/* 挂到顶层浮层的 Portal 内，通知操作仍属于该层的焦点与可访问边界。 */}
      <Toast.Portal container={container}>
        <Toast.Viewport
          aria-label={label}
          className="iquji-notification-viewport"
          data-placement={placement}
          render={(props, state) => (
            <div {...props}>
              <TimerPauseContext.Provider
                value={state.expanded || !windowFocused}
              >
                {props.children}
              </TimerPauseContext.Provider>
            </div>
          )}
        >
          {toasts.map((toast) => {
            const tone = (toast.type ?? "info") as keyof typeof icons;
            const timeout = toast.timeout ?? duration;
            return (
              <Toast.Root
                className="iquji-notification"
                data-tone={tone}
                key={toast.id}
                role={tone === "danger" ? "alert" : "status"}
                onKeyDown={(event) => {
                  if (event.key === "Escape") event.stopPropagation();
                }}
                swipeDirection={[]}
                toast={toast}
              >
                <span className="iquji-notification__icon-badge">
                  <IqujiIcon
                    className="iquji-notification__icon"
                    decorative
                    name={icons[tone]}
                    size={14}
                  />
                </span>
                <Toast.Content className="iquji-notification__content">
                  <Toast.Title className="iquji-notification__title" />
                  {toast.description != null && (
                    <Toast.Description className="iquji-notification__description" />
                  )}
                  {toast.data?.actions && (
                    <div className="iquji-notification__actions">
                      {toast.data.actions}
                    </div>
                  )}
                </Toast.Content>
                <NotificationTimer
                  key={toast.data?.revision}
                  duration={timeout}
                  closeLabel={closeLabel}
                />
              </Toast.Root>
            );
          })}
        </Toast.Viewport>
      </Toast.Portal>
    </Context.Provider>
  );
}

function NotificationTimer({
  duration,
  closeLabel,
}: {
  duration: number;
  closeLabel: string;
}) {
  const paused = useContext(TimerPauseContext);
  const remaining = useRef(duration);
  const [seconds, setSeconds] = useState(() => Math.ceil(duration / 1000));
  useEffect(() => {
    if (duration <= 0 || paused) return;
    const started = Date.now();
    const initial = remaining.current;
    const update = () => {
      remaining.current = Math.max(0, initial - (Date.now() - started));
      setSeconds(Math.ceil(remaining.current / 1000));
    };
    const interval = setInterval(() => {
      update();
    }, 100);
    return () => {
      clearInterval(interval);
      remaining.current = Math.max(0, initial - (Date.now() - started));
    };
  }, [duration, paused]);

  return (
    <>
      <div className="iquji-notification__side">
        {duration > 0 && (
          <span aria-hidden="true" className="iquji-notification__countdown">
            {seconds}s
          </span>
        )}
        <Toast.Close
          render={
            <IconButton
              compact
              className="iquji-notification__close"
              icon={<IqujiIcon decorative name="close" size={12} />}
              label={closeLabel}
            />
          }
        />
      </div>
      {duration > 0 && (
        <span
          aria-hidden="true"
          className="iquji-notification__progress"
          style={{
            animationDuration: `${duration}ms`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      )}
    </>
  );
}

export function useIqujiNotification(): IqujiNotificationApi {
  const value = useContext(Context);
  if (!value)
    throw new Error(
      "useIqujiNotification 必须在 IqujiNotificationProvider 中使用",
    );
  return value;
}
