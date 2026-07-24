"use client";

import React from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MinusIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { filters } from "@/constants/filters";
import Button from "@/components/common/Button";

interface MobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedFilters: Record<string, string[]>;
  onFilterChange: (section: string, value: string) => void;
  onClearFilters: () => void;
}

export default function MobileFilterDrawer({
  open,
  onClose,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}: MobileFilterDrawerProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-40 lg:hidden">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
      />

      <div className="fixed inset-0 z-40 flex">
        <DialogPanel
          transition
          className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white pt-4 pb-6 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-indigo-600 font-semibold px-2 py-1"
                onClick={onClearFilters}
              >
                Clear
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="relative flex size-9 items-center justify-center rounded-md bg-white p-1 text-slate-400 hover:bg-slate-50 focus:outline-none"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
          </div>

          {/* Filters Form */}
          <form className="mt-2 divide-y divide-slate-100">
            {/* Price and Delivery Filters */}
            {filters.map((section) => (
              <Disclosure key={section.id} as="div" className="px-4 py-6" defaultOpen>
                <h3 className="-mx-2 -my-3 flow-root">
                  <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-slate-400 hover:text-slate-500">
                    <span className="font-semibold text-slate-800 text-sm">{section.title}</span>
                    <span className="ml-6 flex items-center">
                      <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                      <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                    </span>
                  </DisclosureButton>
                </h3>

                <DisclosurePanel className="pt-4">
                  <div className="space-y-3.5">
                    {section.options.map((option) => {
                      const isChecked = (selectedFilters[section.id] || []).includes(option.value);
                      return (
                        <label key={option.value} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onFilterChange(section.id, option.value)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-slate-600 font-semibold text-xs">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}