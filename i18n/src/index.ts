import {
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const IQUJI_LOCALES = ["zh-CN", "en-US"] as const;
export type Locale = (typeof IQUJI_LOCALES)[number];

export type MessageCatalog<MessageKey extends string = string> = Readonly<
  Record<MessageKey, string>
>;
export type MessageValues = Readonly<Record<string, string | number>>;

export function parseLocale(value: unknown): Locale | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.toLowerCase();
  if (normalized === "zh-cn" || normalized.startsWith("zh")) {
    return "zh-CN";
  }
  if (normalized === "en-us" || normalized.startsWith("en")) {
    return "en-US";
  }
  return undefined;
}

export function createTranslator<MessageKey extends string>(
  catalog: MessageCatalog<MessageKey>,
) {
  return (key: MessageKey, values: MessageValues = {}) =>
    Object.entries(values).reduce(
      (message, [name, value]) =>
        message.replaceAll(`{${name}}`, String(value)),
      catalog[key] ?? key,
    );
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translate: (key: string, values?: MessageValues) => string;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function browserLocale(): Locale | undefined {
  if (typeof navigator === "undefined") {
    return undefined;
  }
  for (const language of navigator.languages) {
    const locale = parseLocale(language);
    if (locale) {
      return locale;
    }
  }
  return parseLocale(navigator.language);
}

export type IqujiLocaleProviderProps<MessageKey extends string = string> = {
  children: ReactNode;
  catalogs: Readonly<Record<Locale, MessageCatalog<MessageKey>>>;
  storageKey?: string;
  defaultLocale?: Locale;
};

export function IqujiLocaleProvider<MessageKey extends string = string>({
  catalogs,
  children,
  storageKey,
  defaultLocale = "zh-CN",
}: IqujiLocaleProviderProps<MessageKey>) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return defaultLocale;
    }
    try {
      return (
        (storageKey
          ? parseLocale(window.localStorage.getItem(storageKey))
          : undefined) ??
        browserLocale() ??
        defaultLocale
      );
    } catch {
      return browserLocale() ?? defaultLocale;
    }
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      try {
        if (storageKey) window.localStorage.setItem(storageKey, nextLocale);
      } catch {
        // 浏览器可能禁止持久化；当前页面仍继续使用用户选择的语言。
      }
    },
    [storageKey],
  );

  const translate = useMemo(
    () => createTranslator(catalogs[locale]),
    [catalogs, locale],
  );
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      translate: (key, values) => translate(key as MessageKey, values),
    }),
    [locale, setLocale, translate],
  );

  return createElement(LocaleContext.Provider, { value }, children);
}

export type IqujiLocaleContextValue<MessageKey extends string = string> = Omit<
  LocaleContextValue,
  "translate"
> & {
  translate: (key: MessageKey, values?: MessageValues) => string;
};

export function useIqujiLocale<
  MessageKey extends string = string,
>(): IqujiLocaleContextValue<MessageKey> {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useIqujiLocale must be used within IqujiLocaleProvider");
  }
  return context as IqujiLocaleContextValue<MessageKey>;
}
