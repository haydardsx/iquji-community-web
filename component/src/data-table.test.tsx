import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { type ColumnDef, IqujiDataTable } from "./data-table.js";

type Row = { id: string; name: string; action: string };
const columns: ColumnDef<Row>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "名称" },
  { accessorKey: "action", header: "操作" },
];

test("renders table rows when data is provided", () => {
  const html = renderToStaticMarkup(
    <IqujiDataTable
      columns={columns}
      data={[{ id: "1", name: "示例行", action: "编辑" }]}
      label="示例表"
    />,
  );
  expect(html).toContain("<table");
  expect(html).toContain("示例行");
});

test("renders empty state when data is empty", () => {
  const html = renderToStaticMarkup(
    <IqujiDataTable
      columns={columns}
      data={[]}
      emptyTitle="暂无记录"
      label="示例表"
    />,
  );
  expect(html).not.toContain("<table");
  expect(html).toContain("暂无记录");
});

test("supports pinning first and last columns", () => {
  const html = renderToStaticMarkup(
    <IqujiDataTable
      columns={columns}
      data={[{ id: "1", name: "示例行", action: "编辑" }]}
      label="固定列示例"
      pinFirstColumn
      pinLastColumn
    />,
  );
  expect(html).toContain("is-pinned-left");
  expect(html).toContain("is-pinned-right");
});
