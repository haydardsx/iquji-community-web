import { afterEach, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiDesktopRail } from "./desktop-rail.js";
import { IqujiBadge } from "./feedback.js";

afterEach(() => document.body.replaceChildren());

function renderBadge(badge: ReactNode) {
  const style = document.createElement("style");
  style.textContent =
    readFileSync(new URL("./desktop-shell.css", import.meta.url), "utf8") +
    readFileSync(new URL("./feedback.css", import.meta.url), "utf8");
  document.body.append(style);
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(
    <IqujiDesktopRail
      label="导航"
      items={[{ id: "records", label: "记录", icon: <span>记录</span>, badge }]}
    />,
  );
  document.body.append(host);
  return host.querySelector<HTMLElement>(".iquji-desktop-rail__badge");
}

test("自定义徽标返回空内容时不残留有背景的横条", () => {
  function EmptyBadge() {
    return null;
  }
  const badge = renderBadge(<EmptyBadge />);
  expect(badge).not.toBeNull();
  expect(getComputedStyle(badge!).display).toBe("none");
});

test("自定义圆点不叠加导航数量胶囊的背景和内边距", () => {
  const badge = renderBadge(
    <IqujiBadge tone="success" variant="dot" aria-label="有未读结果" />,
  );
  const computed = getComputedStyle(badge!);
  expect(computed.backgroundColor).toBe("transparent");
  expect(computed.paddingTop).toBe("0px");
  expect(computed.paddingLeft).toBe("0px");
  expect(Number.parseFloat(computed.minWidth)).toBe(0);
  expect(
    badge?.querySelector('[data-variant="dot"]')?.getAttribute("data-tone"),
  ).toBe("success");
});

test("普通数字数量仍使用原有胶囊", () => {
  const badge = renderBadge(3);
  expect(badge?.textContent).toBe("3");
  expect(badge?.hasAttribute("data-custom")).toBe(false);
  expect(getComputedStyle(badge!).minWidth).toBe("14px");
});
