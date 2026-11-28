import { Tooltip } from "@base-ui/react/tooltip";
import {
  type ButtonHTMLAttributes,
  cloneElement,
  createContext,
  type ReactElement,
  type ReactNode,
  useContext,
} from "react";

const TitleBarActionContext = createContext(false);

/** 让通过 Portal 注入标题栏的图标操作也使用桌面提示样式。 */
export function IqujiTitleBarActions({ children }: { children: ReactNode }) {
  const inTitleBar = useContext(TitleBarActionContext);
  if (inTitleBar) return <>{children}</>;
  return (
    <TitleBarActionContext.Provider value={true}>
      <Tooltip.Provider delay={320} timeout={450}>{children}</Tooltip.Provider>
    </TitleBarActionContext.Provider>
  );
}

export function TitleBarActionTooltip({
  button,
  label,
}: {
  button: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
  label: string;
}) {
  const inTitleBar = useContext(TitleBarActionContext);
  if (!inTitleBar) return button;
  return (
    <Tooltip.Root disableHoverablePopup>
      <Tooltip.Trigger
        data-iquji-titlebar-icon=""
        data-popup-open={undefined}
        disabled={
          button.props.disabled ||
          button.props["aria-disabled"] === true ||
          button.props["aria-disabled"] === "true"
        }
        id={button.props.id}
        render={cloneElement(button, { title: undefined })}
      />
      <Tooltip.Portal>
        <Tooltip.Positioner
          className="iquji-desktop-action-tip-positioner"
          collisionPadding={6}
          side="bottom"
          sideOffset={4}
        >
          <Tooltip.Popup className="iquji-desktop-action-tip" role="tooltip">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
