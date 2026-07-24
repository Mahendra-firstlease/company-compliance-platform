"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Briefcase,
  DollarSign,
  FolderOpen,
  Users,
  UserCheck,
  BarChart3,
} from "lucide-react";
import DashboardLayout, {
  SidebarItem,
} from "@/components/layouts/Dashboard/DashboardLayout";

export default function AdminRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Admin menu configuration
  const menuItems: SidebarItem[] = useMemo(() => [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "applications", label: "Applications", icon: ClipboardList },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "crm", label: "CRM / Leads", icon: Users },
    { id: "team", label: "Team", icon: UserCheck },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ], []);

  // Map the active pathname back to the tab ID
  const activeTab = useMemo(() => {
    if (pathname === "/admin") return "overview";
    const sub = pathname.replace("/admin/", "");
    const matched = menuItems.find((item) => item.id === sub);
    return matched ? matched.id : "overview";
  }, [pathname, menuItems]);

  const handleTabChange = (id: string) => {
    if (id === "overview") {
      router.push("/admin");
    } else {
      router.push(`/admin/${id}`);
    }
  };

  // Determine dynamic description for admin sub-page workspace headers
  const description = useMemo(() => {
    if (activeTab === "overview") return "MCA statutory filings & business registrations queues.";
    if (activeTab === "applications") return "Verify documents, query cases, and issue licenses.";
    if (activeTab === "services") return "Configure statutory corporate filing products catalog.";
    if (activeTab === "pricing") return "Setup government filing fees and professional margins.";
    if (activeTab === "documents") return "Inspect customer whitelisted PDF files queue.";
    if (activeTab === "crm") return "Manage leads, enquiries, and legal desk status logs.";
    if (activeTab === "team") return "Manage compliance specialist allocation rules.";
    return "Filing statistics charts and executive capacity indices.";
  }, [activeTab]);

  return (
    <DashboardLayout
      title="Admin Dashboard"
      description={description}
      badgeText="ops · crm · analytics"
      avatarText="AD"
      userName="Admin Console"
      userRole="ops · crm · analytics"
      menuItems={menuItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      headerTheme="indigo"
    >
      {children}
    </DashboardLayout>
  );
}
