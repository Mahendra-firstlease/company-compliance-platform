"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { filters } from "@/constants/filters";
import FilterSection from "./FilterSection";
import Button from "@/components/common/Button";

export default function FilterControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const getActiveFilterValues = (sectionId: string) => {
    const val = searchParams.get(sectionId);
    return val ? val.split(",") : [];
  };

  const handleFilterChange = (sectionId: string, value: string) => {
    const currentValues = getActiveFilterValues(sectionId);
    const updatedValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const params = new URLSearchParams(searchParams.toString());
    if (updatedValues.length > 0) {
      params.set(sectionId, updatedValues.join(","));
    } else {
      params.delete(sectionId);
    }
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    filters.forEach((f) => params.delete(f.id));
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Filters</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs font-semibold text-primary"
          >
            Clear
          </Button>
        </div>

        <div className="space-y-6">
          {filters.map((filter) => (
            <FilterSection
              key={filter.id}
              filter={filter}
              selected={getActiveFilterValues(filter.id)}
              onChange={(value) => handleFilterChange(filter.id, value)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
