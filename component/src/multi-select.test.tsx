import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { IqujiMultiSelect } from "./multi-select.js";

const options = [
  { value: "alpha", label: "甲" },
  { value: "beta", label: "乙" },
  { value: "gamma", label: "丙", disabled: true },
];

test("多选显示应用传入的标签、已选值与占位文案", () => {
  const markup = renderToStaticMarkup(
    <IqujiMultiSelect
      clearLabel="清空"
      label="服务器"
      onChange={() => {}}
      options={options}
      placeholder="请选择服务器"
      value={["alpha"]}
    />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  expect(document.body.textContent).toContain("服务器");
  expect(document.body.textContent).toContain("甲");
  expect(document.querySelector("select")).toBeNull();
  expect(document.querySelector("[aria-haspopup='listbox']")).not.toBeNull();
});

test("多选在没有选中项时显示占位文案", () => {
  const markup = renderToStaticMarkup(
    <IqujiMultiSelect
      label="服务器"
      onChange={() => {}}
      options={options}
      placeholder="请选择服务器"
      value={[]}
    />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  expect(document.body.textContent).toContain("请选择服务器");
});

test("禁用多选使用正式禁用语义", () => {
  const markup = renderToStaticMarkup(
    <IqujiMultiSelect
      disabled
      label="服务器"
      onChange={() => {}}
      options={options}
      value={[]}
    />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  const trigger = document.querySelector("[aria-haspopup='listbox']");
  expect(trigger?.hasAttribute("disabled")).toBe(true);
});
