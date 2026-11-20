import { IqujiButton } from "@iquji-community/web-component";
import {
  createThemePrepaintScript,
  IQUJI_THEME_MODES,
  IqujiThemePrepaintScript,
  parseThemeMode,
  resolveThemeMode,
  useIqujiTheme,
} from "@iquji-community/web-theme";
import { renderToStaticMarkup } from "react-dom/server";
import type { ComponentPreview } from "../catalog";
import { usePreviewText } from "../i18n/use-preview-text";

function ThemeDemo() {
  const text = usePreviewText();
  const { mode, resolvedTheme, setMode, density } = useIqujiTheme();
  const modes = {
    light: text("浅色", "Light"),
    dark: text("深色", "Dark"),
    system: text("跟随系统", "System"),
  };
  const densities = {
    standard: text("标准", "Standard"),
    compact: text("紧凑", "Compact"),
  };
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
          {text(`切换到${modes[nextMode]}`, `Switch to ${modes[nextMode]}`)}
        </IqujiButton>
        <span className="catalog-preview-copy">
          {text(
            `模式：${modes[mode]}，实际主题：${modes[resolvedTheme]}，密度：${densities[density]}`,
            `Mode: ${modes[mode]}. Resolved theme: ${modes[resolvedTheme]}. Density: ${densities[density]}.`,
          )}
        </span>
      </div>
      <p className="catalog-preview-copy">
        {text(
          `跟随系统时，深色偏好会启用${modes[resolveThemeMode("system", true)]}。`,
          `System mode applies the ${modes[resolveThemeMode("system", true)]} theme when dark mode is preferred.`,
        )}
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
    packageName: "@iquji-community/web-theme",
    category: "主题",
    description: "切换主题模式并查看主题首帧脚本和密度状态。",
    keywords: "theme dark light system prepaint density",
    render: () => <ThemeDemo />,
  },
];
