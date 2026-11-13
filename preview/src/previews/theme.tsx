import { IqujiButton } from "@iquji-cloud/web-component";
import {
  createThemePrepaintScript,
  IQUJI_THEME_MODES,
  IqujiThemePrepaintScript,
  parseThemeMode,
  resolveThemeMode,
  useIqujiTheme,
} from "@iquji-cloud/web-theme";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentPreview } from "../catalog";

function ThemeDemo() {
  const { mode, resolvedTheme, setMode, density } = useIqujiTheme();
  const nextMode =
    IQUJI_THEME_MODES[
      (IQUJI_THEME_MODES.indexOf(mode) + 1) % IQUJI_THEME_MODES.length
    ] ?? "light";
  const script = createThemePrepaintScript({
    defaultMode: parseThemeMode(nextMode),
    density,
  });
  const prepaintElement = (
    <IqujiThemePrepaintScript
      defaultMode={nextMode}
      density={density}
      nonce="preview-nonce"
    />
  );
  const prepaintMarkup = renderToStaticMarkup(prepaintElement);
  return (
    <div className="catalog-preview-stack">
      <div className="catalog-preview-grid">
        <IqujiButton onClick={() => setMode(nextMode)} variant="secondary">
          切换到 {nextMode}
        </IqujiButton>
        <span className="catalog-preview-copy">
          模式：{mode}，实际主题：{resolvedTheme}，密度：{density}
        </span>
      </div>
      <p className="catalog-preview-copy">
        system + 深色偏好会解析为 {resolveThemeMode("system", true)}。
      </p>
      <code className="catalog-code-block">{prepaintMarkup}</code>
      <code className="catalog-code-block">{script.slice(0, 160)}…</code>
    </div>
  );
}

export const themePreviews: readonly ComponentPreview[] = [
  {
    id: "theme-preferences",
    name: "主题与首帧脚本",
    packageId: "theme",
    packageName: "@iquji-cloud/web-theme",
    category: "主题",
    description: "切换主题模式并查看主题首帧脚本和密度状态。",
    keywords: "theme dark light system prepaint density",
    render: () => <ThemeDemo />,
  },
];
