import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiBadge } from "./feedback.js";

test("状态圆点保留语义颜色和可访问名称，不生成额外文字", () => {
  const html = renderToStaticMarkup(
    <IqujiBadge aria-label="存在未读结果" tone="danger" variant="dot" />,
  );
  const host = document.createElement("div");
  host.innerHTML = html;
  const badge = host.querySelector("span");
  expect(badge?.dataset.variant).toBe("dot");
  expect(badge?.dataset.tone).toBe("danger");
  expect(badge?.getAttribute("aria-label")).toBe("存在未读结果");
  expect(badge?.textContent).toBe("");
});

test("普通徽标保持原有标记和文本", () => {
  const html = renderToStaticMarkup(<IqujiBadge tone="info">3</IqujiBadge>);
  expect(html).not.toContain("data-variant");
  expect(html).toContain(">3</span>");
});
