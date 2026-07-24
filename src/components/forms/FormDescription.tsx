import { cn } from "@/lib/utils";

interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export default function FormDescription({
  children,
  className,
}: FormDescriptionProps) {
  if (!children) return null;

  return (
    <p
      className={cn(
        "mt-1 text-sm text-gray-500",
        className
      )}
    >
      {children}
    </p>
  );
}