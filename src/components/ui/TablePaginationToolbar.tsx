"use client";

import PageSizeSelector from "@/components/ui/PageSizeSelector";
import PaginationControls from "@/components/ui/PaginationControls";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "@/lib/pagination";
import { cn } from "@/lib/utils";

export interface TablePaginationToolbarProps {
  pageSize: number;
  pageIndex: number;
  totalPages: number;
  onPageSizeChange: (pageSize: number) => void;
  onPageChange: (pageIndex: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
}

export default function TablePaginationToolbar({
  pageSize,
  pageIndex,
  totalPages,
  onPageSizeChange,
  onPageChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: TablePaginationToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <PageSizeSelector
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
      <PaginationControls
        pageIndex={pageIndex}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
