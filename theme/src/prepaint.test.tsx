import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  createThemePrepaintScript,
  IqujiThemePrepaintScript,
  parseThemeMode,
  resolveThemeMode,
} from "./index.js";

test("resolves only canonical theme values", () => {
  expect(parseThemeMode("dark")).toBe("dark");
  expect(parseThemeMode("auto")).toBeUndefined();
  expect(resolveThemeMode("system", true)).toBe("dark");
  expect(resolveThemeMode("system", false)).toBe("light");
});

test("creates an inline prepaint script without leaking raw storage keys", () => {
  const key = `iquji.platform.theme"</script>`;
  const script = createThemePrepaintScript({ storageKey: key });
  const markup = renderToStaticMarkup(
    <IqujiThemePrepaintScript nonce="nonce-value" storageKey={key} />,
  );

  expect(script).toContain("e.dataset.theme");
  expect(script).not.toContain("</script>");
  expect(script).toContain("\\u003c/script>");
  expect(markup).toContain('nonce="nonce-value"');
});
