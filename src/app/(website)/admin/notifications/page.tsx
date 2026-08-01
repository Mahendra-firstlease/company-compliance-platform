"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CheckCheck,
  Search,
  ArrowRight,
  Inbox,
  ShieldAlert,
} from "lucide-react";
import Button from "@/components/common/Button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import apiFetch from "@/lib/apiClient";
import { notify } from "@/lib/notify";
import { formatDate } from "@/utils/formatters";

interface DbNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<DbNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchAdminNotifications() {
      try {
        setIsLoading(true);
        const data = await apiFetch<DbNotificationItem[]>("/notifications");
        if (active) {
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch admin notifications:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchAdminNotifications();

    return () => {
      active = false;
    };
  }, []);

  // Mark single notification as read
  const handleMarkSingleRead = async (id: string) => {
    try {
      await apiFetch("/notifications", {
        method: "PATCH",
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await apiFetch("/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      notify.success({
        title: "Notifications Read",
        description: "All admin notifications marked as read.",
      });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  // Filter & Search computation
  const filteredNotifications = useMemo(() => {
    let list = notifications;

    if (filterType === "UNREAD") {
      list = list.filter((n) => !n.isRead);
    } else if (filterType === "READ") {
      list = list.filter((n) => n.isRead);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q)
      );
    }

    return list;
  }, [notifications, filterType, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Mobile-Optimized Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Admin System Alerts & Activity Feed
            </h1>
            {unreadCount > 0 && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time notifications for customer filing submissions, payment verifications, and executive tasks.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto"
          >
            <CheckCheck size={14} className="text-indigo-600" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Touch-Friendly Mobile Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        {/* Horizontal Scrollable Filter Pills on Mobile */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filterType === "ALL"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Alerts ({notifications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType("UNREAD")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filterType === "UNREAD"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterType("READ")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer shrink-0 ${
              filterType === "READ"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Mobile Full-Width Search Input */}
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search admin alerts..."
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
          />
        </div>
      </div>

      {/* Responsive Notifications List Card */}
      <Card enableHover>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading admin system alerts...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notif) => {
                const getIconAndColor = () => {
                  switch (notif.type) {
                    case "SUCCESS":
                      return { Icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
                    case "WARNING":
                      return { Icon: AlertCircle, color: "text-rose-600 bg-rose-50 border-rose-200" };
                    case "URGENT":
                      return { Icon: ShieldAlert, color: "text-amber-600 bg-amber-50 border-amber-200" };
                    default:
                      return { Icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50 border-indigo-200" };
                  }
                };

                const { Icon, color } = getIconAndColor();

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 sm:p-4 flex items-start gap-3 sm:gap-4 transition-colors ${
                      notif.isRead
                        ? "bg-white hover:bg-slate-50/50"
                        : "bg-indigo-50/20 hover:bg-indigo-50/40 font-medium"
                    }`}
                  >
                    {/* Icon Badge */}
                    <div className={`p-2 rounded-xl border ${color} shrink-0 mt-0.5`}>
                      <Icon size={16} />
                    </div>

                    {/* Content Area */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-xs font-bold leading-snug ${notif.isRead ? "text-slate-800" : "text-slate-900"}`}>
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="size-2 rounded-full bg-amber-500 inline-block shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Touch Friendly Action Buttons */}
                      <div className="pt-2.5 flex items-center justify-between gap-4 text-xs font-semibold">
                        {notif.link ? (
                          <Link
                            href={notif.link}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline py-1"
                          >
                            Inspect Case <ArrowRight size={12} />
                          </Link>
                        ) : <span />}

                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkSingleRead(notif.id)}
                            className="text-slate-400 hover:text-slate-600 text-[11px] cursor-pointer py-1 px-2 rounded hover:bg-slate-100"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <Inbox size={32} className="text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No admin alerts found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No system alerts match your current filter or search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
