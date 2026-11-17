"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import UserNavDropdown from "@/components/common/UserNavDropdown";
import NotificationBellDropdown from "@/components/notifications/NotificationBellDropdown";
import { usePathname } from "next/navigation";

interface DashboardHeaderProps {
  title: string;
  avatarText?: string;
  userName?: string;
  userRole?: string;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  headerTheme?: "indigo" | "slate";
}

export default function DashboardHeader({
  title,
  mobileMenuOpen,
  onToggleMobileMenu,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-2xs">
      {/* Left: Unified Enterprise Branding & Mobile Menu trigger */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors lg:hidden shrink-0 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          href="/"
          className="flex items-center gap-2.5 min-w-0 group hover:opacity-95 transition-opacity"
          title="Return to Home Page"
        >
          <div className="size-9 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden group-hover:border-primary/40 transition-colors">
            <Image
              src="/company-logo/favicon.png"
              alt="Compliance Portal India Logo"
              width={32}
              height={32}
              className="size-7 object-contain"
              priority
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight leading-snug truncate group-hover:text-primary transition-colors">
              {title}
            </h1>
            <p className="hidden sm:block text-xs font-medium text-slate-500 mt-0.5">
              Compliance Portal India Workspace
            </p>
          </div>
        </Link>
      </div>

      {/* Right: Home URL Link, Notifications & Shared User Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Dedicated Home Page URL Navigation Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-primary hover:bg-slate-100 border border-slate-200/80 shadow-3xs transition-all cursor-pointer"
          title="Return to Home Page"
        >
          <Home size={15} className="text-slate-500" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        {/* Dynamic Project-Wide Notification Bell Dropdown */}
        <NotificationBellDropdown isAdmin={isAdmin} />

        {/* Shared User Profile & Logout Dropdown (Same as Navbar) */}
        <div className="pl-2 border-l border-slate-100">
          <UserNavDropdown />
        </div>
      </div>
    </header>
  );
}
