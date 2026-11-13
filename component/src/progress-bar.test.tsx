import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { IqujiProgressBar } from "./progress-bar.js";

test("确定进度暴露正式 aria 数值并裁剪越界值", () => {
  const markup = renderToStaticMarkup(
    <IqujiProgressBar label="部署进度" max={200} showValue value={250} />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  const bar = document.querySelector("[role='progressbar']");
  expect(bar?.getAttribute("aria-valuemin")).toBe("0");
  expect(bar?.getAttribute("aria-valuemax")).toBe("200");
  expect(bar?.getAttribute("aria-valuenow")).toBe("200");
  expect(document.body.textContent).toContain("100%");
});

test("不定进度不伪造 aria-valuenow", () => {
  const markup = renderToStaticMarkup(<IqujiProgressBar indeterminate label="执行中" />);
  const document = new DOMParser().parseFromString(markup, "text/html");
  const bar = document.querySelector("[role='progressbar']");
  expect(bar?.hasAttribute("aria-valuenow")).toBe(false);
  expect(bar?.getAttribute("data-indeterminate")).toBe("true");
});

test("自定义格式化与 tone 由调用方传入", () => {
  const markup = renderToStaticMarkup(
    <IqujiProgressBar
      formatValue={(value, max) => `${value} / ${max}`}
      label="步骤"
      max={4}
      showValue
      tone="success"
      value={2}
    />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  expect(document.body.textContent).toContain("2 / 4");
  expect(document.querySelector("[data-tone='success']")).not.toBeNull();
});

test("非法最大值拒绝渲染", () => {
  expect(() =>
    renderToStaticMarkup(<IqujiProgressBar label="进度" max={0} value={1} />),
  ).toThrow(RangeError);
});
