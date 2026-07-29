import { LayoutDashboard, FolderLock, FileCheck, Calendar, Bell, Settings, ClipboardList } from "lucide-react";
import { SidebarItem } from "@/types";

// Sidebar navigation configuration
export const menuItems: SidebarItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: ClipboardList },
  { id: "documents", label: "Documents", icon: FolderLock },
  { id: "certificates", label: "Certificates", icon: FileCheck },
  { id: "calendar", label: "Compliance Calendar", icon: Calendar },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];
