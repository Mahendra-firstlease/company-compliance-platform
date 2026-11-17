"use client";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

import { ChevronDown } from "lucide-react";

import { FilterGroup } from "@/types/filter";
import FilterCheckbox from "./FilterCheckbox";

interface Props {
  filter: FilterGroup;

  selected: string[];

  onChange: (value: string) => void;
}

export default function FilterSection({
  filter,
  selected,
  onChange,
}: Props) {
  return (
    <Disclosure defaultOpen>
      {({ open }) => (
        <>
          <DisclosureButton className="flex w-full items-center justify-between py-2">
            <span className="font-medium">
              {filter.title}
            </span>

            <ChevronDown
              className={`h-5 w-5 transition ${
                open ? "rotate-180" : ""
              }`}
            />
          </DisclosureButton>

          <DisclosurePanel className="mt-4 space-y-3">
            {filter.options.map((option) => (
              <FilterCheckbox
                key={option.value}
                option={option}
                checked={selected.includes(
                  option.value
                )}
                onChange={() =>
                  onChange(option.value)
                }
              />
            ))}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}