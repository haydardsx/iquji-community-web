import type { ReactNode } from "react";
import { IqujiButton } from "./index.js";
import { classNames } from "./utils.js";

export type IqujiPaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  label: string;
  previousLabel: string;
  nextLabel: string;
  summary?: (total: number, range: [number, number]) => ReactNode;
  onPageChange?: (page: number, pageSize: number) => void;
  className?: string;
};

export function IqujiPagination({
  page,
  pageSize,
  total,
  label,
  previousLabel,
  nextLabel,
  summary,
  onPageChange,
  className,
}: IqujiPaginationProps) {
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(pageSize) ||
    pageSize < 1 ||
    !Number.isSafeInteger(total) ||
    total < 0
  ) {
    throw new RangeError("分页必须使用有效页码、正整数页大小和非负总数");
  }
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const range: [number, number] = [
    total === 0 ? 0 : Math.min(total, (page - 1) * pageSize + 1),
    Math.min(total, page * pageSize),
  ];
  return (
    <nav
      aria-label={label}
      className={classNames("iquji-pagination", className)}
    >
      {summary ? <span>{summary(total, range)}</span> : null}
      <IqujiButton
        compact
        disabled={!onPageChange || page <= 1}
        onClick={() => onPageChange?.(page - 1, pageSize)}
        variant="secondary"
      >
        {previousLabel}
      </IqujiButton>
      <span>
        {page} / {pageCount}
      </span>
      <IqujiButton
        compact
        disabled={!onPageChange || page >= pageCount}
        onClick={() => onPageChange?.(page + 1, pageSize)}
        variant="secondary"
      >
        {nextLabel}
      </IqujiButton>
    </nav>
  );
}
