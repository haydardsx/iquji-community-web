import {
  createContext,
  type ReactNode,
  type RefObject,
  useContext,
  useMemo,
} from "react";

export type IqujiOverlayContainer =
  | HTMLElement
  | ShadowRoot
  | RefObject<HTMLElement | ShadowRoot | null>
  | null;

export type IqujiOverlayScopeProviderProps = {
  children: ReactNode;
  container: IqujiOverlayContainer;
};

const IqujiOverlayScopeContext = createContext<
  IqujiOverlayContainer | undefined
>(undefined);

export function IqujiOverlayScopeProvider({
  children,
  container,
}: IqujiOverlayScopeProviderProps) {
  const value = useMemo(() => container, [container]);
  return (
    <IqujiOverlayScopeContext.Provider value={value}>
      {children}
    </IqujiOverlayScopeContext.Provider>
  );
}

export function useIqujiOverlayContainer() {
  return useContext(IqujiOverlayScopeContext);
}
