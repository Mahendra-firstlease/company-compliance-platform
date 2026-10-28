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
  FileText,
  Download,
  Paperclip,
  Building2,
  ChevronDown,
  Eye,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/ui/Badge/Badge";
import QueryResponseModal from "@/components/forms/QueryResponseModal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getApplications, ApplicationCase } from "@/lib/applications";
import { getSubmittedFormEntries } from "@/lib/application-workflow";
import { downloadFile, getInlineViewUrl } from "@/utils/download";
import apiFetch from "@/lib/apiClient";
import { Service, UploadedFile } from "@/types";
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

function formatDocName(name: string): string {
  const words = name
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : name;
}

function ServiceIcon({ slug }: { slug: string }) {
  if (slug.includes("mca") || slug.includes("company") || slug.includes("llp") || slug.includes("incorporation")) {
    return <Building2 size={18} />;
  }
  if (slug.includes("trademark") || slug.includes("iso") || slug.includes("patent") || slug.includes("license")) {
    return <ShieldCheck size={18} />;
  }
  return <FileText size={18} />;
}

function getApplicationHighlight(formData?: Record<string, any>) {
  if (!formData) return null;

  const primaryName =
    formData.companyNameOption1 ||
    formData.companyName ||
    formData.tradeName ||
    formData.businessName ||
    formData.brandName ||
    formData.trademarkName ||
    formData.storeName ||
    formData.entityName;

  const rawType =
    formData.entityType ||
    formData.structure ||
    formData.constitution ||
    formData.businessType;

  const formatType = (val?: string) => {
    if (!val) return null;
    const map: Record<string, string> = {
      PVT_LTD: "Private Limited",
      PUBLIC_LTD: "Public Limited",
      LLP: "LLP",
      OPC: "One Person Company",
      PROPRIETORSHIP: "Proprietorship",
      PARTNERSHIP: "Partnership Firm",
      SECTION_8: "Section 8 Company",
    };
    return map[val] || val.replace(/_/g, " ");
  };

  const subtitle = formatType(typeof rawType === "string" ? rawType : undefined);

  if (primaryName) {
    return {
      title: String(primaryName),
      subtitle,
    };
  }

  const entries = getSubmittedFormEntries(formData);
  if (entries.length > 0) {
    const [k, v] = entries[0];
    const formatted = formatDocName(k);
    return {
      title: `${formatted}: ${String(v)}`,
      subtitle,
    };
  }

  return null;
}

