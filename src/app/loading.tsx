import { Skeleton } from "@/components/ui/skeleton";
import Container from "@/components/common/Container";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50 pt-8 pb-20 animate-pulse">
      <Container className="max-w-7xl space-y-8">
        {/* Navigation Breadcrumb Placeholder */}
        <Skeleton className="h-5 w-40 rounded-md" />

        {/* Hero / Header Section Placeholder */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 space-y-4 shadow-2xs">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-8 w-2/3 rounded-xl" />
          <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
        </div>

        {/* Grid Content Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs h-[300px] flex flex-col justify-between"
            >
              <div className="space-y-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}