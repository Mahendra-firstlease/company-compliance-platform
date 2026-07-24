"use client";

import { filters } from "@/constants/filters";
import FilterSection from "./FilterSection";
import Button from "@/components/common/Button";

interface ServicesSidebarProps {
  selectedFilters: Record<string, string[]>;
  onFilterChange: (section: string, value: string) => void;
  onClearFilters: () => void;
}

export default function ServicesSidebar({
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: ServicesSidebarProps) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>

          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear
          </Button>
        </div>

        <div className="space-y-6">
          {filters.map((filter) => (
            <FilterSection
              key={filter.id}
              filter={filter}
              selected={selectedFilters[filter.id] || []}
              onChange={(value) => onFilterChange(filter.id, value)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}