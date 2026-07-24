"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/ui/Badge/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getApplications, ApplicationCase } from "@/lib/applications";
import { notify } from "@/lib/notify";
import KPISummary from "@/features/dashboard/KPISummary";
import { useSession } from "next-auth/react";

export default function UserDashboardPage() {
  const { data: session } = useSession();
  const [cases, setCases] = useState<ApplicationCase[]>([]);

  useEffect(() => {
    getApplications().then(setCases).catch(console.error);
  }, []);

  // Calculate statistics metrics based on actual + mock data
  const stats = useMemo(() => {
    const total = cases.length || 4; // fallback mockup
    const pending =
      cases.filter(
        (c) =>
          c.status === "DOCUMENTS_PENDING" || c.status === "PAYMENT_CONFIRMED",
      ).length || 1;
    const inProgress =
      cases.filter(
        (c) => c.status === "UNDER_REVIEW" || c.status === "SUBMITTED",
      ).length || 2;
    const completed = cases.filter((c) => c.status === "APPROVED").length || 1;

    return { total, pending, inProgress, completed };
  }, [cases]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Banner Gradient Hero */}
      <div className="relative overflow-hidden rounded-lg bg-linear-to-r from-primary to-primary-hover p-6 md:p-8 text-white shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md">
             🚀 Welcome Back, {session?.user?.name || "User"}
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2">
            Compliance made simple for your business.
          </h1>
          <p className="text-xs md:text-sm text-white/80 max-w-xl leading-relaxed">
            Track filings, view regulatory certificates, and connect with assigned legal specialists dynamically inside your enterprise dashboard.
          </p>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <KPISummary stats={stats} />
      {/* Split row: Recent applications (70%) vs Recommended services (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications Listing */}
        <Card enableHover className="lg:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle>Recent Application Filings</CardTitle>
            <CardDescription>
              View and manage your recent compliance filings.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {cases.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {cases.slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-xs text-slate-800">
                        {c.serviceTitle}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Ref ID: {c.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          c.status === "APPROVED" || c.status === "PAYMENT_CONFIRMED"
                            ? "green"
                            : c.query
                              ? "yellow"
                              : "indigo"
                        }
                        rounded="full"
                        size="sm"
                      >
                        {c.status === "PAYMENT_CONFIRMED"
                          ? "✓ PAYMENT CONFIRMED"
                          : c.query
                            ? "QUERY PENDING"
                            : c.status.replace("_", " ")}
                      </Badge>
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
              <div className="divide-y divide-slate-100">
                {[
                  {
                    title: "GST Registration",
                    status: "UNDER_REVIEW",
                    label: "In Review",
                  },
                  {
                    title: "FSSAI Food License",
                    status: "SUBMITTED",
                    label: "Submitted",
                  },
                  {
                    title: "ISO 9001 Certification",
                    status: "APPROVED",
                    label: "Completed",
                  },
                  {
                    title: "MSME Udyam Registration",
                    status: "DOCUMENTS_PENDING",
                    label: "Pending",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-slate-800">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Ref ID: COMP-GST0{5312 + idx}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.status === "APPROVED"
                          ? "green"
                          : item.status === "DOCUMENTS_PENDING"
                            ? "gray"
                            : "indigo"
                      }
                      rounded="full"
                      size="sm"
                    >
                      {item.label}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Services side panel */}
        <Card enableHover>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary animate-pulse" />
              Recommended Filings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {[
              {
                title: "Trade License",
                desc: "Local corporate operations",
                slug: "trade-license",
              },
              {
                title: "Pollution NOC",
                desc: "For manufacturing / warehouses",
                slug: "pollution-noc",
              },
              {
                title: "Fire NOC Clearance",
                desc: "Standard office safety certificate",
                slug: "fire-noc",
              },
            ].map((rec) => (
              <div
                key={rec.slug}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:bg-slate-100/50 transition-all duration-200"
              >
                <div>
                  <h4 className="font-semibold text-xs text-slate-700">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal mt-0.5">
                    {rec.desc}
                  </p>
                </div>
                <Link href={`/services/${rec.slug}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="text-xs font-semibold"
                    onClick={() => notify.info(`Opening filing for ${rec.title}...`)}
                  >
                    Apply Now
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Split row: Compliance due tasks (50%) vs Notifications List (50%) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Compliance due notifications */}
        <Card enableHover size="sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle>Compliance Calendar Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {[
              {
                label: "GST Return filing (GSTR-1)",
                date: "Due by 11th of month",
                alert: true,
              },
              {
                label: "ROC Annual Audits Return",
                date: "Due by 30th Oct",
                alert: false,
              },
              {
                label: "Professional Tax (PT) Monthly",
                date: "Due by 20th of month",
                alert: false,
              },
            ].map((task, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-xs text-slate-800">
                    {task.label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {task.date}
                  </p>
                </div>
                <Badge
                  variant={task.alert ? "red" : "gray"}
                  rounded="full"
                  size="sm"
                >
                  Due
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* General Notifications Feed */}
        <Card enableHover size="sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle>Portal Notifications</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {[
              {
                title: "Payment verified successfully",
                desc: "GST filing payment confirmed and logged.",
                time: "1 hour ago",
                icon: CheckCircle,
                color: "text-green-500",
              },
              {
                title: "Specialist Assigned",
                desc: "Anjali Gupta has been assigned to your factory license application.",
                time: "4 hours ago",
                icon: Clock,
                color: "text-primary",
              },
              {
                title: "Query Raised on Trade NOC",
                desc: "Clarification needed regarding office proof size.",
                time: "Yesterday",
                icon: AlertCircle,
                color: "text-amber-500",
              },
            ].map((notif, idx) => {
              const Icon = notif.icon;
              return (
                <div key={idx} className="flex gap-3 text-xs items-start">
                  <Icon
                    className={`${notif.color} shrink-0 mt-0.5`}
                    size={16}
                  />
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-slate-800">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-normal">
                      {notif.desc}
                    </p>
                    <span className="text-xs text-slate-350 block pt-0.5">
                      {notif.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
