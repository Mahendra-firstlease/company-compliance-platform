import React from "react";

export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-xs animate-pulse space-y-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-6 w-24 rounded-full bg-slate-200" />
              <div className="h-4 w-16 rounded-md bg-slate-100" />
            </div>

            <div className="h-5 w-3/4 rounded-md bg-slate-200" />
            <div className="space-y-1.5 pt-1">
              <div className="h-3.5 w-full rounded-md bg-slate-100" />
              <div className="h-3.5 w-5/6 rounded-md bg-slate-100" />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-3 w-14 rounded-md bg-slate-100" />
              <div className="h-5 w-20 rounded-md bg-slate-200" />
            </div>
            <div className="h-8 w-24 rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
