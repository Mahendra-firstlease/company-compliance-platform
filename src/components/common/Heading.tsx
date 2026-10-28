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
        "max-w-2xl mx-auto",
        align === "center" ? "text-center mb-12 sm:mb-16" : "text-left mb-6",
        className
      )}
    >
      {badge && (
        <span
          className={clsx(
            "text-xs font-semibold uppercase tracking-wider text-primary mb-3 block",
            align === "left" ? "text-left" : "text-center"
          )}
        >
          {badge}
        </span>
      )}

      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
        {title}
        {highlight && (
          <>
            {" "}
            <span className="text-primary">{highlight}</span>
          </>
        )}
      </h2>

      {description && (
        <p className="mt-4 text-base text-slate-600 leading-relaxed font-normal">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
