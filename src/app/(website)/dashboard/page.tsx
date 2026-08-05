"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  AlertCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Calendar,
  Bell,
  ShieldCheck,
  CheckCheck,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/ui/Badge/Badge";
import FieldValue from "@/components/common/FieldValue";
import QueryResponseModal from "@/components/forms/QueryResponseModal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getApplications, ApplicationCase } from "@/lib/applications";
import apiFetch from "@/lib/apiClient";
import { Service } from "@/types";
import { notify } from "@/lib/notify";
import KPISummary from "@/features/dashboard/KPISummary";
import { useSession } from "next-auth/react";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface ScheduleItem {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  status: string;
}

interface DbNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export default function UserDashboardPage() {
  const { data: session } = useSession();
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<Service[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [dbNotifications, setDbNotifications] = useState<DbNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQueryCase, setActiveQueryCase] = useState<ApplicationCase | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [userApps, catalogServices, userSchedules, userNotifs] = await Promise.all([
          getApplications().catch(() => []),
          apiFetch<Service[]>("/services").catch(() => []),
          apiFetch<ScheduleItem[]>("/compliance-schedules").catch(() => []),
          apiFetch<DbNotificationItem[]>("/notifications").catch(() => []),
        ]);

        if (!active) return;

        setCases(userApps);
        setSchedules(userSchedules);
        setDbNotifications(userNotifs);

