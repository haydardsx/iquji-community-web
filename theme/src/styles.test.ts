import { afterEach, expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

const device = (
  window as unknown as {
    happyDOM: { settings: { device: { prefersReducedMotion: string } } };
  }
).happyDOM.settings.device;
const originalMotion = device.prefersReducedMotion;
const styles: HTMLStyleElement[] = [];

afterEach(() => {
  for (const style of styles.splice(0)) style.remove();
  device.prefersReducedMotion = originalMotion;
  document.body.replaceChildren();
});

async function applyStyles(specifier: string) {
  const result = await Bun.build({
    entrypoints: [fileURLToPath(import.meta.resolve(specifier))],
    target: "browser",
  });
  if (!result.success || !result.outputs[0])
    throw new AggregateError(result.logs, "样式出口构建失败");
  const style = document.createElement("style");
  style.textContent = await result.outputs[0].text();
  document.head.append(style);
  styles.push(style);
}

test("浅色主题辅助文字在画布上保持可读对比度", async () => {
  await applyStyles("@iquji-web/web-theme/tokens.css");
  const computed = getComputedStyle(document.documentElement);
  const luminance = (value: string) => {
    const channels = value
      .trim()
      .slice(1)
      .match(/.{2}/g)
      ?.map((channel) => Number.parseInt(channel, 16) / 255);
    if (channels?.length !== 3) throw new Error("主题必须提供正式色值");
    const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
    return red * 0.2126 + green * 0.7152 + blue * 0.0722;
  };
  const muted = luminance(computed.getPropertyValue("--iquji-color-muted"));
  const canvas = luminance(computed.getPropertyValue("--iquji-color-canvas"));
  expect(
    (Math.max(muted, canvas) + 0.05) / (Math.min(muted, canvas) + 0.05),
  ).toBeGreaterThanOrEqual(4.5);
});

test.each([
  "no-preference",
  "reduce",
])("主题独立出口按 %s 提供通用动效时长", async (preference) => {
  device.prefersReducedMotion = preference;
  await applyStyles("@iquji-web/web-theme/tokens.css");
  const computed = getComputedStyle(document.documentElement);
  expect(computed.getPropertyValue("--iquji-color-canvas")).not.toBe("");
  const durations = ["control", "overlay", "route"].map((name) =>
    computed.getPropertyValue(`--iquji-motion-${name}`).trim(),
  );
  for (const duration of durations) {
    expect(Number.parseFloat(duration)).toBeGreaterThan(0);
    if (preference === "reduce")
      expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.01);
    else expect(Number.parseFloat(duration)).toBeGreaterThan(0.01);
  }
});
