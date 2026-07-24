"use client";

import React from "react";
import {
  UISelect as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/forms/Select";

const sortOptions = [
  {
    label: "Most Popular",
    value: "popular",
  },
  {
    label: "Newest",
    value: "newest",
  },
  {
    label: "Price: Low to High",
    value: "price-asc",
  },
  {
    label: "Price: High to Low",
    value: "price-desc",
  },
];

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SortDropdown({
  value,
  onChange,
}: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500">Sort By</span>
      <div className="w-48">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full text-xs font-semibold">
            <SelectValue placeholder="Select sorting..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}