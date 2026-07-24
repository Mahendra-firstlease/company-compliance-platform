"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import SearchBar from "@/components/common/SearchBar";

interface SearchBoxProps {
  defaultValue?: string;
}

export default function SearchBox({ defaultValue = "" }: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset to page 1 on new search

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="w-full sm:max-w-xs">
      <SearchBar
        fullWidth
        value={searchParams.get("search") ?? defaultValue}
        onChange={handleSearch}
        loading={isPending}
        placeholder="Search services..."
        shortcut="⌘K"
      />
    </div>
  );
}
