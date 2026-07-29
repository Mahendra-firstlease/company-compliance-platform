import React from "react";

export default function ServiceDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      <div className="h-4 w-48 rounded bg-slate-200 animate-pulse mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6 animate-pulse">
          <div className="h-6 w-32 rounded-full bg-slate-200" />
          <div className="h-10 w-3/4 rounded-lg bg-slate-200" />
          <div className="h-20 w-full rounded-lg bg-slate-100" />
          <div className="h-64 w-full rounded-lg bg-slate-100" />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs space-y-6 animate-pulse">
          <div className="h-8 w-1/2 rounded-md bg-slate-200" />
          <div className="h-12 w-full rounded-lg bg-slate-100" />
          <div className="h-10 w-full rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
