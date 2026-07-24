"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { SidebarItem } from "@/types/sidebar";
import { signOut } from "next-auth/react";
import { notify } from "@/lib/notify";

interface DashboardSidebarProps {
  menuItems: SidebarItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function DashboardSidebar({
  menuItems,
  activeTab,
  onTabChange,
  mobileMenuOpen,
  onCloseMobileMenu,
  isCollapsed,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const handleLogout = async () => {
    try {
      notify.loading({
        title: "Signing out...",
        description: "Clearing session data.",
      });
      await signOut({ callbackUrl: "/" });
      notify.success({
        title: "Signed Out",
        description: "You have been logged out successfully.",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <aside
      className={cn(
        "bg-white border-r border-slate-200 shrink-0 z-20 transition-all duration-300 flex flex-col justify-between overflow-x-hidden",
        // Mobile classes
        mobileMenuOpen
          ? "fixed top-16 inset-x-0 bottom-0 bg-white min-h-[calc(100vh-64px)] w-full block"
          : "hidden lg:flex",
        // Desktop collapsed/expanded classes
        !mobileMenuOpen &&
          (isCollapsed
            ? "w-16 sticky top-16 h-[calc(100vh-64px)]"
            : "w-64 sticky top-16 h-[calc(100vh-64px)]")
      )}
    >
      {/* Top: Menu Items */}
      <div
        className={cn(
          "p-3 space-y-1.5 flex-1 overflow-y-auto overflow-x-hidden",
          isCollapsed && !mobileMenuOpen ? "px-2" : ""
        )}
      >
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobileMenu();
                }}
                className={cn(
                  "w-full flex items-center rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  // Selected classes
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "text-slate-500 hover:bg-slate-100/75 hover:text-primary",
                  // Padding depending on collapse state
                  isCollapsed && !mobileMenuOpen
                    ? "justify-center py-3 px-2"
                    : "px-3.5 py-2.5"
                )}
                title={isCollapsed && !mobileMenuOpen ? item.label : undefined}
              >
                <Icon size={16} className="shrink-0" />

                {/* Text Label: Hidden on collapsed desktop */}
                {(!isCollapsed || mobileMenuOpen) && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Logout & Collapse Toggle */}
      <div className="border-t border-slate-100 p-2.5 space-y-2 overflow-x-hidden">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer",
            isCollapsed && !mobileMenuOpen
              ? "justify-center py-2.5 px-2"
              : "px-3 py-2 border border-red-100 bg-red-50/50"
          )}
          title={isCollapsed && !mobileMenuOpen ? "Sign Out" : undefined}
        >
          <LogOut size={16} className="shrink-0 text-red-500" />
          {(!isCollapsed || mobileMenuOpen) && (
            <span className="ml-2.5 truncate">Sign Out</span>
          )}
        </button>

        <div className="hidden lg:block">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-100 transition-colors shadow-3xs cursor-pointer"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <ChevronLeft size={16} />
                <span className="truncate">Minimize Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
