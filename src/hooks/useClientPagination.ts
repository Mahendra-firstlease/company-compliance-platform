"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  getPageBounds,
  getTotalPages,
  paginateArray,
} from "@/lib/pagination";

export interface UseClientPaginationOptions {
  initialPageSize?: number;
  pageSizeOptions?: readonly number[];
  resetDeps?: unknown[];
}

export function useClientPagination<T>(
  items: T[],
  {
    initialPageSize = 10,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    resetDeps = [],
  }: UseClientPaginationOptions = {},
) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  useEffect(() => {
    setPageIndex(0);
  }, [items.length, pageSize, ...resetDeps]);

  const totalItems = items.length;
  const totalPages = getTotalPages(totalItems, pageSize);
  const safePageIndex = Math.min(pageIndex, Math.max(totalPages - 1, 0));

  useEffect(() => {
    if (pageIndex !== safePageIndex) {
      setPageIndex(safePageIndex);
    }
  }, [pageIndex, safePageIndex]);

  const pageItems = useMemo(
    () => paginateArray(items, safePageIndex, pageSize),
    [items, safePageIndex, pageSize],
  );

  const { entryStart, entryEnd } = getPageBounds(
    totalItems,
    safePageIndex,
    pageSize,
  );

  return {
    pageItems,
    pageIndex: safePageIndex,
    pageSize,
    totalItems,
    totalPages,
    entryStart,
    entryEnd,
    pageSizeOptions,
    setPageIndex,
    setPageSize: (nextPageSize: number) => {
      setPageSize(nextPageSize);
      setPageIndex(0);
    },
    goToPage: (pageNumber: number) => {
      setPageIndex(
        Math.max(0, Math.min(pageNumber - 1, Math.max(totalPages - 1, 0))),
      );
    },
    nextPage: () => {
      setPageIndex((current) => Math.min(current + 1, totalPages - 1));
    },
    previousPage: () => {
      setPageIndex((current) => Math.max(current - 1, 0));
    },
    canNextPage: safePageIndex < totalPages - 1,
    canPreviousPage: safePageIndex > 0,
  };
}
