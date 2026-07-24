import React from "react";
import { cn } from "@/lib/utils";

interface CategoryOption {
  label: string;
  value: string;
}

interface CategoryListProps {
  categories: CategoryOption[];
  selected?: string;
  onSelect: (category: string) => void;
}

export default function CategoryList({
  categories,
  selected,
  onSelect,
}: CategoryListProps) {
  return (
    <div className="space-y-1.5 border-b border-slate-100 pb-6">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
        Services Category
      </h3>
      <div className="space-y-1">
        {categories.map((cat) => {
          const isSelected = selected === cat.value || (!selected && cat.value === "all");
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => onSelect(cat.value)}
              className={cn(
                "w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between",
                isSelected
                  ? "bg-primary text-white shadow-sm shadow-primary/20 scale-[1.02]"
                  : "text-slate-500 hover:bg-slate-100/75 hover:text-primary hover:translate-x-1"
              )}
            >
              <span>{cat.label}</span>
              {isSelected && (
                <span className="size-1.5 rounded-full bg-white animate-pulse shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}