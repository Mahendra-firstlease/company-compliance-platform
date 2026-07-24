"use client";

import Link from "next/link";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDownIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import {
  ArrowPathIcon,
  ChartPieIcon,
  CursorArrowRaysIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import type { NavItem, NavLink } from "./header.data";
import { useRef, useEffect } from "react";

// Lookup details mapping for project compliance services
const serviceDetails: Record<
  string,
  { description: string; icon: React.ComponentType<any> }
> = {
  "/services/company-registration": {
    description: "Incorporate Private Limited Company or LLP.",
    icon: ChartPieIcon,
  },
  "/services/gst-registration": {
    description: "Get GST registration and tax compliance.",
    icon: CursorArrowRaysIcon,
  },
  "/services/msme-registration": {
    description: "Udyam registration for MSME benefits.",
    icon: FingerPrintIcon,
  },
  "/services/iec-registration": {
    description: "Import Export Code for global trade.",
    icon: SquaresPlusIcon,
  },
  "/services/fssai-license": {
    description: "Food business license safety compliance.",
    icon: ArrowPathIcon,
  },
  "/services/trade-license": {
    description: "Municipal trade permits for local business.",
    icon: SquaresPlusIcon,
  },
  "/services/factory-license": {
    description: "Factories Act safety and health compliance.",
    icon: ArrowPathIcon,
  },
  "/services/pollution-noc": {
    description: "Consent to Establish & Operate NOC.",
    icon: FingerPrintIcon,
  },
  "/services/labour-registrations": {
    description: "Provident Fund (PF) and ESI registration.",
    icon: SquaresPlusIcon,
  },
  "/services/fire-noc": {
    description: "Fire department safety NOC certificate.",
    icon: ArrowPathIcon,
  },
  "/services/iso-certifications": {
    description: "ISO standards quality certifications.",
    icon: FingerPrintIcon,
  },
  "/services/trademark-registration": {
    description: "Protect brand names, slogans, and logos.",
    icon: CursorArrowRaysIcon,
  },
  "/services/startup-india-registration": {
    description: "Get DPIIT tax exemptions and rebates.",
    icon: ChartPieIcon,
  },
  "/services/professional-tax-registration": {
    description: "Deduct and pay state professional taxes.",
    icon: SquaresPlusIcon,
  },
  "/services/shop-establishment-license": {
    description: "Gumasta license for shops and offices.",
    icon: ArrowPathIcon,
  },
};

interface MegaMenuProps {
  item: NavItem;
}

export default function MegaMenu({ item }: MegaMenuProps) {
  const links = item.links || [];

  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<(() => void) | null>(null);
  const isOpenRef = useRef(false);

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
              <div className="w-screen max-w-5xl flex-auto overflow-hidden rounded-xl bg-white text-sm/6 border border-slate-200/80 shadow-2xl ring-1 ring-slate-900/5">
                {/* Clean Service Grid without category headers */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {links.map((link: NavLink) => {
                    const details = serviceDetails[link.href] || {
                      description: "Government compliance solutions.",
                      icon: SquaresPlusIcon,
                    };
                    const Icon = details.icon;

                    return (
                      <div
                        key={link.label}
                        className="group relative flex items-center gap-x-3 rounded-lg p-2.5 hover:bg-primary-light/40 transition-colors"
                      >
                        <div className="flex size-9 flex-none items-center justify-center rounded-lg bg-slate-100 group-hover:bg-white text-slate-500 group-hover:text-primary border border-slate-200/50 transition-colors">
                          <Icon aria-hidden="true" className="size-4" />
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
                            {details.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Action Bar with "View All Services" Button */}
                <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="size-4 text-primary shrink-0" />
                    <span className="text-xs text-slate-500 font-medium">
                      Explore all 15 government registration & compliance services.
                    </span>
                  </div>

                  <Link
                    href="/services"
                    onClick={() => close()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors shadow-2xs"
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
