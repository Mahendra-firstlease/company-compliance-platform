"use client";

import React from "react";
import { Menu, X, Shield } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-2xs">
      {/* Left: Unified Enterprise Branding & Mobile Menu trigger */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors lg:hidden shrink-0 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xs flex items-center justify-center shrink-0">
            <Shield size={16} />
          </div>
          <div className="min-w-0">
            <h1 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight leading-snug truncate">
              {title}
            </h1>
            <p className="hidden sm:block text-[9px] font-bold text-indigo-600 tracking-wider uppercase mt-0.5">
              FirstLease Enterprise Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Right: Notifications & Shared User Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
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
