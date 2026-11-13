import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { IqujiPagination, type IqujiPaginationProps } from "./pagination.js";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
afterEach(() => document.body.replaceChildren());
const labels = { label: "分页", previousLabel: "上一页", nextLabel: "下一页" };

test("分页在首尾与空结果保持正式禁用语义，仅发出有效页变更", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const changes: [number, number][] = [];
  const render = async (page: number, total: number) => {
    await act(async () => {
      root.render(
        <IqujiPagination
          {...labels}
          page={page}
          pageSize={10}
          total={total}
          onPageChange={(next, size) => changes.push([next, size])}
        />,
      );
    });
  };
  try {
    await render(1, 21);
    const [previous, next] = host.querySelectorAll("button");
    if (!previous || !next) throw new Error("缺少分页操作");
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(false);
    await act(async () => {
      previous.click();
      next.click();
    });
    expect(changes).toEqual([[2, 10]]);
    await render(3, 21);
    expect(previous.disabled).toBe(false);
    expect(next.disabled).toBe(true);
    await act(async () => {
      previous.click();
      next.click();
    });
    expect(changes).toEqual([
      [2, 10],
      [2, 10],
    ]);
    await render(1, 0);
    expect(previous.disabled).toBe(true);
    expect(next.disabled).toBe(true);
    await act(async () => {
      previous.click();
      next.click();
    });
    expect(changes).toEqual([
      [2, 10],
      [2, 10],
    ]);
  } finally {
    await act(async () => root.unmount());
  }
});

test("文案与摘要由消费方注入，不依赖应用词典", () => {
  const markup = renderToStaticMarkup(
    <IqujiPagination
      label="Results pages"
      previousLabel="Previous"
      nextLabel="Next"
      page={2}
      pageSize={10}
      total={15}
      summary={(total, [start, end]) => `Showing ${start}–${end} of ${total}`}
    />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  expect(document.querySelector("nav")?.getAttribute("aria-label")).toBe(
    "Results pages",
  );
  expect(document.body.textContent).toContain("Showing 11–15 of 15");
  expect(document.body.textContent).toContain("Previous");
  expect(document.body.textContent).toContain("Next");
});

test("只读分页不显示可以激活的空操作", () => {
  const markup = renderToStaticMarkup(
    <IqujiPagination {...labels} page={2} pageSize={10} total={30} />,
  );
  const document = new DOMParser().parseFromString(markup, "text/html");
  for (const button of document.querySelectorAll("button")) {
    expect(button.disabled).toBe(true);
  }
});

test.each([
  { page: 0 },
  { page: Number.NaN },
  { pageSize: 0 },
  { pageSize: 1.5 },
  { total: -1 },
  { total: Number.POSITIVE_INFINITY },
])("无效分页输入拒绝产生不确定导航：%j", (invalid) => {
  const props: IqujiPaginationProps = {
    ...labels,
    page: 1,
    pageSize: 10,
    total: 0,
    ...invalid,
  };
  expect(() => renderToStaticMarkup(<IqujiPagination {...props} />)).toThrow(
    RangeError,
  );
});
