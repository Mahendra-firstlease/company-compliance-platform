"use client";

import { FunnelIcon } from "@heroicons/react/24/outline";
import SearchBar from "@/components/common/SearchBar";
import Button from "@/components/common/Button";

interface ServicesHeaderProps {
  title?: string;
  totalResults: number;
  search: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
}

export default function ServicesHeader({
  title = "Services",
  totalResults,
  search,
  onSearchChange,
  onOpenFilters,
}: ServicesHeaderProps) {
  return (
    <div className="flex flex-col gap-6 border-b border-gray-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
      {/* Left */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>

        <p className="mt-2 text-sm text-gray-500">
          {totalResults} services found
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 w-full  sm:w-auto justify-between sm:justify-end">
        <SearchBar
          fullWidth
          value={search}
          onChange={onSearchChange}
          placeholder="Search services..."
          className="w-full sm:max-w-xs"
        />
        <Button
          variant="outline"
          size="sm"
          leftIcon={<FunnelIcon className="h-4 w-4" />}
          title="Filters"
          label="Filters"
          className="lg:hidden"
          onClick={onOpenFilters}
        />
      </div>
    </div>
  );
}