export default function UserDashboardPage() {
  const { data: session } = useSession();
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [recommendedServices, setRecommendedServices] = useState<Service[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [dbNotifications, setDbNotifications] = useState<DbNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeQueryCase, setActiveQueryCase] = useState<ApplicationCase | null>(null);
  const [expandedDocsCaseId, setExpandedDocsCaseId] = useState<string | null>(null);

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
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary p-6 md:p-8 text-white shadow-md">
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
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
                View All ({cases.length})
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center space-y-3">
                <div className="size-6 border-2 border-primary-border border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading dynamic filings...</p>
              </div>
            ) : cases.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {cases.slice(0, 5).map((c) => {
                  const highlight = getApplicationHighlight(c.formData);
                  const uploadedDocsMap =
                    c.uploadedDocs && Object.keys(c.uploadedDocs).length > 0
                      ? c.uploadedDocs
                      : ((c.formData?._uploadedDocs as Record<string, UploadedFile> | undefined) || {});
                  const uploadedDocEntries = Object.entries(uploadedDocsMap);
                  const isDocsOpen = expandedDocsCaseId === c.id;

                  return (
                    <div
                      key={c.id}
                      className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Icon + Title + Metadata */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="size-10 rounded-lg bg-primary-light text-primary border border-primary-border/60 flex items-center justify-center shrink-0 mt-0.5">
                            <ServiceIcon slug={c.serviceSlug} />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-slate-900 leading-snug">
                                {c.serviceTitle}
                              </h4>
                            </div>

                            {/* Business Key Highlight (e.g. Entity Name / Type) */}
                            {highlight && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-bold text-slate-800">
                                  {highlight.title}
                                </span>
                                {highlight.subtitle && (
                                  <span className="text-[11px] font-semibold text-primary bg-primary-light px-2 py-0.5 rounded">
                                    {highlight.subtitle}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Meta details: Ref ID, Date, Documents toggle */}
                            <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-0.5 flex-wrap">
                              <span>
                                Ref ID: <span className="font-mono font-medium text-slate-600">{c.id}</span>
                              </span>
                              <span className="text-slate-300">&middot;</span>
                              <span>Filed {formatDate(c.createdAt)}</span>

                              {uploadedDocEntries.length > 0 && (
                                <>
                                  <span className="text-slate-300">&middot;</span>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedDocsCaseId(isDocsOpen ? null : c.id)}
                                    className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer group"
                                    title="Click to view attached documents"
                                  >
                                    <Paperclip size={12} className="text-primary group-hover:scale-110 transition-transform" />
                                    <span>{uploadedDocEntries.length} {uploadedDocEntries.length === 1 ? "File" : "Files"}</span>
                                    <ChevronDown size={12} className={`transition-transform duration-200 ${isDocsOpen ? "rotate-180" : ""}`} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Status badge & Action buttons */}
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-end shrink-0 sm:self-center">
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
                              <AlertTriangle size={12} /> Respond
                            </Button>
                          )}

                          <Link href={`/applications/${c.serviceSlug}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs font-bold flex items-center gap-1"
                            >
                              Workspace <ArrowRight size={11} />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Expandable Documents Tray */}
                      {isDocsOpen && uploadedDocEntries.length > 0 && (
                        <div className="mt-3.5 pt-3.5 border-t border-slate-100 animate-in fade-in duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                              Attached Verification Files ({uploadedDocEntries.length})
                            </span>
                            <Link
                              href={`/applications/${c.serviceSlug}`}
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              Open in Workspace &rarr;
                            </Link>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {uploadedDocEntries.map(([docKey, doc]) => {
                              const formattedDocName = formatDocName(docKey);
                              const fileName = doc?.name || formattedDocName;
                              const fileUrl = doc?.url;
                              const isPdf = Boolean(
                                fileName.toLowerCase().endsWith(".pdf") ||
                                doc?.type?.toUpperCase().includes("PDF") ||
                                fileUrl?.toLowerCase().includes(".pdf")
                              );
                              const viewHref = fileUrl ? getInlineViewUrl(fileUrl, fileName) : "#";

                              return (
                                <div
                                  key={docKey}
                                  className="flex items-center justify-between p-2 rounded-md bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0 mr-2">
                                    <div className={`size-7 rounded flex items-center justify-center shrink-0 ${isPdf ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-primary-light text-primary"}`}>
                                      <FileText size={14} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-slate-800 truncate" title={formattedDocName}>
                                        {formattedDocName}
                                      </p>
                                      {fileUrl ? (
                                        <a
                                          href={viewHref}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[10px] text-primary hover:underline font-mono truncate block"
                                          title={`View ${fileName}`}
                                        >
                                          {fileName} {doc?.size ? `(${doc.size})` : ""}
                                        </a>
                                      ) : (
                                        <p className="text-[10px] text-slate-400 truncate" title={fileName}>
                                          {fileName} {doc?.size ? `(${doc.size})` : ""}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {fileUrl && (
                                    <div className="flex items-center gap-1 shrink-0">
                                      <a
                                        href={viewHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1 rounded text-slate-400 hover:text-primary hover:bg-white transition-colors cursor-pointer"
                                        title={`View ${fileName}`}
                                      >
                                        <Eye size={13} />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() => downloadFile(fileUrl, fileName)}
                                        className="p-1 rounded text-slate-400 hover:text-primary hover:bg-white transition-colors cursor-pointer"
                                        title={`Download ${fileName}`}
                                      >
                                        <Download size={13} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2.5 hover:border-primary hover:bg-primary-light/20 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800">
                        {rec.title}
                      </h4>
                      <span className="text-xs font-bold text-primary">
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
              <Calendar size={16} className="text-primary" />
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
                <Bell size={16} className="text-primary" />
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
                className="text-xs font-semibold text-primary hover:text-primary flex items-center gap-1 cursor-pointer"
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
                        return { Icon: ShieldCheck, color: "text-primary bg-primary-light" };
                    }
                  };

                  const { Icon, color } = getIconAndColor();

                  return (
                    <div
                      key={notif.id}
                      className={`flex gap-3 text-xs items-start p-2.5 rounded-lg border transition-colors ${
                        notif.isRead
                          ? "bg-slate-50/50 border-slate-100 text-slate-500"
                          : "bg-white border-primary-border shadow-2xs font-medium text-slate-800"
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
                          <Link href={notif.link} className="inline-block pt-1 text-[11px] font-bold text-primary hover:underline">
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
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary transition-colors py-1 px-3 rounded-md hover:bg-primary-light"
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
