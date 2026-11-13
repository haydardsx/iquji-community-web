import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiIcon } from "./index.js";

test("图标按调用方声明提供可访问名称或装饰语义", () => {
  const named = new DOMParser().parseFromString(
    renderToStaticMarkup(
      <IqujiIcon name="circle-info" decorative={false} label="详情" />,
    ),
    "text/html",
  );
  expect(named.querySelector("svg")?.getAttribute("aria-label")).toBe("详情");
  const decorative = new DOMParser().parseFromString(
    renderToStaticMarkup(<IqujiIcon name="sun" decorative />),
    "text/html",
  );
  expect(decorative.querySelector("svg")?.getAttribute("aria-hidden")).toBe(
    "true",
  );
});

test("SVG 属性与独立描边尺寸继续传入实际图标", () => {
  const document = new DOMParser().parseFromString(
    renderToStaticMarkup(
      <IqujiIcon
        name="check"
        size={48}
        strokeWidth={2}
        absoluteStrokeWidth
        className="custom-icon"
        data-purpose="delivery"
      />,
    ),
    "text/html",
  );
  const icon = document.querySelector("svg");
  expect(icon?.getAttribute("width")).toBe("48");
  expect(icon?.getAttribute("height")).toBe("48");
  expect(icon?.getAttribute("stroke-width")).toBe("1");
  expect(icon?.classList.contains("custom-icon")).toBe(true);
  expect(icon?.getAttribute("data-purpose")).toBe("delivery");
});
