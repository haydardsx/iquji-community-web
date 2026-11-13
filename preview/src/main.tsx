import { IqujiOverlayProvider } from "@iquji-web/web-component";
import { IqujiThemeProvider } from "@iquji-web/web-theme";
import "@iquji-web/web-theme/tokens.css";
import "@iquji-web/web-component/styles.css";
import "@iquji-web/web-editor/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./preview.css";

const root = document.getElementById("root");
if (!root) throw new Error("预览页面缺少根节点");

createRoot(root).render(
  <StrictMode>
    <IqujiThemeProvider
      defaultMode="system"
      storageKey="iquji.web.preview.theme"
    >
      <IqujiOverlayProvider>
        <App />
      </IqujiOverlayProvider>
    </IqujiThemeProvider>
  </StrictMode>,
);
