"use client";

import {
  UISelect as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/forms/Select";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "@/lib/pagination";
import { cn } from "@/lib/utils";

export interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  className?: string;
}

export default function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  className,
}: PageSizeSelectorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0",
        className,
      )}
    >
      <span>Show</span>
      <Select
        value={String(pageSize)}
        onValueChange={(value: string) => onPageSizeChange(Number(value))}
      >
        <SelectTrigger className="h-8 w-16 bg-slate-50 px-2 py-0 text-xs font-bold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="w-16">
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {String(size)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>entries</span>
    </div>
  );
}
