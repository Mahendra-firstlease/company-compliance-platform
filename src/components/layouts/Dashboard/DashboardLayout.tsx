"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import DashboardHeader from "./DashboardHeader";
import DashboardFooter from "./DashboardFooter";
import DashboardSidebar from "./DashboardSidebar";
import { SidebarItem } from "@/types/sidebar";
import NavigationButtons from "@/components/common/NavigationButtons";
export type { SidebarItem };

export interface DashboardLayoutProps {
  title: string;
  description: string;
  badgeText?: string;
  avatarText: string;
  userName: string;
  userRole: string;
  menuItems: SidebarItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  children: React.ReactNode;
  headerTheme?: "indigo" | "slate";
}

export default function DashboardLayout({
  title,
  description,
  badgeText,
  avatarText,
  userName,
  userRole,
  menuItems,
  activeTab,
  onTabChange,
  children,
  headerTheme = "slate",
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dashboard_sidebar_collapsed");
    if (saved) {
      setIsCollapsed(JSON.parse(saved));
    }
  }, []);

  const handleToggleCollapse = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    localStorage.setItem(
      "dashboard_sidebar_collapsed",
      JSON.stringify(nextVal),
    );
  };

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Dedicated Dashboard Header */}
      <DashboardHeader
        title={title}
        avatarText={avatarText}
        userName={userName}
        userRole={userRole}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        headerTheme={headerTheme}
      />

      <div className="flex flex-1 flex-col lg:flex-row relative">
        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-16 z-10 bg-slate-900/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Reusable Collapsible Dashboard Sidebar */}
        <DashboardSidebar
          menuItems={menuItems}
          activeTab={activeTab}
          onTabChange={onTabChange}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />

        {/* Main Content Area & Footer wrapper */}
        <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[calc(100vh-64px)] bg-slate-50/50">
          <main className="p-3.5 sm:p-6 md:p-8 space-y-6 sm:space-y-8 overflow-x-hidden flex-1 min-w-0">
            {/* Page Header Ribbon (Rendered for top-level admin tabs only) */}
            {pathname.split("/").filter(Boolean).length <= 2 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-black text-slate-900 capitalize tracking-tight">
                    {activeTab} Workspace
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{description}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <NavigationButtons />
                </div>
              </div>
            )}

            <div className="space-y-8">{children}</div>
          </main>

          {/* Dedicated Dashboard Footer */}
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