        // Filter out services already applied by user to recommend new ones
        const appliedSlugs = new Set(userApps.map((a) => a.serviceSlug));
        const unapplied = catalogServices.filter((s) => !appliedSlugs.has(s.slug));
        const pool = unapplied.length > 0 ? unapplied : catalogServices;
        setRecommendedServices(pool.slice(0, 3));
      } catch (err) {
        console.error("Failed to load dashboard dynamic data:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  // Calculate dynamic KPI statistics metrics
  const stats = useMemo(() => {
    const total = cases.length;
    const pending = cases.filter(
      (c) => c.status === "DOCUMENTS_PENDING" || c.status === "PAYMENT_PENDING"
    ).length;
    const inProgress = cases.filter(
      (c) => c.status === "IN_REVIEW" || c.status === "UNDER_REVIEW" || c.status === "SUBMITTED" || c.status === "VERIFYING"
    ).length;
    const completed = cases.filter((c) => c.status === "APPROVED").length;

    return { total, pending, inProgress, completed };
  }, [cases]);

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await apiFetch("/notifications", {
        method: "PATCH",
        body: JSON.stringify({ markAllRead: true }),
      });
      setDbNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      notify.success({ title: "Notifications Read", description: "All notifications marked as read." });
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const unreadCount = dbNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner Gradient Hero */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-indigo-700 p-6 md:p-8 text-white shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            🚀 Welcome Back, {session?.user?.name || "User"}
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2">
            Compliance made simple for your business.
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-xl leading-relaxed">
            Track live filings, download government certificates, and monitor compliance deadlines dynamically in your portal.
          </p>
        </div>
      </div>

      {/* Dynamic KPI Cards Summary */}
      <KPISummary stats={stats} />

      {/* Split row: Recent applications (70%) vs Recommended services (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications Listing */}
        <Card enableHover className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Application Filings</CardTitle>
              <CardDescription>
                View and manage your recent statutory compliance filings.
              </CardDescription>
            </div>
            <Link href="/applications">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600">
                View All ({cases.length})
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center space-y-3">
                <div className="size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading dynamic filings...</p>
              </div>
            ) : cases.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {cases.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-800">
                          {c.serviceTitle}
                        </h4>
                        {c.assignedExecutive && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                            Specialist: {c.assignedExecutive}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        Ref ID: <span className="font-mono text-slate-600">{c.id}</span> &middot; Filed {formatDate(c.createdAt)}
                      </p>
                      {c.formData && Object.keys(c.formData).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                          {Object.entries(c.formData).slice(0, 3).map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono inline-flex items-center gap-1">
                              {k}: <span className="font-bold text-slate-800"><FieldValue value={v} compact /></span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                      <Badge
                        variant={
                          c.status === "APPROVED"
                            ? "green"
                            : c.queryStatus === "CLIENT_RESPONDED"
                              ? "indigo"
                              : c.queryNote || c.query
                                ? "red"
                                : "indigo"
                        }
                        rounded="full"
                        size="sm"
                      >
                        {c.queryStatus === "CLIENT_RESPONDED"
                          ? "CLIENT RESPONDED"
                          : c.queryNote || c.query
                            ? "ACTION REQUIRED"
                            : c.status.replace(/_/g, " ")}
                      </Badge>

                      {(c.query || c.queryNote) && c.queryStatus !== "CLIENT_RESPONDED" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setActiveQueryCase(c)}
                          className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 shadow-2xs"
                        >
                          <AlertTriangle size={12} /> Respond to Query
                        </Button>
                      )}

                      <Link href={`/applications/${c.serviceSlug}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold flex items-center gap-1"
                        >
                          Workspace <ArrowRight size={10} />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <ClipboardList className="size-10 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No active applications found.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Get started by selecting a statutory service from our catalog below.
                </p>
                <Link href="/services">
                  <Button variant="primary" size="sm" className="mt-2 text-xs">
                    Browse Services Catalog
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Recommended Services Panel */}
        <Card enableHover>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Sparkles size={16} className="text-amber-500 animate-pulse" />
              Recommended Filings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {recommendedServices.length > 0 ? (
              recommendedServices.map((rec) => (
                <div
                  key={rec.slug}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2.5 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800">
                        {rec.title}
                      </h4>
                      <span className="text-xs font-bold text-indigo-700">
                        {formatCurrency(rec.price)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal mt-1 line-clamp-2">
                      {rec.shortDescription}
                    </p>
                  </div>
                  <Link href={`/services/${rec.slug}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Apply Now
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                Loading recommended services...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Split row: Dynamic Compliance Calendar (50%) vs Dynamic Persistent Notifications (50%) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dynamic Compliance Calendar Deadlines */}
        <Card enableHover size="sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-indigo-600" />
              Compliance Calendar Deadlines
            </CardTitle>
            <Badge variant="indigo" size="sm" rounded="full">
              Live Tracker
            </Badge>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {schedules.length > 0 ? (
              schedules.map((task) => {
                const due = new Date(task.dueDate);
                const isNearDue = due.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                return (
                  <div
                    key={task.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100/50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-800">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        Due: {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <Badge
                      variant={isNearDue ? "red" : "gray"}
                      rounded="full"
                      size="sm"
                    >
                      {isNearDue ? "URGENT" : "PENDING"}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No upcoming compliance deadlines.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Persistent MySQL Notifications Feed */}
        <Card enableHover size="sm">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bell size={16} className="text-indigo-600" />
                Portal Notifications
              </CardTitle>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {dbNotifications.length > 0 ? (
              <>
                {dbNotifications.slice(0, 5).map((notif) => {
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
                      className={`flex gap-3 text-xs items-start p-2.5 rounded-lg border transition-colors ${
                        notif.isRead
                          ? "bg-slate-50/50 border-slate-100 text-slate-500"
                          : "bg-white border-indigo-100 shadow-2xs font-medium text-slate-800"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${color} shrink-0 mt-0.5`}>
                        <Icon size={14} />
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          {notif.message}
                        </p>
                        {notif.link && (
                          <Link href={notif.link} className="inline-block pt-1 text-[11px] font-bold text-indigo-600 hover:underline">
                            View details &rarr;
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="pt-2 text-center border-t border-slate-100">
                  <Link
                    href="/dashboard/notifications"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-1 px-3 rounded-md hover:bg-indigo-50"
                  >
                    View All Notifications ({dbNotifications.length}) <ArrowRight size={13} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-2">
                <Bell size={24} className="text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No notifications yet.</p>
                <p className="text-xs text-slate-400">Status changes and administrative updates will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Query Response Modal */}
      <QueryResponseModal
        application={activeQueryCase}
        isOpen={!!activeQueryCase}
        onClose={() => setActiveQueryCase(null)}
        onSuccess={async () => {
          const list = await getApplications();
          setCases(list);
        }}
      />
    </div>
  );
}
