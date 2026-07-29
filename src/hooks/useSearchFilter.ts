import { useState, useMemo } from "react";

export interface UseSearchFilterOptions<T> {
  items: T[];
  searchFields: (keyof T | ((item: T) => string))[];
  categoryField?: keyof T | ((item: T) => string);
  initialCategory?: string;
}

export function useSearchFilter<T>({
  items,
  searchFields,
  categoryField,
  initialCategory = "ALL",
}: UseSearchFilterOptions<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];

    return items.filter((item) => {
      // 1. Category / Status Match
      if (selectedCategory !== "ALL" && categoryField) {
        const itemCategoryValue =
          typeof categoryField === "function"
            ? categoryField(item)
            : String(item[categoryField] || "");

        if (
          itemCategoryValue.toLowerCase() !== selectedCategory.toLowerCase()
        ) {
          return false;
        }
      }

      // 2. Search Term Match
      if (!searchTerm.trim()) return true;

      const normalizedSearch = searchTerm.toLowerCase().trim();

      return searchFields.some((field) => {
        const fieldValue =
          typeof field === "function"
            ? field(item)
            : String(item[field] || "");
        return fieldValue.toLowerCase().includes(normalizedSearch);
      });
    });
  }, [items, searchTerm, selectedCategory, searchFields, categoryField]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredItems,
    totalCount: items.length,
    filteredCount: filteredItems.length,
  };
}
