import { cn } from "@/lib/utils";

interface NotificationProgressProps {
  className?: string;
}

export default function NotificationProgress({
  className,
}: NotificationProgressProps) {
  return (
    <div
      className={cn(
        "h-1 w-full overflow-hidden bg-slate-200",
        className
      )}
    >
      <div className="h-full w-full origin-left animate-pulse bg-blue-600" />
    </div>
  );
}