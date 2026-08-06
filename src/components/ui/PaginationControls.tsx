"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/common/Button";
import { cn } from "@/lib/utils";
import { DOTS, getPaginationRange } from "@/lib/pagination";

export interface PaginationControlsProps {
  pageIndex: number;
  totalPages: number;
  onPageChange: (pageIndex: number) => void;
  siblingCount?: number;
  className?: string;
}

export default function PaginationControls({
  pageIndex,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}: PaginationControlsProps) {
  const currentPage = pageIndex + 1;
  const paginationRange = useMemo(
    () => getPaginationRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount],
  );

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Button
        variant="outline"
        size="sm"
        className="flex cursor-pointer items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(pageIndex - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={13} /> Prev
      </Button>

      <div className="hidden items-center gap-1 md:flex">
        {paginationRange.map((pageNumber, index) =>
          pageNumber === DOTS ? (
            <span
              key={`dots-${index}`}
              className="inline-flex size-8 items-center justify-center text-slate-400"
            >
              &#8230;
            </span>
          ) : (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange((pageNumber as number) - 1)}
              aria-current={pageNumber === currentPage ? "page" : undefined}
              className={cn(
                "inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border text-xs font-bold transition-all",
                pageNumber === currentPage
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              {pageNumber}
            </button>
          ),
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-2xs md:hidden">
        Page {currentPage} of {totalPages}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="flex cursor-pointer items-center gap-1 px-2.5 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(pageIndex + 1)}
        aria-label="Next page"
      >
        Next <ChevronRight size={13} />
      </Button>
    </div>
  );
}
