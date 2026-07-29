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
} from "@/lib/applications";
import { notify } from "@/lib/notify";
import {
  FileCheck,
  UploadCloud,
  Trash2,
  CheckCircle,
  FileText,
  CreditCard,
  Download,
  AlertCircle,
  Activity,
  ArrowRight,
  ShieldAlert,
  Loader2,
  User,
  ExternalLink,
  Lock,
  Check,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/ui/overlay";
import { getServiceConfig } from "@/features/services/registry";
import DynamicForm from "@/features/services/components/DynamicForm";
import FileUpload, {
  validateFileSecurity,
  sanitizeFilename,
} from "@/components/forms/FileUpload";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ApplicationWorkspacePage({ params }: PageProps) {
  const { slug } = use(params);
  const modal = useModal();

  // Find corresponding service definitions
  const serviceConfig = getServiceConfig(slug);
  if (!serviceConfig) {
    notFound();
  }

  // Load and sync application case from client storage
  const [appCase, setAppCase] = useState<ApplicationCase | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  // Upload simulation states
  const requiredDocs =
    serviceConfig?.sections
      .flatMap((s) => s.fields)
      .filter((f) => f.type === "file" || f.type === "front-back-file")
      .map((f) => f.label) || [
      "PAN Card",
      "Aadhaar Card",
      "Office Address Proof",
    ];
  const [isSubmittingDocs, setIsSubmittingDocs] = useState(false);

  // Simulation loading states
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isDownloadingCert, setIsDownloadingCert] = useState(false);

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

  // Remove file attachments
  const handleDeleteFile = async (docName: string) => {
    if (!appCase) return;
    const newUploads = { ...appCase.uploadedDocs };
    delete newUploads[docName];

    await updateApplication(appCase.id, { uploadedDocs: newUploads });
    const activeApp = await getApplicationBySlug(slug);
    setAppCase(activeApp);
  };

  // View uploaded file modal
  const handleViewFile = (
    docName: string,
    file: { name: string; size: string; type: string; url?: string },
  ) => {
    const canEdit = appCase
      ? appCase.status === "DOCUMENTS_PENDING" ||
        appCase.status === "PAYMENT_CONFIRMED"
      : false;

    modal.open({
      title: "Secure Document Preview",
      size: "lg",
      content: (
        <div className="space-y-6 text-center py-4">
          <div className="mx-auto size-12 bg-primary-light text-primary rounded-full flex items-center justify-center">
            <FileText size={24} />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-base">
              {docName}
            </h3>
            <p className="text-xs text-slate-500 font-semibold truncate max-w-sm mx-auto">
              {file.name}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>{file.size}</span>
              <span>&bull;</span>
              <span>{file.type} Format</span>
            </div>
          </div>

          {/* File Preview Content */}
          {file.url ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center min-h-75">
              {file.type.toUpperCase() === "PDF" ? (
                <iframe
                  src={file.url}
                  className="w-full h-95 border-0"
                  title={file.name}
                />
              ) : (
                <img
                  src={file.url}
                  className="max-h-95 w-auto max-w-full object-contain p-2 rounded-lg shadow-sm bg-white border border-slate-200"
                  alt={file.name}
                />
              )}
            </div>
          ) : (
            /* Mock Fallback Preview Content */
            <div className="border border-slate-150 bg-slate-50 rounded-lg p-8 flex flex-col items-center justify-center gap-3 min-h-48 border-dashed">
              <div className="h-1.5 w-16 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-1.5 w-32 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-1.5 w-24 bg-slate-200 rounded-full animate-pulse" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">
                Simulated Encryption Secure Sandbox Preview
              </p>
              <span className="text-xs text-slate-400 text-center max-w-xs leading-normal font-medium">
                This file has been securely encrypted in compliance with
                statutory guidelines for Ministry Filings.
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
            <div>
              {canEdit && (
                <>
                  <input
                    type="file"
                    id="replace-file-picker"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const newFile = e.target.files?.[0];
                      if (!newFile || !appCase) return;

                      const check = validateFileSecurity(
                        newFile,
                        ["pdf", "png", "jpg", "jpeg"],
                        5,
                      );
                      if (!check.isValid) {
                        notify.error({
                          title: "Validation Failed",
                          description: check.error || "Security check failed.",
                        });
                        return;
                      }

                      const sanitized = sanitizeFilename(newFile.name);
                      const objectUrl = URL.createObjectURL(newFile);
                      const updatedFile = {
                        name: sanitized,
                        size: `${(newFile.size / (1024 * 1024)).toFixed(2)} MB`,
                        type:
                          newFile.type.split("/")[1]?.toUpperCase() ||
                          newFile.name.split(".").pop()?.toUpperCase() ||
                          "UNKNOWN",
                        url: objectUrl,
                      };

                      const newUploads = {
                        ...appCase.uploadedDocs,
                        [docName]: updatedFile,
                      };
                      updateApplication(appCase.id, {
                        uploadedDocs: newUploads,
                      }).then(() => {
                        getApplicationBySlug(slug).then(setAppCase);
                      });
                      notify.success({
                        title: "Document Updated",
                        description: `Replaced with ${sanitized}`,
                      });
                      modal.closeAll();
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-primary border-primary-border hover:bg-primary-light/30"
                    onClick={() =>
                      document.getElementById("replace-file-picker")?.click()
                    }
                  >
                    Replace File
                  </Button>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => modal.closeAll()}
              >
                Close
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  notify.success(
                    "Document verification copy downloaded to client storage.",
                  );
                  modal.closeAll();
                }}
              >
                Download Document
              </Button>
            </div>
          </div>
        </div>
      ),
    });
  };

  // Submit all documents for review
  const handleSubmitDocuments = async () => {
    if (!appCase) return;
    setIsSubmittingDocs(true);
    const submitPromise = new Promise((resolve) => setTimeout(resolve, 2000));

    notify.promise(submitPromise, {
      loading: {
        title: "Submitting Files",
        description: "Registering upload coordinates.",
      },
      success: {
        title: "Files Transmitted",
        description: "Verification queue updated.",
      },
      error: { title: "Transmission Error", description: "Gateway failure." },
    });

    try {
      await submitPromise;
      // Clear queries on re-submission and advance status
      await updateApplication(appCase.id, {
        status: "UNDER_REVIEW",
        query: "", // clear query
      });
      const activeApp = await getApplicationBySlug(slug);
      setAppCase(activeApp);
      setIsSubmittingDocs(false);
    } catch (e) {
      setIsSubmittingDocs(false);
    }
  };

  // Check if all required files are present
  const allFilesUploaded = appCase
    ? requiredDocs.every((doc: string) => !!appCase.uploadedDocs[doc])
    : false;

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
              <div class="card">
                <div class="hdr">
                  <div>
                    <h2 style="color:#4f46e5;margin:0;">COMPLIANCE PORTAL</h2>
                    <p style="font-size:0.8em;color:#64748b;">Secured Corporate Filings</p>
                  </div>
                  <div style="text-align:right;">
                    <h4 style="margin:0;">INVOICE</h4>
                    <p style="font-size:0.8em;color:#64748b;">${appCase.id}</p>
                  </div>
                </div>
                <div class="grid">
                  <div>
                    <strong>Billed To:</strong><br>
                    ${appCase.customerName}<br>
                    ${appCase.address || "India Registered Office"}
                  </div>
                  <div style="text-align:right;">
                    <strong>Filing Date:</strong> ${new Date(appCase.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}<br>
                    <strong>Payment Mode:</strong> UPI Gateway
                  </div>
                </div>
                <table class="tbl">
                  <thead>
                    <tr><th>Item Description</th><th style="text-align:right;">Amount</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>${appCase.serviceTitle} - Government Fees</td><td style="text-align:right;">₹${appCase.governmentFee}</td></tr>
                    <tr><td>Professional Processing Charges</td><td style="text-align:right;">₹${appCase.professionalFee}</td></tr>
                  </tbody>
                </table>
                <div class="total">Total Paid: ₹${appCase.totalFee}</div>
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
                .desc { font-style: italic; font-size: 1.2em; margin: 30px auto; max-width: 600px; line-height: 1.6; }
                .meta { display: flex; justify-content: space-between; margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px; font-size: 0.9em; }
              </style>
            </head>
            <body>
              <div class="border-outer">
                <div class="border-inner">
                  <h1>CERTIFICATE OF COMPLIANCE</h1>
                  <p style="font-size:0.8em;letter-spacing:4px;color:#888;">MINISTRY OF CORPORATE AFFAIRS</p>
                  <h3>This is to certify that the business entity</h3>
                  <h2 style="font-size:2em;margin:10px 0;color:#111;">${appCase.customerName.toUpperCase()}</h2>
                  <p class="desc">has successfully met all statutory guidelines, document submissions, and filing audits required under Indian Ministry Regulations for the service registration of</p>
                  <h2 style="color:#8b6508;margin:10px 0;">${appCase.serviceTitle}</h2>
                  <div class="meta">
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

        {/* Administrative Quick-link Banner */}
        <div className="bg-primary-light border border-primary-border rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary-light text-primary rounded-lg flex items-center justify-center shrink-0">
              <Activity size={18} />
            </div>
            <div>
              <h4 className="font-semibold text-xs text-primary">
                Filing Status Linked to BackOffice
              </h4>
              <p className="text-xs text-primary leading-normal">
                Open the admin panel in another tab to manage status updates,
                assign specialists, or test query responses.
              </p>
            </div>
          </div>
          <Link href="/admin" target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="text-xs bg-white flex items-center gap-1.5 font-semibold"
            >
              Open Admin Console <ExternalLink size={12} />
            </Button>
          </Link>
        </div>

        {/* Query Alert Warning Banner (Step 7: Query Raised UI) */}
        {appCase.query && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex gap-4 items-start shadow-2xs">
            <div className="size-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0 mt-0.5 animate-pulse">
              <AlertCircle size={20} />
            </div>
            <div className="space-y-1.5 text-left">
              <h4 className="font-semibold text-sm text-red-800">
                Filing Action Required: Query Raised
              </h4>
              <p className="text-xs text-red-600 leading-relaxed font-semibold">
                {appCase.query}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Please re-upload your verification details below and re-submit
                for clearance.
              </p>
            </div>
          </div>
        )}

        {/* Main Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-lg shadow-xs">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {appCase.serviceTitle}
            </h1>
            <p className="text-xs text-slate-400">
              Reference ID:{" "}
              <span className="font-semibold text-slate-600">{appCase.id}</span>{" "}
              &middot; Ordered on:{" "}
              {new Date(appCase.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              appCase.status === "APPROVED"
                ? "bg-green-50 text-green-700 border-green-200"
                : appCase.status === "PAYMENT_CONFIRMED"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-3xs"
                  : appCase.query
                    ? "bg-amber-50 text-amber-600 border border-amber-100"
                    : "bg-primary-light text-primary border-primary-border"
            }`}
          >
            {appCase.status === "PAYMENT_CONFIRMED"
              ? "✓ PAYMENT CONFIRMED"
              : appCase.query
                ? "QUERY PENDING"
                : appCase.status.replace("_", " ")}
          </span>
        </div>

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
                initialValues={{
                  applicantName: appCase.customerName,
                  fullName: appCase.customerName,
                  mobileNumber: appCase.customerPhone,
                  registeredAddress: appCase.address,
                }}
                onSubmit={async (formData) => {
                  notify.loading({
                    title: "Submitting Filing Application...",
                    description:
                      "Transmitting dynamic form payload to backend.",
                  });
                  await updateApplication(appCase.id, {
                    status: "UNDER_REVIEW",
                    query: "",
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
    </Section>
  );
}
