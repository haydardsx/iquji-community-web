import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type ReactNode } from "react";
import { IqujiEmptyState } from "./index.js";
import { IqujiTableFrame } from "./layout.js";
import { classNames } from "./utils.js";

export type { ColumnDef } from "@tanstack/react-table";

export type IqujiDataTableProps<Row> = {
  label: string;
  columns: ColumnDef<Row, any>[];
  data: Row[];
  busy?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  toolbar?: ReactNode;
  onRowClick?: (row: Row) => void;
  rowKey?: (row: Row) => string;
  className?: string;
};

export function IqujiDataTable<Row>({
  busy = false,
  columns,
  data,
  emptyBody = "当前筛选没有结果。",
  emptyTitle = "暂无数据",
  label,
  toolbar,
  onRowClick,
  rowKey,
  className,
}: IqujiDataTableProps<Row>) {
  const table = useReactTable<Row>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    ...(rowKey ? { getRowId: (row) => rowKey(row) } : {}),
  });

  if (data.length === 0) {
    return <IqujiEmptyState body={emptyBody} title={emptyTitle} />;
  }

  return (
    <IqujiTableFrame busy={busy} className={className} label={label} toolbar={toolbar}>
      <table className="iquji-data-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} scope="col">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              data-clickable={onRowClick ? "true" : undefined}
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row.original);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </IqujiTableFrame>
  );
}
