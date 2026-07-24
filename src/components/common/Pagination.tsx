"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  siblingCount?: number;
}

const DOTS = "...";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handlePageSelect = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }
  };

  // Range helper
  const range = (start: number, end: number) => {
    let length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  // Pagination items generator logic
  const paginationRange = React.useMemo(() => {
    const totalPageNumbersToShow = siblingCount + 5;

    if (totalPageNumbersToShow >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [totalPages, siblingCount, currentPage]);

  if (totalPages <= 1) return null;

  const onNext = () => {
    if (currentPage < totalPages) {
      handlePageSelect(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      handlePageSelect(currentPage - 1);
    }
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-8"
    >
      {/* Mobile: Simple Prev/Next list */}
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </p>
        </div>

        <div>
          <ul className="inline-flex items-center gap-x-1.5" role="list">
            <li>
              <button
                type="button"
                onClick={onPrevious}
                disabled={currentPage === 1}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
            </li>

            {paginationRange.map((pageNumber, idx) => {
              if (pageNumber === DOTS) {
                return (
                  <li key={idx}>
                    <span className="inline-flex size-9 items-center justify-center text-slate-400 font-semibold text-xs select-none">
                      &#8230;
                    </span>
                  </li>
                );
              }

              const isCurrent = pageNumber === currentPage;

              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => handlePageSelect(pageNumber as number)}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`inline-flex size-9 items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-primary border border-primary text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    {pageNumber}
                  </button>
                </li>
              );
            })}

            <li>
              <button
                type="button"
                onClick={onNext}
                disabled={currentPage === totalPages}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
