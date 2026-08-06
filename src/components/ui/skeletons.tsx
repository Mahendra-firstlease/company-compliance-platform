import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Table Skeleton matching exact table row & header height
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-6 gap-4 pb-2 border-b border-slate-100">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20 rounded" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 items-center py-2">
            <Skeleton className="h-6 w-16 rounded font-mono" />
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-lg justify-self-end" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Service Card & Grid Skeleton
export function ServiceCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200/80 rounded-lg p-6 space-y-4 shadow-2xs h-[340px] flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function ServicesGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[600px]">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}

// 3. Application Workspace Skeleton (/applications/[slug])
export function WorkspaceSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <Skeleton className="h-5 w-48 rounded-md" />

      {/* Header Banner Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-lg shadow-2xs">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-44 rounded-md" />
        </div>
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      {/* Stepper Progress Tracker Skeleton */}
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-lg space-y-6 shadow-2xs">
        <Skeleton className="h-5 w-48 rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 text-center flex flex-col items-center">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Split Workspace Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-11 w-40 rounded-lg" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <Skeleton className="h-5 w-36 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Header MegaMenu Skeleton
export function MegaMenuSkeleton() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3 min-h-[180px]">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100">
          <Skeleton className="size-9 rounded-lg shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 5. Header MobileMenu Skeleton
export function MobileMenuSkeleton() {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg">
          <Skeleton className="size-7 rounded-md shrink-0" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-44 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 6. User Profile Skeleton (/profile & /business-profile)
export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-2xs">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <Skeleton className="h-5 w-40 rounded" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
