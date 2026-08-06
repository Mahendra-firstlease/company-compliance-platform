"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { filters } from "@/constants/filters";
import FilterSection from "./FilterSection";
import Button from "@/components/common/Button";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function FilterControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getActiveFilterValues = (sectionId: string) => {
    const val = searchParams.get(sectionId);
    return val ? val.split(",") : [];
  };

  const activeFilterCount = filters.reduce((acc, f) => {
    return acc + getActiveFilterValues(f.id).length;
  }, 0);

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

  const filterContent = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-800">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="size-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
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
  );

  return (
    <>
      {/* Mobile Filter Button Bar (< lg) */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-indigo-300 hover:bg-slate-50 transition-all text-xs font-bold text-slate-700"
        >
          <span className="flex items-center gap-2">
            <FunnelIcon className="size-4 text-indigo-600" />
            <span>Filter Catalog Services</span>
          </span>
          {activeFilterCount > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-black">
              {activeFilterCount} Active
            </span>
          ) : (
            <span className="text-slate-400 text-xs">Select Filters →</span>
          )}
        </button>
      </div>

      {/* Desktop Sticky Sidebar (>= lg) */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-6 shadow-xs">
          {filterContent}
        </div>
      </aside>

      {/* Mobile Filter Drawer Modal (< lg) */}
      <Dialog
        open={mobileOpen}
        onClose={setMobileOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition duration-300 ease-out data-closed:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel
                transition
                className="w-screen max-w-md bg-white shadow-2xl duration-300 ease-in-out data-closed:translate-x-full flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="size-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Filter Services Catalog
                    </h3>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <XMarkIcon className="size-5" />
                  </button>
                </div>

                {/* Filter List Body */}
                <div className="flex-1 overflow-y-auto p-6">
                  {filterContent}
                </div>

                {/* Footer Action Bar */}
                <div className="border-t p-4 bg-slate-50 flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    size="md"
                    className="font-bold text-xs"
                    onClick={() => {
                      clearFilters();
                    }}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    size="md"
                    className="font-bold text-xs"
                    onClick={() => setMobileOpen(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
