import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { type ColumnDef, IqujiDataTable } from "./data-table.js";

type Row = { name: string };
const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "名称" }];

test("renders table rows when data is provided", () => {
  const html = renderToStaticMarkup(
    <IqujiDataTable
      columns={columns}
      data={[{ name: "示例行" }]}
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
