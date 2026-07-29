"use client";

import Link from "next/link";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDownIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import {
  SquaresPlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { NavItem, NavLink } from "./header.data";
import { useRef, useEffect, useState } from "react";
import { MegaMenuSkeleton } from "@/components/ui/skeletons";
import apiFetch from "@/lib/apiClient";

interface DynamicServiceLink extends NavLink {
  description?: string;
}

interface MegaMenuProps {
  item: NavItem;
}

export default function MegaMenu({ item }: MegaMenuProps) {
  const [dynamicLinks, setDynamicLinks] = useState<DynamicServiceLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<(() => void) | null>(null);
  const isOpenRef = useRef(false);

  // Fetch dynamic services from MySQL backend API
  useEffect(() => {
    let active = true;

    const fetchHeaderServices = async () => {
      try {
        const data = await apiFetch<any[]>("/services");
        if (active && Array.isArray(data) && data.length > 0) {
          const mapped = data.map((s: any) => ({
            label: s.title,
            href: `/services/${s.slug}`,
            description: s.shortDescription || s.title,
          }));
          setDynamicLinks(mapped);
        } else if (active) {
          setDynamicLinks([]);
        }
      } catch (err) {
        console.error("Header dynamic services fetch error:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchHeaderServices();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpenRef.current &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        closeRef.current
      ) {
        closeRef.current();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Popover className="static" ref={containerRef}>
      {({ open, close }) => {
        closeRef.current = close;
        isOpenRef.current = open;
        return (
          <>
            <PopoverButton className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer">
              <span>{item.label}</span>
              <ChevronDownIcon aria-hidden="true" className="h-4 w-4" />
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute inset-x-0 mx-auto z-50 mt-5 flex w-screen max-w-5xl bg-transparent px-4 transition data-closed:translate-y-1 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
            >
              <div className="w-screen max-w-5xl flex-auto overflow-hidden rounded-lg bg-white text-sm/6 border border-slate-200/80 shadow-2xl ring-1 ring-slate-900/5">
                {/* Dynamic Services Grid */}
                {isLoading ? (
                  <MegaMenuSkeleton />
                ) : dynamicLinks.length > 0 ? (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                    {dynamicLinks.map((link: DynamicServiceLink) => (
                      <div
                        key={link.href}
                        className="group relative flex items-center gap-x-3 rounded-lg p-2.5 hover:bg-primary-light/40 transition-colors"
                      >
                        <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-slate-100 group-hover:bg-white text-slate-500 group-hover:text-primary border border-slate-200/50 transition-colors">
                          <SquaresPlusIcon aria-hidden="true" className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <Link
                            href={link.href}
                            onClick={() => close()}
                            className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors"
                          >
                            {link.label}
                            <span className="absolute inset-0" />
                          </Link>
                          <span className="text-[11px] text-slate-400 line-clamp-1">
                            {link.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 font-medium space-y-2">
                    <p>No active services in catalog at the moment.</p>
                  </div>
                )}

                {/* Footer Action Bar with "View All Services" Button */}
                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="size-4 text-primary shrink-0" />
                    <span className="text-xs text-slate-500 font-medium">
                      Explore all government registration & compliance services.
                    </span>
                  </div>

                  <Link
                    href="/services"
                    onClick={() => close()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>View All Services</span>
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                </div>
              </div>
            </PopoverPanel>
          </>
        );
      }}
    </Popover>
  );
}
