import { IqujiOverlayProvider } from "@iquji-web/web-component";
import { IqujiLocaleProvider } from "@iquji-web/web-i18n";
import { IqujiThemeProvider } from "@iquji-web/web-theme";
import "@iquji-web/web-theme/tokens.css";
import "@iquji-web/web-component/styles.css";
import "@iquji-web/web-editor/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { PREVIEW_LOCALES } from "./i18n/locales";
import "./preview.css";

const root = document.getElementById("root");
if (!root) throw new Error("预览页面缺少根节点");

createRoot(root).render(
  <StrictMode>
    <IqujiThemeProvider
      defaultMode="system"
      storageKey="iquji.web.preview.theme"
    >
      <IqujiLocaleProvider
        catalogs={PREVIEW_LOCALES}
        defaultLocale="zh-CN"
        storageKey="iquji.web.preview.locale"
      >
        <IqujiOverlayProvider>
          <App />
        </IqujiOverlayProvider>
      </IqujiLocaleProvider>
    </IqujiThemeProvider>
  </StrictMode>,
);
