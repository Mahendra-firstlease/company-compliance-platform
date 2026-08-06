import { describe, expect, it } from "vitest";
import {
  DOTS,
  getPageBounds,
  getPaginationRange,
  getTotalPages,
  paginateArray,
} from "../pagination";

describe("pagination helpers", () => {
  it("calculates total pages and bounds", () => {
    expect(getTotalPages(25, 10)).toBe(3);
    expect(getPageBounds(25, 1, 10)).toEqual({ entryStart: 11, entryEnd: 20 });
    expect(getPageBounds(0, 0, 10)).toEqual({ entryStart: 0, entryEnd: 0 });
  });

  it("slices arrays by page", () => {
    const items = [1, 2, 3, 4, 5];
    expect(paginateArray(items, 0, 2)).toEqual([1, 2]);
    expect(paginateArray(items, 1, 2)).toEqual([3, 4]);
  });

  it("builds pagination ranges with dots", () => {
    expect(getPaginationRange(1, 3)).toEqual([1, 2, 3]);
    expect(getPaginationRange(5, 10)).toContain(DOTS);
  });
});
