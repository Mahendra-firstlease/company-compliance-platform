"use client";

import React from "react";
import { Bell, Menu, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { useTheme, SiteTheme } from "@/providers/ThemeProvider";
import UserNavDropdown from "@/components/common/UserNavDropdown";

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
  const { theme: activeTheme, setTheme } = useTheme();

  // Support 5 premium brand color themes
  const colorThemes: { id: SiteTheme; color: string; label: string }[] = [
    { id: "indigo", color: "bg-indigo-600", label: "Indigo Accent" },
    { id: "emerald", color: "bg-emerald-600", label: "Emerald Accent" },
    { id: "violet", color: "bg-violet-600", label: "Violet Accent" },
    { id: "amber", color: "bg-amber-500", label: "Amber Accent" },
    { id: "rose", color: "bg-rose-600", label: "Rose Accent" },
  ];

  const handleSelectTheme = (themeId: SiteTheme) => {
    setTheme(themeId);
    notify.success(`Active website accent theme set to: ${themeId}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6 shadow-2xs">
      {/* Left: Branding & Mobile Menu trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2">
          <div
            className={cn(
              "size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              activeTheme === "indigo" && "bg-indigo-50 text-indigo-600",
              activeTheme === "emerald" && "bg-emerald-50 text-emerald-600",
              activeTheme === "violet" && "bg-violet-50 text-violet-600",
              activeTheme === "amber" && "bg-amber-50 text-amber-600",
              activeTheme === "rose" && "bg-rose-50 text-rose-600"
            )}
          >
            <Shield size={16} />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-800 tracking-tight leading-none">
              {title}
            </h1>
            <p className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Secure Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Right: Theme Selector, Notifications & Shared User Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Accent Theme Selector dots row */}
        <div
          className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-full"
          title="Global Brand Accent Colors Selector"
        >
          {colorThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTheme(t.id)}
              className={cn(
                "size-4 rounded-full transition-all border border-black/5 hover:scale-125 cursor-pointer",
                t.color,
                activeTheme === t.id
                  ? "ring-2 ring-slate-800 ring-offset-1 scale-110"
                  : "opacity-80"
              )}
              aria-label={t.label}
            />
          ))}
        </div>

        {/* Notifications Icon trigger */}
        <button
          onClick={() => notify.info("No unread alerts in inbox.")}
          className="relative p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
          aria-label="View notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 size-2 bg-primary rounded-full" />
        </button>

        {/* Shared User Profile & Logout Dropdown (Same as Navbar) */}
        <div className="pl-2 border-l border-slate-100">
          <UserNavDropdown />
        </div>
      </div>
    </header>
  );
}
