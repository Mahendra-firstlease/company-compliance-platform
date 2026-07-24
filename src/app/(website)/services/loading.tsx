import React from "react";
import ProductGridSkeleton from "@/components/skeletons/ProductGridSkeleton";

export default function ServicesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-end lg:justify-between animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
          <div className="h-4 w-32 rounded-md bg-slate-100" />
        </div>
        <div className="h-10 w-64 rounded-lg bg-slate-200" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <div className="hidden lg:block space-y-4 rounded-xl border border-slate-200 bg-white p-6 h-96 animate-pulse">
          <div className="h-5 w-24 rounded-md bg-slate-200 mb-6" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded-md bg-slate-100" />
            <div className="h-4 w-3/4 rounded-md bg-slate-100" />
            <div className="h-4 w-5/6 rounded-md bg-slate-100" />
          </div>
        </div>
        <div className="lg:col-span-3">
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
