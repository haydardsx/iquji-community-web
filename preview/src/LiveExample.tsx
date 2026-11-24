import { IqujiOverlayProvider } from "@iquji-community/web-component";
import {
  IqujiLocaleProvider,
  type Locale,
  useIqujiLocale,
} from "@iquji-community/web-i18n";
import { IqujiThemeProvider } from "@iquji-community/web-theme";
import { type ReactNode, useEffect } from "react";
import "@iquji-community/web-theme/tokens.css";
import "@iquji-community/web-component/styles.css";
import "@iquji-community/web-editor/styles.css";
import "./styles/details.css";
import type { ComponentPreviewId } from "./catalog";
import { componentPreviews } from "./previews";

// 文档语言决定示例的初始语言；国际化示例仍可自行切换。
function PageLanguage({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const { setLocale } = useIqujiLocale();
  useEffect(() => setLocale(locale), [locale, setLocale]);
  return children;
}

export default function LiveExample({
  id,
  language,
}: {
  id: ComponentPreviewId;
  language: "en" | "zh";
}) {
  const demo = componentPreviews.find((item) => item.id === id);
  const locale = language === "en" ? "en-US" : "zh-CN";
  return (
    <div className="catalog-preview">
      <IqujiThemeProvider defaultMode="system">
        <IqujiLocaleProvider
          catalogs={{ "en-US": {}, "zh-CN": {} }}
          defaultLocale={locale}
        >
          <PageLanguage locale={locale}>
            <IqujiOverlayProvider>{demo?.render()}</IqujiOverlayProvider>
          </PageLanguage>
        </IqujiLocaleProvider>
      </IqujiThemeProvider>
    </div>
  );
}
