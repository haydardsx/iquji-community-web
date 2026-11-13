import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { IqujiTimeline } from "./timeline.js";

const items = [
  {
    id: "one",
    title: "创建任务",
    description: "任务已进入队列",
    timestamp: "10:00",
    tone: "info" as const,
  },
  {
    id: "two",
    title: "执行完成",
    timestamp: "10:02",
    tone: "success" as const,
    status: "成功",
  },
];

test("时间线使用有序列表并保留调用方传入的语义", () => {
  const markup = renderToStaticMarkup(
    <IqujiTimeline items={items} label="任务时间线" />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  expect(document.querySelectorAll("ol > li")).toHaveLength(2);
  expect(document.querySelector("[aria-label='任务时间线']")).not.toBeNull();
  expect(document.body.textContent).toContain("创建任务");
  expect(document.body.textContent).toContain("执行完成");
  expect(document.body.textContent).toContain("成功");
  expect(document.querySelectorAll("button")).toHaveLength(0);
});

test("空时间线显示调用方传入的空态文案", () => {
  const markup = renderToStaticMarkup(
    <IqujiTimeline emptyLabel="还没有记录" items={[]} label="任务时间线" />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  expect(document.body.textContent).toContain("还没有记录");
  expect(document.querySelector("ol")).toBeNull();
});
