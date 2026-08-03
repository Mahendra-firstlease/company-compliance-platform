"use client";

import React, { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { WorkspaceSkeleton } from "@/components/ui/skeletons";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import Button from "@/components/common/Button";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  getApplicationBySlug,
  updateApplication,
  ApplicationCase,
  buildApplicationFormDataPayload,
} from "@/lib/applications";
import { notify } from "@/lib/notify";
import FieldValue from "@/components/common/FieldValue";
import QueryResponseModal from "@/components/forms/QueryResponseModal";
import StatusBadge from "@/components/common/StatusBadge";
import {
  FileCheck,
  UploadCloud,
  CheckCircle,
  CheckCircle2,
  FileText,
  CreditCard,
  Download,
  AlertCircle,
  AlertTriangle,
  Activity,
  ArrowRight,
  ShieldAlert,
  Loader2,
  User,
  ExternalLink,
  Lock,
  Check,
  MessageSquare,
  ShieldCheck,
  Send,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getServiceConfig } from "@/features/services/registry";
import DynamicForm from "@/features/services/components/DynamicForm";
import { MultiFileUpload, UploadedFile } from "@/components/upload";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ApplicationWorkspacePage({ params }: PageProps) {
  const { slug } = use(params);

  // Find corresponding service definitions
  const serviceConfig = getServiceConfig(slug);
  if (!serviceConfig) {
    notFound();
  }

  // Load and sync application case from client storage
  const [appCase, setAppCase] = useState<ApplicationCase | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [supportingDocs, setSupportingDocs] = useState<UploadedFile[]>([]);

  // Sync application status from backend (polled gently every 10 seconds)
  useEffect(() => {
    let active = true;

    const loadApp = async () => {
      try {
        const activeApp = await getApplicationBySlug(slug);
        if (active && activeApp) {
          setAppCase(activeApp);
          setIsInitialLoading(false);
        }
      } catch (err) {
        // Silently handle rate limits or network issues without crashing UI
        console.warn("Application fetch status:", err);
      }
    };

    loadApp();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadApp();
      }
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [slug]);

  // Simulation loading states
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  // Status timeline configurations
  const timelineSteps = [
    {
      key: "PAYMENT_CONFIRMED",
      label: "Payment Clear",
      desc: "Fees cleared successfully",
      icon: CreditCard,
    },
    {
      key: "DOCUMENTS_PENDING",
      label: "Upload Docs",
      desc: "Attach required legal files",
      icon: UploadCloud,
    },
    {
      key: "UNDER_REVIEW",
      label: "Verification",
      desc: "Undergoing executive review",
      icon: FileText,
    },
    {
      key: "SUBMITTED",
      label: "Govt Filing",
      desc: "Forms sent to ministry",
      icon: Activity,
    },
    {
      key: "APPROVED",
      label: "Issued",
      desc: "Download certificate",
      icon: FileCheck,
    },
  ];

  const getEffectiveActiveIndex = (status?: string) => {
    if (!status) return 1;
    switch (status) {
      case "PAYMENT_CONFIRMED":
        return 1; // Step 0 (Payment Clear) is completed; Step 1 (Upload Docs) is active
      case "DOCUMENTS_PENDING":
        return 1; // Step 1 (Upload Docs) is active
      case "UNDER_REVIEW":
        return 2; // Step 2 (Verification) is active
      case "SUBMITTED":
        return 3; // Step 3 (Govt Filing) is active
      case "APPROVED":
        return 4; // Step 4 (Issued) is completed
      default:
        return 1;
    }
  };

  const currentStepIndex = appCase
    ? getEffectiveActiveIndex(appCase.status)
    : 1;

  // Simulate mock invoice generator
  const triggerInvoiceDownload = () => {
    if (!appCase) return;
    setIsGeneratingInvoice(true);
    setTimeout(() => {
      setIsGeneratingInvoice(false);

      const invoiceWindow = window.open("", "_blank");
      if (invoiceWindow) {
        invoiceWindow.document.write(`
          <html>
            <head>
              <title>Invoice - ${appCase.id}</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 40px; color: #334155; }
                .card { max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 12px; }
                .hdr { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
                .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin: 30px 0; }
                .tbl { width: 100%; border-collapse: collapse; margin-top: 20px; }
                .tbl th { text-align: left; padding: 10px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }
                .tbl td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
                .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 30px; color: #4f46e5; }
              </style>
            </head>
            <body>
              <div style="max-width:600px;margin:0 auto;border:1px solid #e2e8f0;padding:40px;border-radius:12px;background:#fff;">
                <div style="display:flex;justify-content:space-between;border-bottom:2px solid #f1f5f9;padding-bottom:20px;">
                  <div>
                    <h2 style="color:#4f46e5;margin:0;font-size:1.4em;">FIRSTLEASE COMPLIANCE PORTAL</h2>
                    <p style="font-size:0.8em;color:#64748b;margin:4px 0 0 0;">Secured Corporate Filings</p>
                  </div>
                  <div style="text-align:right;">
                    <h4 style="margin:0;font-size:1.2em;color:#0f172a;">TAX INVOICE</h4>
                    <p style="font-size:0.8em;color:#64748b;margin:4px 0 0 0;">${appCase.id}</p>
                  </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:30px 0;">
                  <div>
                    <strong style="color:#0f172a;">Billed To:</strong><br>
                    ${appCase.customerName}<br>
                    ${appCase.address || "India Registered Office"}
                  </div>
                  <div style="text-align:right;">
                    <strong style="color:#0f172a;">Filing Date:</strong> ${new Date(appCase.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}<br>
                    <strong style="color:#0f172a;">Payment Mode:</strong> Razorpay Gateway
                  </div>
                </div>
                <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                  <thead>
                    <tr style="background:#f8fafc;"><th style="text-align:left;padding:12px;border-bottom:1px solid #e2e8f0;font-size:0.85em;color:#475569;">Item Description</th><th style="text-align:right;padding:12px;border-bottom:1px solid #e2e8f0;font-size:0.85em;color:#475569;">Amount</th></tr>
                  </thead>
                  <tbody>
                    <tr><td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:0.9em;color:#334155;">${appCase.serviceTitle} - Government Fees</td><td style="text-align:right;padding:12px;border-bottom:1px solid #f1f5f9;font-size:0.9em;color:#334155;">₹${appCase.governmentFee}</td></tr>
                    <tr><td style="padding:12px;border-bottom:1px solid #f1f5f9;font-size:0.9em;color:#334155;">Professional Processing Charges</td><td style="text-align:right;padding:12px;border-bottom:1px solid #f1f5f9;font-size:0.9em;color:#334155;">₹${appCase.professionalFee}</td></tr>
                  </tbody>
                </table>
                <div style="text-align:right;font-size:1.2em;font-weight:bold;margin-top:30px;color:#4f46e5;">Total Paid: ₹${appCase.totalFee}</div>
              </div>
            </body>
          </html>
        `);
        invoiceWindow.document.close();
      }
    }, 1200);
  };

  // Simulate mock certificate delivery
  const triggerCertificateDownload = () => {
    if (!appCase) return;
    setIsDownloadingCert(true);
    setTimeout(() => {
      setIsDownloadingCert(false);

      const certWindow = window.open("", "_blank");
      if (certWindow) {
        certWindow.document.write(`
          <html>
            <head>
              <title>Certificate - ${appCase.serviceTitle}</title>
              <style>
                body { font-family: 'Times New Roman', serif; background: #faf8f5; padding: 60px; text-align: center; color: #2c251f; }
                .border-outer { border: 15px solid #d4af37; padding: 50px; background: #fff; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                .border-inner { border: 2px dashed #b8860b; padding: 40px; }
                h1 { font-size: 3em; margin: 0 0 10px 0; color: #8b6508; letter-spacing: 2px; }
                h3 { font-size: 1.5em; font-weight: normal; margin: 20px 0; }
                p.desc { font-style: italic; font-size: 1.2em; margin: 30px auto; max-width: 600px; line-height: 1.6; }
                div.meta { display: flex; justify-content: space-between; margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.9em; }
              </style>
            </head>
            <body>
              <div style="border: 15px solid #d4af37; padding: 50px; background: #fff; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                <div style="border: 2px dashed #b8860b; padding: 40px;">
                  <h1 style="font-size:2.8em;margin:0 0 10px 0;color:#8b6508;letter-spacing:2px;">CERTIFICATE OF COMPLIANCE</h1>
                  <p style="font-size:0.8em;letter-spacing:4px;color:#888;margin-bottom:20px;">MINISTRY OF CORPORATE AFFAIRS</p>
                  <h3 style="font-size:1.3em;font-weight:normal;margin:20px 0;">This is to certify that the business entity</h3>
                  <h2 style="font-size:2em;margin:10px 0;color:#111;font-weight:bold;">${appCase.customerName.toUpperCase()}</h2>
                  <p style="font-style:italic;font-size:1.1em;margin:30px auto;max-width:600px;line-height:1.6;color:#475569;">has successfully met all statutory guidelines, document submissions, and filing audits required under Indian Ministry Regulations for the service registration of</p>
                  <h2 style="color:#8b6508;margin:10px 0;font-size:1.8em;">${appCase.serviceTitle}</h2>
                  <div style="display:flex;justify-content:space-between;margin-top:60px;border-top:1px solid #eee;padding-top:20px;font-size:0.9em;color:#64748b;">
                    <div><strong>Tracking ID:</strong> ${appCase.id}</div>
                    <div><strong>Date of Issue:</strong> ${new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
        certWindow.document.close();
      }
    }, 1500);
  };

  if (isInitialLoading) {
    return (
      <Section className="bg-slate-50/50 min-h-screen pt-8 pb-20">
        <Container className="max-w-6xl">
          <WorkspaceSkeleton />
        </Container>
      </Section>
    );
  }

  if (!appCase) {
    return (
      <Section className="min-h-screen flex items-center justify-center bg-slate-50">
        <Container className="max-w-md text-center bg-white border border-slate-200 p-8 rounded-lg shadow-sm space-y-4">
          <ShieldAlert size={40} className="text-amber-500 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-900">
            Workspace Locked
          </h2>
          <p className="text-xs text-slate-400 leading-normal">
            No active application has been registered for this service yet.
            Please checkout the service package first.
          </p>
          <div className="pt-2">
            <Link href="/services">
              <Button fullWidth rightIcon={<ArrowRight size={14} />}>
                Explore Compliance Catalog
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="bg-slate-50/50 min-h-screen pt-8 pb-20">
      <Container className="max-w-6xl space-y-8">
        {/* Navigation Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Services", href: "/services" },
            { label: "Workspace" },
          ]}
        />

        {/* Executive Workspace Command Header Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 md:p-8 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 size-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full font-bold backdrop-blur-md">
                Ref ID: {appCase.id}
              </span>
              <StatusBadge
                status={
                  appCase.queryStatus ||
                  (appCase.query ? "QUERY_RAISED" : appCase.status)
                }
                size="md"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  {appCase.serviceTitle}
                </h1>
                <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-2">
                  <span>
                    Applicant:{" "}
                    <strong className="text-white">
                      {appCase.customerName}
                    </strong>
                  </span>
                  <span>&middot;</span>
                  <span>
                    Filed{" "}
                    {new Date(appCase.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerInvoiceDownload}
                  disabled={isGeneratingInvoice}
                  className="text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-md"
                  leftIcon={
                    isGeneratingInvoice ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <FileText size={13} />
                    )
                  }
                >
                  Download Invoice
                </Button>

                <Link href="/admin" target="_blank">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md font-bold"
                  >
                    Admin Panel <ExternalLink size={12} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Query Alert Warning Banner & Customer Response Trigger */}
        {(appCase.query || appCase.queryResponse) && (
          <div
            className={`p-5 rounded-2xl border shadow-md space-y-3 ${appCase.queryStatus === "CLIENT_RESPONDED" ? "bg-teal-50/90 border-teal-200 text-teal-950" : "bg-amber-50/90 border-amber-200 text-amber-950"}`}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex items-start gap-3">
                <div
                  className={`size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${appCase.queryStatus === "CLIENT_RESPONDED" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700 animate-pulse"}`}
                >
                  <AlertTriangle size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm">
                    {appCase.queryStatus === "CLIENT_RESPONDED"
                      ? "✅ Clarification Response Submitted to Officer"
                      : "⚠️ Action Required: Specialist Clarification Needed"}
                  </h4>
                  <p className="text-xs font-semibold leading-relaxed opacity-90">
                    "
                    {appCase.query ||
                      appCase.queryNote ||
                      "Please review and re-upload required verification details."}
                    "
                  </p>
                </div>
              </div>

              {appCase.queryStatus !== "CLIENT_RESPONDED" ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsQueryModalOpen(true)}
                  className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-sm"
                  leftIcon={<Send size={13} />}
                >
                  Respond to Query & Re-upload
                </Button>
              ) : (
                <span className="text-[11px] font-extrabold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-300 shrink-0">
                  Pending Officer Audit
                </span>
              )}
            </div>

            {/* Client Reply Summary if present */}
            {appCase.queryResponse && (
              <div className="pt-2 border-t border-teal-200/80 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-[11px] text-teal-900 uppercase tracking-wider block">
                  Your Submitted Reply:
                </span>
                <p className="italic bg-white/80 p-2.5 rounded-lg border border-teal-100 text-slate-800 font-medium">
                  "{appCase.queryResponse}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Timeline Stepper (Step 8: Application Tracking) */}
        <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-lg shadow-xs relative overflow-hidden">
          <h3 className="font-bold text-slate-900 text-sm mb-8 tracking-tight flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Application Progress Tracker
          </h3>

          <div className="relative">
            {/* Background Connector Bar (Desktop) */}
            <div className="absolute top-5 left-[10%] right-[10%] h-0.75 bg-slate-100 hidden md:block rounded-full z-0" />

            {/* Active Connector Bar (Desktop) */}
            <div
              className="absolute top-5 left-[10%] h-0.75 bg-green-600 hidden md:block rounded-full z-0 transition-all duration-500 ease-out"
              style={{ width: `${(currentStepIndex / 4) * 80}%` }}
            />

            {/* Background Connector Bar (Mobile) */}
            <div className="absolute left-5 top-5 bottom-5 w-0.75 bg-slate-100 md:hidden rounded-full z-0" />

            {/* Active Connector Bar (Mobile) */}
            <div
              className="absolute left-5 top-5 w-0.75 bg-green-600 md:hidden rounded-full z-0 transition-all duration-500 ease-out"
              style={{ height: `${(currentStepIndex / 4) * 100}%` }}
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4 relative z-10">
              {timelineSteps.map((step, idx) => {
                const isCompleted =
                  idx < currentStepIndex || appCase.status === "APPROVED";
                const isActive =
                  idx === currentStepIndex && appCase.status !== "APPROVED";
                const isPending =
                  idx > currentStepIndex && appCase.status !== "APPROVED";

                const StepIcon = step.icon;

                return (
                  <div
                    key={step.key}
                    className="flex flex-row md:flex-col items-center md:items-center md:text-center gap-4 md:gap-3 group"
                  >
                    {/* Stepper Circle Icon */}
                    <div
                      className={`size-10 md:size-11 rounded-full flex items-center justify-center transition-all duration-300 relative shrink-0 ${
                        isCompleted
                          ? "bg-green-600 text-white shadow-xs ring-2 ring-green-100"
                          : isActive
                            ? "bg-primary text-white shadow-xs ring-4 ring-primary-light scale-105"
                            : "bg-white text-slate-400 border-2 border-slate-200"
                      }`}
                    >
                      {/* Pulse Ring for Active Step */}
                      {isActive && (
                        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25" />
                      )}

                      {isCompleted ? (
                        <Check size={16} className="stroke-3" />
                      ) : (
                        <StepIcon
                          size={16}
                          className={cn(
                            "transition-colors",
                            isActive
                              ? "text-white"
                              : isPending
                                ? "text-slate-450"
                                : "",
                          )}
                        />
                      )}
                    </div>

                    {/* Step Labels & Info */}
                    <div className="text-left md:text-center space-y-0.5">
                      <h4
                        className={`font-semibold text-xs tracking-wide transition-colors ${
                          isCompleted
                            ? "text-green-700"
                            : isActive
                              ? "text-primary"
                              : "text-slate-450"
                        }`}
                      >
                        {step.label}
                      </h4>
                      <p
                        className={`text-xs leading-normal transition-colors max-w-40 md:mx-auto ${
                          isActive
                            ? "text-slate-600 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dynamic Schema-Driven Filing Form & Upload Portal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dynamic Schema-Driven Form Engine */}
            <div className="space-y-4">
              <DynamicForm
                config={serviceConfig}
                disabled={
                  appCase
                    ? (appCase.status === "UNDER_REVIEW" ||
                        appCase.status === "SUBMITTED" ||
                        appCase.status === "APPROVED") &&
                      !appCase.query
                    : false
                }
                initialValues={{
                  applicantName: appCase.customerName,
                  fullName: appCase.customerName,
                  mobileNumber: appCase.customerPhone,
                  registeredAddress: appCase.address,
                  ...Object.fromEntries(
                    Object.entries(appCase.formData || {}).filter(
                      ([key]) => !key.startsWith("_")
                    )
                  ),
                }}
                onSubmit={async (formData) => {
                  console.log("Filing Form Data:", formData);
                  notify.loading({
                    title: "Submitting Filing Application...",
                    description:
                      "Transmitting dynamic form payload to backend.",
                  });

                  const payload = buildApplicationFormDataPayload(
                    formData as Record<string, any>,
                    supportingDocs
                  );

                  await updateApplication(appCase.id, {
                    status: "UNDER_REVIEW",
                    query: "",
                    formData: payload,
                  });
                  const activeApp = await getApplicationBySlug(slug);
                  setAppCase(activeApp);
                  notify.success({
                    title: "Filing Application Submitted! 🎉",
                    description: "Updated workspace status to UNDER_REVIEW.",
                  });
                }}
              />
            </div>

            {/* Additional Supporting Documents MultiFileUpload Portal */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <UploadCloud size={16} className="text-indigo-600" />
                  Upload Additional Supporting Documents & Attachments
                </h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Attach supporting verification files for your filing (e.g.
                Utility Bills, Property Leases, NOCs, Bank Statements, Financial
                Audit Reports).
              </p>
              <MultiFileUpload
                label="Supporting Attachments (Up to 10 files, max 10MB each)"
                value={supportingDocs}
                onChange={setSupportingDocs}
                maxFiles={10}
                maxSizeMb={10}
                allowedTypes={["pdf", "png", "jpg", "jpeg"]}
                disabled={appCase.status === "APPROVED"}
              />
            </div>
          </div>

          {/* Checkout pricing, Invoices, and Delivery Vault (Steps 6 & 9) */}
          <div className="space-y-6">
            {/* Payment Details Card (Step 6) */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                <CreditCard size={16} className="text-primary" />
                Payment Breakdown
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Government Fees</span>
                  <span>₹{appCase.governmentFee}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Professional Filing Fees</span>
                  <span>₹{appCase.professionalFee}</span>
                </div>
                <div className="border-t border-slate-150 pt-2 flex justify-between font-semibold text-sm text-slate-800">
                  <span>Total Amount Paid</span>
                  <span className="text-primary">₹{appCase.totalFee}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  className="text-xs md:text-sm"
                  variant="outline"
                  fullWidth
                  onClick={triggerInvoiceDownload}
                  disabled={isGeneratingInvoice}
                  leftIcon={
                    isGeneratingInvoice ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <FileText size={14} />
                    )
                  }
                >
                  {isGeneratingInvoice
                    ? "Generating..."
                    : "Download Invoice Receipt"}
                </Button>
              </div>
            </div>

            {/* Assigned Executive details */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-3 text-xs">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                <User size={16} className="text-primary" />
                Assigned Specialist
              </h3>
              <div className="flex items-center gap-2.5">
                <div className="size-8 bg-slate-100 rounded-full flex items-center justify-center font-semibold text-slate-500">
                  {appCase.assignedExecutive
                    ? appCase.assignedExecutive[0]
                    : "?"}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {appCase.assignedExecutive || "Assigning Officer..."}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {appCase.assignedExecutive
                      ? "MCA Filing Specialist"
                      : "Pending officer allocation"}
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Vault (Step 9) */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileCheck size={16} className="text-primary" />
                Certificate Delivery Vault
              </h3>

              {appCase.status === "APPROVED" ? (
                /* Unlocked Vault Panel */
                <div className="space-y-3 text-center py-2">
                  <div className="size-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle size={20} />
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800">
                    Registration Approved!
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal px-2">
                    Ministry has successfully verified filings and issued your
                    official compliance certificate.
                  </p>
                  <div className="pt-2">
                    <Button
                      fullWidth
                      onClick={triggerCertificateDownload}
                      disabled={isDownloadingCert}
                      leftIcon={
                        isDownloadingCert ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )
                      }
                    >
                      {isDownloadingCert
                        ? "Downloading..."
                        : "Download Certificate"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Locked Vault Panel */
                <div className="text-center py-4 bg-slate-50/50 border border-slate-100 rounded-lg space-y-2">
                  <div className="size-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Lock size={18} className="text-slate-400" />
                  </div>
                  <h4 className="font-semibold text-xs text-slate-500">
                    Vault Locked
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal px-6">
                    Download will be unlocked automatically once the application
                    reaches APPROVED status.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>

      {/* Query Response Modal */}
      <QueryResponseModal
        application={appCase}
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        onSuccess={async () => {
          const activeApp = await getApplicationBySlug(slug);
          setAppCase(activeApp);
        }}
      />
    </Section>
  );
}
