import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { IqujiScrollArea } from "./scroll-area.js";

test("滚动区域暴露命名区域、可聚焦容器与尺寸", () => {
  const markup = renderToStaticMarkup(
    <IqujiScrollArea label="运行日志" maxHeight={240}>
      <p>日志内容</p>
    </IqujiScrollArea>,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  const region = document.querySelector("[role='region']");
  expect(region?.getAttribute("aria-label")).toBe("运行日志");
  expect(region?.getAttribute("tabindex")).toBe("0");
  expect(region?.getAttribute("data-orientation")).toBe("vertical");
  expect(region?.getAttribute("style")).toMatch(/max-height:\s*240px/);
});

test("横向滚动区域使用独立方向语义", () => {
  const markup = renderToStaticMarkup(
    <IqujiScrollArea label="长表格" orientation="horizontal">
      <span>内容</span>
    </IqujiScrollArea>,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  expect(document.querySelector("[role='region']")?.getAttribute("data-orientation")).toBe(
    "horizontal",
  );
});
