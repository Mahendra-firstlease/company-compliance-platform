"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CheckCheck,
  ArrowRight,
  Inbox,
  X,
} from "lucide-react";
import apiFetch from "@/lib/apiClient";
import { notify } from "@/lib/notify";
import { formatDate } from "@/utils/formatters";
import { useSession } from "next-auth/react";

interface DbNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

interface NotificationBellDropdownProps {
  isAdmin?: boolean;
}

export default function NotificationBellDropdown({ isAdmin = false }: NotificationBellDropdownProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<DbNotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<DbNotificationItem[]>("/notifications");
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notifications dropdown:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      // Poll every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await apiFetch("/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      notify.success({ title: "Notifications Read", description: "All notifications marked as read." });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  // Mark single item read
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

  const targetAllPageLink = isAdmin ? "/admin/notifications" : "/dashboard/notifications";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button with Touch Target Optimization */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2.5 sm:p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 transition-all cursor-pointer outline-none active:scale-95"
        aria-label="View notifications inbox"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 sm:top-1 sm:right-1 size-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-2xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile Backdrop Overlay (Tap to Dismiss) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Popover Dropdown Card (Mobile Responsive: Fixed centered overlay on mobile, Absolute on desktop) */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white rounded-2xl sm:rounded-xl shadow-2xl sm:shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden max-h-[80vh] sm:max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="p-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs text-slate-800">
                {isAdmin ? "Admin Notifications" : "Notifications & Alerts"}
              </h4>
              {unreadCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} Unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer py-1 px-1.5 rounded hover:bg-indigo-50"
                >
                  <CheckCheck size={13} /> Mark read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer hover:bg-slate-200/60"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List Content Scroll Container */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {isLoading ? (
              <div className="p-8 text-center space-y-2">
                <div className="size-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[11px] text-slate-400">Loading live updates...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.slice(0, 5).map((notif) => {
                const getIconAndColor = () => {
                  switch (notif.type) {
                    case "SUCCESS":
                      return { Icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" };
                    case "WARNING":
                      return { Icon: AlertCircle, color: "text-rose-500 bg-rose-50" };
                    case "URGENT":
                      return { Icon: AlertCircle, color: "text-amber-500 bg-amber-50" };
                    default:
                      return { Icon: ShieldCheck, color: "text-indigo-600 bg-indigo-50" };
                  }
                };

                const { Icon, color } = getIconAndColor();

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 sm:p-3 flex gap-3 text-xs items-start transition-colors ${
                      notif.isRead ? "bg-white hover:bg-slate-50/50" : "bg-indigo-50/20 font-medium"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg ${color} shrink-0 mt-0.5`}>
                      <Icon size={15} />
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className={`text-xs font-bold truncate ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDate(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {notif.message}
                      </p>

                      <div className="pt-1.5 flex items-center justify-between">
                        {notif.link ? (
                          <Link
                            href={notif.link}
                            onClick={() => {
                              handleMarkSingleRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1 py-0.5"
                          >
                            View details &rarr;
                          </Link>
                        ) : <span />}

                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => handleMarkSingleRead(notif.id)}
                            className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer py-0.5 px-1 rounded hover:bg-slate-100"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <Inbox size={24} className="text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
                <p className="text-[11px] text-slate-400">All alerts and updates will appear here.</p>
              </div>
            )}
          </div>

          {/* Footer Link */}
          <div className="p-3 sm:p-2.5 bg-slate-50 border-t border-slate-100 text-center shrink-0">
            <Link
              href={targetAllPageLink}
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 py-1"
            >
              View All Notifications ({notifications.length}) <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
