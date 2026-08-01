"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  FolderLock,
  FileCheck,
  Calendar,
  Bell,
  Settings,
} from "lucide-react";
import DashboardLayout, {
  SidebarItem,
} from "@/components/layouts/Dashboard/DashboardLayout";

export default function DashboardRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Sidebar navigation configuration
  const menuItems: SidebarItem[] = useMemo(() => [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "applications", label: "Applications", icon: ClipboardList },
    { id: "documents", label: "Documents", icon: FolderLock },
    { id: "certificates", label: "Certificates", icon: FileCheck },
    { id: "calendar", label: "Compliance Calendar", icon: Calendar },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ], []);

  // Map the active pathname back to the tab ID
  const activeTab = useMemo(() => {
    if (pathname === "/dashboard") return "dashboard";
    const sub = pathname.replace("/dashboard/", "");
    const matched = menuItems.find((item) => item.id === sub);
    return matched ? matched.id : "dashboard";
  }, [pathname, menuItems]);

  const handleTabChange = (id: string) => {
    if (id === "dashboard") {
      router.push("/dashboard");
    } else {
      router.push(`/dashboard/${id}`);
    }
  };

  // Determine dynamic description for sub-page workspace headers
  const description = useMemo(() => {
    if (activeTab === "dashboard") return "Review filing statuses and compliance metrics.";
    if (activeTab === "applications") return "Track registered business compliance filings queue.";
    if (activeTab === "documents") return "Manage statutory registration files checklist.";
    if (activeTab === "certificates") return "Retrieve issued governmental certificates vault.";
    if (activeTab === "calendar") return "Statutory tax filings schedule registry tracker.";
    if (activeTab === "notifications") return "Workspace notifications and supported alerts log.";
    return "Portal configurations preferences.";
  }, [activeTab]);

  return (
    <DashboardLayout
      title="User Portal"
      description={description}
      badgeText="authenticated · portal"
      avatarText="JD"
      userName="John Doe"
      userRole="Enterprise Client"
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      headerTheme="indigo"
    >
      {children}
    </DashboardLayout>
  );
}
