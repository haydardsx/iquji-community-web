import {
  createContext,
  type ReactNode,
  type ScriptHTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const IQUJI_THEME_MODES = ["light", "dark", "system"] as const;

export type ThemeMode = (typeof IQUJI_THEME_MODES)[number];
export type ResolvedTheme = Exclude<ThemeMode, "system">;
export type Density = "standard" | "compact";

export function parseThemeMode(value: unknown): ThemeMode | undefined {
  return IQUJI_THEME_MODES.find((mode) => mode === value);
}

export function resolveThemeMode(
  mode: ThemeMode,
  prefersDark: boolean,
): ResolvedTheme {
  return mode === "system" ? (prefersDark ? "dark" : "light") : mode;
}

export type ThemePrepaintOptions = {
  storageKey?: string;
  defaultMode?: ThemeMode;
  density?: Density;
};

function serializeInlineScriptValue(value: string): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function createThemePrepaintScript({
  storageKey,
  defaultMode = "system",
  density = "standard",
}: ThemePrepaintOptions): string {
  if (!storageKey)
    return `(()=>{const e=document.documentElement,m=${serializeInlineScriptValue(defaultMode)},r=m==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m;e.dataset.theme=r;e.dataset.density=${serializeInlineScriptValue(density)};e.style.colorScheme=r})()`;
  const serializedKey = serializeInlineScriptValue(storageKey);
  const serializedDefault = serializeInlineScriptValue(defaultMode);
  const serializedDensity = serializeInlineScriptValue(density);

  return `(()=>{const e=document.documentElement,d=${serializedDefault},a=()=>{const r=d==="system"&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":d==="system"?"light":d;e.dataset.theme=r;e.dataset.density=${serializedDensity};e.style.colorScheme=r};try{const s=localStorage.getItem(${serializedKey});const m=s==="light"||s==="dark"||s==="system"?s:d;const r=m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":m==="system"?"light":m;e.dataset.theme=r;e.dataset.density=${serializedDensity};e.style.colorScheme=r}catch{a()}})();`;
}

export type IqujiThemePrepaintScriptProps = ThemePrepaintOptions &
  Pick<ScriptHTMLAttributes<HTMLScriptElement>, "nonce">;

export function IqujiThemePrepaintScript({
  nonce,
  ...options
}: IqujiThemePrepaintScriptProps) {
  return (
    <script
      // 该脚本必须在样式和 React hydration 前同步执行，避免系统深色模式首帧闪白。
      // biome-ignore lint/security/noDangerouslySetInnerHtml: 内容由固定模板和 JSON.stringify 后的配置生成，不接收可执行片段。
      dangerouslySetInnerHTML={{ __html: createThemePrepaintScript(options) }}
      nonce={nonce}
    />
  );
}

export type IqujiThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  density: Density;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<IqujiThemeContextValue | undefined>(
  undefined,
);

function browserPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function initialResolvedTheme(mode: ThemeMode): ResolvedTheme {
  if (typeof document !== "undefined") {
    const prepaintTheme = document.documentElement.dataset.theme;
    if (prepaintTheme === "light" || prepaintTheme === "dark") {
      return prepaintTheme;
    }
  }
  return resolveThemeMode(mode, browserPrefersDark());
}

export type IqujiThemeProviderProps = {
  children: ReactNode;
  storageKey?: string;
  defaultMode?: ThemeMode;
  density?: Density;
};

export function IqujiThemeProvider({
  children,
  storageKey,
  defaultMode = "system",
  density = "standard",
}: IqujiThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return defaultMode;
    }
    try {
      return (
        (storageKey
          ? parseThemeMode(window.localStorage.getItem(storageKey))
          : undefined) ?? defaultMode
      );
    } catch {
      return defaultMode;
    }
  });
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    initialResolvedTheme(mode),
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = resolveThemeMode(mode, media.matches);
      setResolvedTheme(resolved);
      document.documentElement.dataset.theme = resolved;
      document.documentElement.dataset.density = density;
      document.documentElement.style.colorScheme = resolved;
    };
    apply();
    if (mode !== "system") {
      return;
    }
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [density, mode]);

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      setModeState(nextMode);
      try {
        if (storageKey) window.localStorage.setItem(storageKey, nextMode);
      } catch {
        // 浏览器可能禁止持久化；内存中的主题选择仍然立即生效。
      }
    },
    [storageKey],
  );

  const value = useMemo<IqujiThemeContextValue>(
    () => ({ density, mode, resolvedTheme, setMode }),
    [density, mode, resolvedTheme, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useIqujiTheme(): IqujiThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useIqujiTheme must be used within IqujiThemeProvider");
  }
  return context;
}
