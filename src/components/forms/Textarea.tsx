import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    rows?: number,
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 5, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "flex  w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm",
          "placeholder:text-gray-400",
          "outline-none transition-all duration-200",
          "focus:border-primary focus:ring-2 focus:ring-primary-light",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70",
          "resize-none",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
