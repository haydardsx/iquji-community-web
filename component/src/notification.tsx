import { Toast } from "@base-ui/react/toast";
import { IqujiIcon, type IqujiIconName } from "@iquji-cloud/web-icons";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
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
  /** 自动关闭时间，单位毫秒；0 表示保持显示。 */
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

type NotificationData = { actions?: ReactNode };
const Context = createContext<IqujiNotificationApi | null>(null);
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
  duration = 4500,
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
        data: { actions: options.actions },
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
        >
          {toasts.map((toast) => {
            const tone = (toast.type ?? "info") as keyof typeof icons;
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
                <IqujiIcon
                  className="iquji-notification__icon"
                  decorative
                  name={icons[tone]}
                  size={21}
                />
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
                <Toast.Close
                  render={
                    <IconButton
                      compact
                      className="iquji-notification__close"
                      icon={<IqujiIcon decorative name="close" size={16} />}
                      label={closeLabel}
                    />
                  }
                />
              </Toast.Root>
            );
          })}
        </Toast.Viewport>
      </Toast.Portal>
    </Context.Provider>
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
