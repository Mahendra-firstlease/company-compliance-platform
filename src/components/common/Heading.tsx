import React from "react";
import clsx from "clsx";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

const SectionHeading = ({
  badge,
  title,
  highlight,
  description,
  align = "center",
  className,
}: SectionHeadingProps) => {
  return (
    <div
      className={clsx(
        "max-w-2xl mx-auto ",
        align === "center" ? "text-center mb-16" : "text-left mb-4",
        className
      )}
    >
      {badge && (
        <div
          className={clsx(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light border border-primary-border mb-4",
            align === "left" && "mx-0"
          )}
        >
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">
            {badge}
          </span>
        </div>
      )}

      <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter">
        {title}
        {highlight && (
          <>
            {" "}
            <span className="text-primary">{highlight}</span>
          </>
        )}
      </h2>

      {description && (
        <p className="mt-4 text-base text-black/50 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;