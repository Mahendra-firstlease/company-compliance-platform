export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;

export const DOTS = "...";

export function getTotalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / pageSize);
}

export function getPageBounds(
  totalItems: number,
  pageIndex: number,
  pageSize: number,
) {
  if (totalItems === 0) {
    return { entryStart: 0, entryEnd: 0 };
  }

  const entryStart = pageIndex * pageSize + 1;
  const entryEnd = Math.min(totalItems, (pageIndex + 1) * pageSize);

  return { entryStart, entryEnd };
}

export function paginateArray<T>(
  items: T[],
  pageIndex: number,
  pageSize: number,
): T[] {
  const start = pageIndex * pageSize;
  return items.slice(start, start + pageSize);
}

function range(start: number, end: number) {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => index + start);
}

export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): Array<number | typeof DOTS> {
  const totalPageNumbersToShow = siblingCount + 5;

  if (totalPageNumbersToShow >= totalPages) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    return [...range(1, leftItemCount), DOTS, totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    return [1, DOTS, ...range(totalPages - rightItemCount + 1, totalPages)];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    return [
      1,
      DOTS,
      ...range(leftSiblingIndex, rightSiblingIndex),
      DOTS,
      totalPages,
    ];
  }

  return [];
}
