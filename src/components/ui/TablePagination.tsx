"use client";

import { cn } from "@/lib/utils";

export interface TablePaginationProps {
  entryStart: number;
  entryEnd: number;
  totalItems: number;
  className?: string;
}

export default function TablePagination({
  entryStart,
  entryEnd,
  totalItems,
  className,
}: TablePaginationProps) {
  return (
    <div
      className={cn(
        "border-t border-slate-100 bg-slate-50/50 p-3.5 text-xs font-semibold text-slate-500",
        className,
      )}
    >
      Showing <span className="font-bold text-slate-900">{entryStart}</span> to{" "}
      <span className="font-bold text-slate-900">{entryEnd}</span> of{" "}
      <span className="font-bold text-slate-900">{totalItems}</span> records
    </div>
  );
}
