"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHomeIcon?: boolean;
}

export default function Breadcrumb({
  items,
  separator = <ChevronRight size={14} className="text-slate-400 shrink-0" />,
  showHomeIcon = true,
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex py-2">
      <ol className="flex items-center flex-wrap gap-x-2 text-xs font-semibold text-slate-500">
        {/* Optional Home Icon Link */}
        {showHomeIcon && (
          <li className="flex items-center">
            <Link
              href="/"
              className="flex items-center text-slate-400 hover:text-primary transition-colors"
            >
              <Home size={14} />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-x-2">
              {/* Render Separator if it is not the very first element (or after home icon) */}
              {(showHomeIcon || index > 0) && separator}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-primary text-slate-500 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-semibold" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
