"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  XCircle,
  X,
  ShieldAlert,
  Clock,
  Send,
  UserCheck,
  AlertTriangle,
  Loader2,
  FileText,
  Download,
  Award,
  CreditCard,
  MessageSquare,
  Building2,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Eye,
} from "lucide-react";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import FieldValue from "@/components/common/FieldValue";
import Select from "@/components/forms/Select";
import Textarea from "@/components/forms/Textarea";
import Input from "@/components/forms/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  getApplicationBySlug,
  updateApplication,
  ApplicationCase,
} from "@/lib/applications";
import { FileUpload, MultiFileUpload, UploadedFile } from "@/components/upload";
import { notify } from "@/lib/notify";
import apiFetch from "@/lib/apiClient";
import { formatDate } from "@/utils/formatters";

interface SpecialistMember {
  id: string;
  name: string;
  role: string;
}

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const caseId = params.id as string;

  const [application, setApplication] = useState<ApplicationCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [specialists, setSpecialists] = useState<SpecialistMember[]>([]);
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("");
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [certName, setCertName] = useState("");
  const [certFiles, setCertFiles] = useState<UploadedFile[]>([]);

  // Document Verification State
  const [docVerifications, setDocVerifications] = useState<
    Record<string, { status: "VERIFIED" | "DEFECTIVE"; reason?: string }>
  >({});
  const [flaggingDocKey, setFlaggingDocKey] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [previewDocument, setPreviewDocument] = useState<{
    docKey: string;
    file: UploadedFile;
  } | null>(null);
  const submittedFormEntries = Object.entries(application?.formData || {}).filter(
    ([fieldName]) => !fieldName.startsWith("_"),
  );

  // Load application details & team specialists
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getApplicationBySlug(caseId);
        if (data) {
          setApplication(data);
          setAssignedOfficer(data.assignedExecutive || "");
          setDocVerifications(data.formData?._docVerification || {});
        }
      } catch (err) {
        console.error("Failed to load application detail:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Mock Team Specialists List
    setSpecialists([
      { id: "1", name: "Rahul Sharma (CA)", role: "Senior Tax Consultant" },
      { id: "2", name: "Priya Patel (CS)", role: "Company Law Specialist" },
      { id: "3", name: "Amit Verma (Advocate)", role: "Trademark Attorney" },
      { id: "4", name: "Neha Gupta (Compliance Lead)", role: "Filing Manager" },
    ]);
  }, [caseId]);

  // Handle Verify Document
  const handleVerifyDoc = async (docKey: string) => {
    if (!application) return;
    const updatedVerifications = {
      ...docVerifications,
      [docKey]: { status: "VERIFIED" as const },
    };
    setDocVerifications(updatedVerifications);

    const currentForm = (application.formData || {}) as Record<string, any>;
    const res = await updateApplication(application.id, {
      formData: {
        ...currentForm,
        _docVerification: updatedVerifications,
      },
    });

    if (res.success && res.data) {
      setApplication(res.data);
      notify.success(`Document '${docKey}' verified successfully! 🟢`);
    } else {
      notify.error("Failed to verify document.");
    }
  };

  // Handle Flag Defective with Smart Query Auto-fill
  const handleConfirmFlagDefective = async () => {
    if (!application || !flaggingDocKey) return;
    const reasonText =
      selectedReason === "Other" ? customReason.trim() : selectedReason;
    if (!reasonText) {
      notify.error(
        "Please select or enter a reason for flagging this document.",
      );
      return;
    }

    const updatedVerifications = {
      ...docVerifications,
      [flaggingDocKey]: { status: "DEFECTIVE" as const, reason: reasonText },
    };
    setDocVerifications(updatedVerifications);

    const currentForm = (application.formData || {}) as Record<string, any>;
    const res = await updateApplication(application.id, {
      formData: {
        ...currentForm,
        _docVerification: updatedVerifications,
      },
    });

    if (res.success && res.data) {
      setApplication(res.data);

      // Smart Feature: Auto-fill Raise Query text
      const autoQueryMsg = `Document verification issue identified on '${flaggingDocKey}': ${reasonText}. Please re-upload a clear and valid copy.`;
      setQueryText(autoQueryMsg);

      notify.warning(
        `'${flaggingDocKey}' flagged as defective 🔴 Query alert pre-filled below!`,
      );
      setFlaggingDocKey(null);
      setSelectedReason("");
      setCustomReason("");
    } else {
      notify.error("Failed to flag document.");
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (newStatus: string) => {
    if (!application) return;
    setIsUpdatingStatus(newStatus);
    try {
      const res = await updateApplication(application.id, {
        status: newStatus as any,
      });
      if (res.success && res.data) {
        setApplication(res.data);
        notify.success(`Filing stage updated to ${newStatus}.`);
      }
    } catch (err) {
      notify.error("Failed to update filing stage.");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Assign Executive / Officer
  const handleAssignOfficer = async (execName: string) => {
    if (!application) return;
    setAssignedOfficer(execName);
    try {
      const res = await updateApplication(application.id, {
        assignedExecutive: execName,
      });
      if (res.success && res.data) {
        setApplication(res.data);
        notify.success(`Assigned ${execName} as case specialist.`);
      }
    } catch (err) {
      notify.error("Failed to assign executive.");
    }
  };

  // Raise Customer Query Alert
  const handleRaiseQuery = async () => {
    if (!application || !queryText.trim()) {
      notify.error("Please enter a query message for the client.");
      return;
    }
    try {
      const res = await updateApplication(application.id, {
        query: queryText.trim(),
      });
      if (res.success && res.data) {
        setApplication(res.data);
        setQueryText("");
        notify.warning("Query alert sent to customer workspace.");
      }
    } catch (err) {
      notify.error("Failed to raise query alert.");
    }
  };

  // Clear Query Alert
  const handleClearQuery = async () => {
    if (!application) return;
    try {
      const res = await updateApplication(application.id, { query: "" });
      if (res.success && res.data) {
        setApplication(res.data);
        setQueryText("");
        notify.success("Active query warning cleared.");
      }
    } catch (err) {
      notify.error("Failed to clear query.");
    }
  };

  // Submit certificate(s)
  const handleIssueCertificate = async () => {
    if (!application) return;

    if (certFiles.length === 0 && !certName.trim()) {
      notify.error(
        "Please attach at least one certificate file or enter a title.",
      );
      return;
    }

    setIsUploadingCert(true);
    try {
      let newCerts: any[] = [];

      if (certFiles.length > 0) {
        newCerts = certFiles.map((file, idx) => ({
          id: `CERT-${Date.now()}-${idx}`,
          name: certName.trim()
            ? `${certName.trim()} (${file.name})`
            : file.name,
          certificateName: certName.trim()
            ? `${certName.trim()} (${file.name})`
            : file.name,
          issuedDate: new Date().toISOString().split("T")[0],
          url: file.url || `/certificates/${application.id}_cert.pdf`,
          certificateUrl:
            file.url || `/certificates/${application.id}_cert.pdf`,
        }));
      } else {
        newCerts = [
          {
            id: `CERT-${Date.now()}`,
            name: certName.trim(),
            certificateName: certName.trim(),
            issuedDate: new Date().toISOString().split("T")[0],
            url: `/certificates/${application.id}_cert.pdf`,
            certificateUrl: `/certificates/${application.id}_cert.pdf`,
          },
        ];
      }

      const updatedCerts = [
        ...(application.issuedCertificates || []),
        ...newCerts,
      ];
      const res = await updateApplication(application.id, {
        status: "APPROVED" as any,
        issuedCertificates: updatedCerts as any,
      });
      if (res.success && res.data) {
        setApplication(res.data);
        setCertName("");
        setCertFiles([]);
        notify.success(
          `Issued ${newCerts.length} official certificate(s) successfully!`,
        );
      }
    } catch (err) {
      notify.error("Failed to issue certificates.");
    } finally {
      setIsUploadingCert(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center space-y-3">
        <Loader2 className="size-8 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">
          Loading case workspace...
        </p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="size-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">
          Application Case Not Found
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested filing tracking ID{" "}
          <span className="font-mono font-bold text-slate-800">#{caseId}</span>{" "}
          could not be found.
        </p>
        <Link href="/admin/applications">
          <Button variant="primary" size="sm">
            Back to Filing Queue
          </Button>
        </Link>
      </div>
    );
  }

  const steps = [
    {
      key: "PAYMENT_CONFIRMED",
      title: "Payment Verified",
      sub: "Fee received via Razorpay",
    },
    {
      key: "UNDER_REVIEW",
      title: "Under Verification",
      sub: "CA Audit & Document Check",
    },
    {
      key: "SUBMITTED",
      title: "Submitted to Ministry",
      sub: "Govt MCA/GST Filing Portal",
    },
    {
      key: "APPROVED",
      title: "Approved & Issued",
      sub: "Certificate Ready for Download",
    },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === application.status);
  const activeStepNumber =
    currentStepIdx >= 0
      ? currentStepIdx + 1
      : application.status === "APPROVED"
        ? 4
        : 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 border-b border-slate-200/80 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/applications" className="w-auto">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Filing Queue
            </Button>
          </Link>

          <StatusBadge
            status={application.query ? "QUERY_RAISED" : application.status}
            size="md"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {application.serviceTitle}
              </h1>
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 shrink-0">
                #{application.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5">
              <span>Customer: <strong className="text-slate-800">{application.customerName}</strong></span>
              <span>&middot;</span>
              <span>Submitted {formatDate(application.createdAt)}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/${application.customerPhone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full sm:w-auto text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 border-0 shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer py-2 px-3.5"
              >
                <MessageSquare size={14} className="text-white" /> WhatsApp Applicant
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Visual Filing Stepper */}
      <Card>
        <CardContent className="p-3.5 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 relative">
            {steps.map((step, idx) => {
              const stepNo = idx + 1;
              const isCompleted =
                activeStepNumber > stepNo || application.status === "APPROVED";
              const isCurrent =
                activeStepNumber === stepNo &&
                application.status !== "APPROVED";

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-lg border transition-all ${
                    isCompleted
                      ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                      : isCurrent
                        ? "bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 shadow-xs"
                        : "bg-slate-50/60 border-slate-200 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                            ? "bg-indigo-600 text-white shadow-xs animate-pulse"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? "✓" : stepNo}
                    </div>
                    <span className="text-xs font-black leading-tight">
                      {step.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium pl-8 leading-snug">
                    {step.sub}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: 2-Column Desktop View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Workflow Actions & Uploaded Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Filing Stage Workflow & Actions */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle>Advance Filing Stage & Actions</CardTitle>
              <CardDescription>
                Update filing lifecycle, manage customer queries, or issue
                certificates.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {application.query || application.queryResponse ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 sm:p-5 rounded-lg border shadow-xs space-y-3.5 ${
                      application.queryStatus === "CLIENT_RESPONDED"
                        ? "bg-teal-50/90 border-teal-200 text-teal-950"
                        : "bg-amber-50/90 border-amber-200 text-amber-950"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className={`size-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            application.queryStatus === "CLIENT_RESPONDED"
                              ? "bg-teal-100 text-teal-700"
                              : "bg-amber-100 text-amber-700 animate-pulse"
                          }`}
                        >
                          <AlertTriangle className="size-5" />
                        </div>
                        <div className="min-w-0 space-y-1.5 flex-1">
                          <h4 className="font-extrabold text-xs sm:text-sm tracking-tight leading-snug">
                            {application.queryStatus === "CLIENT_RESPONDED"
                              ? "Client Responded to Active Query"
                              : "Active Query Alert Pending Customer Response"}
                          </h4>
                          <div className="p-2.5 bg-white/90 rounded-lg border border-amber-200/60 shadow-2xs font-mono text-[11px] leading-relaxed text-slate-800 break-words">
                            "{application.query || application.queryNote}"
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 self-start sm:self-center">
                        <StatusBadge
                          status={application.queryStatus || "QUERY_RAISED"}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Render Client Written Response & Uploaded Files if Client Responded */}
                    {application.queryResponse && (
                      <div className="p-3.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs space-y-2 text-xs">
                        <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider block">
                          Applicant Written Clarification:
                        </span>
                        <p className="text-slate-900 font-semibold bg-slate-50 p-3 rounded-lg border border-slate-200/60 italic leading-relaxed break-words">
                          "{application.queryResponse}"
                        </p>

                        {application.clientResponseFiles &&
                          application.clientResponseFiles.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 space-y-1.5">
                              <span className="font-bold text-[11px] text-slate-600 block">
                                Re-uploaded Document(s):
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {application.clientResponseFiles.map(
                                  (file: any, idx: number) => (
                                    <FieldValue
                                      key={idx}
                                      value={file}
                                      compact
                                    />
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    <div className="pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleClearQuery}
                        className="w-full sm:w-auto text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-xs flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg active:scale-95 cursor-pointer"
                        leftIcon={
                          <CheckCircle className="size-4 text-white" />
                        }
                      >
                        Approve & Mark Query Resolved
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Move Filing Stage Forward
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      variant={
                        application.status === "UNDER_REVIEW"
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                      disabled={isUpdatingStatus !== null}
                      className="rounded-lg justify-start font-bold text-xs py-2.5 cursor-pointer"
                      leftIcon={
                        isUpdatingStatus === "UNDER_REVIEW" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <UserCheck className="size-4" />
                        )
                      }
                    >
                      1. In Review
                    </Button>

                    <Button
                      variant={
                        application.status === "SUBMITTED"
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleUpdateStatus("SUBMITTED")}
                      disabled={isUpdatingStatus !== null}
                      className="rounded-lg justify-start font-bold text-xs py-2.5 cursor-pointer"
                      leftIcon={
                        isUpdatingStatus === "SUBMITTED" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Send className="size-4" />
                        )
                      }
                    >
                      2. Submit to Govt
                    </Button>

                    <Button
                      variant={
                        application.status === "APPROVED"
                          ? "primary"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handleUpdateStatus("APPROVED")}
                      disabled={isUpdatingStatus !== null}
                      className="rounded-lg justify-start font-bold text-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer"
                      leftIcon={
                        isUpdatingStatus === "APPROVED" ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle className="size-4" />
                        )
                      }
                    >
                      3. Approve & Issue
                    </Button>
                  </div>
                </div>
              )}

              {/* Raise Customer Query */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Raise Clarification Query to Customer Workspace
                </label>

                <Select
                  onChange={(val) => {
                    if (val) setQueryText(val);
                  }}
                  placeholder="Quick Query Templates..."
                  options={[
                    { label: "Quick Query Templates...", value: "" },
                    {
                      label: "📄 Address proof blurred or unreadable",
                      value:
                        "Address proof blurred or unreadable. Please re-upload clear utility bill or registered lease agreement.",
                    },
                    {
                      label: "🆔 PAN Card name mismatch",
                      value:
                        "PAN Card name does not match applicant full legal name. Please provide official name change proof or gazette copy.",
                    },
                    {
                      label: "📑 Aadhaar Card front & back missing",
                      value:
                        "Aadhaar Card front and back side scans missing. Please upload complete document.",
                    },
                    {
                      label: "🏬 FSSAI / Premises NOC Missing",
                      value:
                        "Premises No Objection Certificate (NOC) or electricity bill copy missing for business address verification.",
                    },
                    {
                      label: "✍️ Signature Scan Invalid",
                      value:
                        "Specimen signature scan blurred or has colored background. Please upload clear black ink signature on white paper.",
                    },
                  ]}
                />

                <Textarea
                  rows={2}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Type specific query for client workspace..."
                  className="text-xs p-2.5"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRaiseQuery}
                  className="text-xs font-bold text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100"
                  leftIcon={<AlertTriangle className="size-4 text-amber-600" />}
                >
                  Send Query Alert to Customer
                </Button>
              </div>

              {/* Issue Certificate Section (Only Visible when Submitted to Ministry or Approved) */}
              {application.status === "SUBMITTED" ||
              application.status === "APPROVED" ? (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Issue Official Government Filing Certificate
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle size={10} /> Unlocked (Submitted to Ministry)
                    </span>
                  </div>

                  {application.issuedCertificates &&
                    application.issuedCertificates.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-emerald-800">
                          Issued Certificates:
                        </p>
                        {application.issuedCertificates.map((cert: any, i) => (
                          <div
                            key={i}
                            className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Award className="size-4 text-emerald-600 shrink-0" />
                              <span className="font-bold text-emerald-900">
                                {cert.certificateName || cert.name}
                              </span>
                            </div>
                            <a
                              href={cert.certificateUrl || cert.url}
                              target="_blank"
                              download
                              className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                            >
                              <Download size={13} /> Download PDF
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="space-y-3 bg-slate-50/70 border border-slate-200/80 rounded-lg p-4">
                    <Input
                      type="text"
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      placeholder="Certificate Title (e.g. Certificate of Incorporation - Form INC-11)"
                      className="text-xs py-2 px-3 bg-white"
                    />

                    <MultiFileUpload
                      label="Attach Official Certificate Document(s) (PDF / Image - Up to 5 files)"
                      value={certFiles}
                      onChange={setCertFiles}
                      allowedTypes={["pdf", "png", "jpg", "jpeg"]}
                      maxFiles={5}
                      maxSizeMb={10}
                    />

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleIssueCertificate}
                      disabled={
                        isUploadingCert ||
                        (!certName.trim() && certFiles.length === 0)
                      }
                      className="w-full sm:w-auto text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      leftIcon={
                        isUploadingCert ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Award className="size-4" />
                        )
                      }
                    >
                      {isUploadingCert
                        ? "Issuing Certificate(s)..."
                        : `Attach & Issue ${certFiles.length > 1 ? `${certFiles.length} Certificates` : "Certificate"} to Customer`}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-100 pt-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-center gap-2.5">
                    <Clock size={16} className="text-slate-400 shrink-0" />
                    <span>
                      Official Certificate Issuance will unlock once filing
                      stage is advanced to{" "}
                      <strong>2. Submit to Govt (Submitted to Ministry)</strong>
                      .
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Submitted Applicant Form Data & Information */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-4 text-indigo-600" />
                  Submitted Form Data & Information
                </CardTitle>
                <CardDescription>
                  Dynamic form input fields provided by the applicant.
                </CardDescription>
              </div>
              {submittedFormEntries.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      notify.success(
                        "Applicant form details approved by compliance officer.",
                      )
                    }
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                    leftIcon={<CheckCircle size={13} />}
                  >
                    Approve Details
                  </Button>
                )}
            </CardHeader>
            <CardContent className="p-5">
              {submittedFormEntries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {submittedFormEntries.map(([k, v]) => (
                    <div
                      key={k}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1"
                    >
                      <span className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider block">
                        {k.replace(/([A-Z])/g, " $1")}
                      </span>
                      <div className="font-bold text-xs text-slate-900 font-mono block break-words">
                        <FieldValue value={v} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs italic">
                  Standard checkout details: Customer (
                  {application.customerName}), Phone (
                  {application.customerPhone}), Address (
                  {application.address || "N/A"}).
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Query Communication Audit Log & History */}
          {application.queryHistory && application.queryHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <AlertTriangle className="size-4 text-amber-500" />
                    Query Communication History Log (
                    {application.queryHistory.length})
                  </CardTitle>
                  <CardDescription>
                    Chronological log of queries raised, specialist notes, and
                    customer responses.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {application.queryHistory.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">
                          Officer Query: "{item.queryText}"
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.respondedAt
                            ? new Date(item.respondedAt).toLocaleDateString(
                                "en-IN",
                              )
                            : "Pending"}
                        </span>
                      </div>

                      {item.clientReply && (
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 space-y-1.5">
                          <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block">
                            Customer Reply:
                          </span>
                          <p className="font-medium italic text-slate-900">
                            "{item.clientReply}"
                          </p>

                          {item.clientFiles && item.clientFiles.length > 0 && (
                            <div className="pt-1.5 border-t border-slate-100 space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 block">
                                Attached File(s):
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {item.clientFiles.map(
                                  (f: any, fIdx: number) => (
                                    <FieldValue key={fIdx} value={f} compact />
                                  ),
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 3: Submitted Verification Documents Vault */}
          <Card>
            <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>
                  Submitted Applicant Files ({Object.keys(application.uploadedDocs || {}).length})
                </CardTitle>
                <CardDescription>
                  Preview each file, then verify it or raise a clear correction request.
                </CardDescription>
              </div>
              <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                Review queue
              </span>
            </CardHeader>
            <CardContent className="p-5">
              {Object.keys(application.uploadedDocs || {}).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(application.uploadedDocs || {}).map(
                    ([docKey, docFile]: [string, any]) => {
                      const verifInfo = docVerifications[docKey];
                      const isVerified = verifInfo?.status === "VERIFIED";
                      const isDefective = verifInfo?.status === "DEFECTIVE";

                      return (
                        <div
                          key={docKey}
                          className={`p-4 rounded-xl border transition-all space-y-3 shadow-xs ${
                            isVerified
                              ? "bg-emerald-50/70 border-emerald-300"
                              : isDefective
                                ? "bg-rose-50/70 border-rose-300"
                                : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                              {docKey}
                            </span>

                            {isVerified && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                                <CheckCircle2
                                  size={11}
                                  className="text-emerald-600"
                                />{" "}
                                VERIFIED
                              </span>
                            )}
                            {isDefective && (
                              <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-rose-300">
                                <AlertTriangle
                                  size={11}
                                  className="text-rose-600"
                                />{" "}
                                DEFECTIVE
                              </span>
                            )}
                            {!isVerified && !isDefective && (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Clock size={11} /> PENDING AUDIT
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 truncate font-mono bg-white/70 p-1.5 rounded border border-slate-200/70">
                            {docFile.name}
                          </p>

                          <button
                            type="button"
                            onClick={() => setPreviewDocument({ docKey, file: docFile })}
                            className="group relative flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-950 text-left transition hover:border-indigo-400"
                            title={`Preview ${docFile.name}`}
                          >
                            {docFile.url && /\.(png|jpe?g|webp)$/i.test(docFile.name || "") ? (
                              <img
                                src={docFile.url}
                                alt={`Preview of ${docFile.name}`}
                                className="size-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center gap-2 text-slate-200">
                                <FileText className="size-7 text-indigo-300" />
                                <span className="text-[11px] font-bold">PDF / document preview</span>
                              </div>
                            )}
                            <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-950/55 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                              <Eye size={14} /> Preview file
                            </span>
                          </button>

                          {isDefective && verifInfo.reason && (
                            <p className="text-[11px] text-rose-900 font-semibold bg-rose-100/70 p-2 rounded-lg border border-rose-200/80">
                              Reason: "{verifInfo.reason}"
                            </p>
                          )}

                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
                            {docFile.url ? (
                              <button
                                type="button"
                                onClick={() => setPreviewDocument({ docKey, file: docFile })}
                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline shrink-0"
                              >
                                <Eye size={13} /> Preview
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">
                                No URL
                              </span>
                            )}

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              <Button
                                variant={isVerified ? "outline" : "primary"}
                                size="sm"
                                onClick={() => handleVerifyDoc(docKey)}
                                disabled={isVerified}
                                className={`text-xs font-black px-3 py-1.5 rounded-lg shadow-xs transition-all flex-1 sm:flex-none justify-center flex items-center gap-1 ${
                                  isVerified
                                    ? "bg-emerald-100 text-emerald-900 border-emerald-300 opacity-80 cursor-default"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer active:scale-95 shadow-sm"
                                }`}
                              >
                                <CheckCircle2 size={13} />{" "}
                                {isVerified ? "Verified" : "Verify Doc"}
                              </Button>

                              <Button
                                variant={isDefective ? "outline" : "primary"}
                                size="sm"
                                onClick={() => {
                                  setFlaggingDocKey(docKey);
                                  setSelectedReason(
                                    "Image blurred or unreadable scan",
                                  );
                                  setCustomReason("");
                                }}
                                disabled={isDefective}
                                className={`text-xs font-black px-3 py-1.5 rounded-lg shadow-xs transition-all flex-1 sm:flex-none justify-center flex items-center gap-1 ${
                                  isDefective
                                    ? "bg-rose-100 text-rose-900 border-rose-300 opacity-80 cursor-default"
                                    : "bg-rose-600 hover:bg-rose-700 text-white border-0 cursor-pointer active:scale-95 shadow-sm"
                                }`}
                              >
                                <AlertTriangle size={13} />{" "}
                                {isDefective
                                  ? "Flagged Defective"
                                  : "Flag Defective"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No applicant verification files uploaded for this case.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Specialist Roster & Customer Summary */}
        <div className="space-y-6">
          {/* Card 1: Specialist Roster Assignment */}
          <Card className="overflow-visible relative z-30">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle>Assigned Backoffice Specialist</CardTitle>
              <CardDescription>
                Assign or transfer case to a chartered accountant or legal desk
                specialist.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <Select
                value={assignedOfficer}
                onChange={(val) => handleAssignOfficer(val)}
                placeholder="-- Select Specialist from Database --"
                options={[
                  { label: "-- Select Specialist from Database --", value: "" },
                  {
                    label: "Unassigned (Clear Assignment)",
                    value: "Unassigned",
                  },
                  ...specialists.map((spec) => ({
                    label: `${spec.name} — ${spec.role}`,
                    value: `${spec.name} (${spec.role})`,
                  })),
                ]}
              />
              <p className="text-[11px] text-slate-400">
                Specialists receive case status notifications & client query
                updates in real time.
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Customer Contact Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle>Applicant Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="size-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-sm shrink-0">
                  {application.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {application.customerName}
                  </h4>
                  <p className="text-slate-400 text-[11px] font-mono">
                    {application.customerPhone}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Phone:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {application.customerPhone}
                  </span>
                </div>
                {application.address && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">State / Address:</span>
                    <span className="font-semibold text-slate-800">
                      {application.address}
                    </span>
                  </div>
                )}

                {submittedFormEntries.length > 0 && (
                    <div className="pt-3 border-t border-slate-150 space-y-2">
                      <span className="font-extrabold text-[10px] text-indigo-700 uppercase tracking-wider block">
                        Submitted Service Form Fields
                      </span>
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200/80 font-mono text-[11px]">
                        {submittedFormEntries.map(([k, v]) => (
                          <div
                            key={k}
                            className="flex justify-between items-center text-slate-700 gap-2"
                          >
                            <span className="font-medium text-slate-500 truncate">
                              {k}:
                            </span>
                            <div className="font-bold text-slate-900 text-right truncate max-w-56">
                              <FieldValue value={v} compact />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <a
                href={`https://wa.me/${application.customerPhone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-sm active:scale-95 transition-all text-xs cursor-pointer"
              >
                <MessageSquare size={15} className="text-white" /> Chat on
                WhatsApp
              </a>
            </CardContent>
          </Card>

          {/* Card 3: Fee Breakdown & Payment Summary */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle>Fee & Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Government Filing Fee:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{application.governmentFee || 0}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Professional Consultation Fee:</span>
                  <span className="font-semibold text-slate-800">
                    ₹{application.professionalFee || 0}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-black text-sm text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-indigo-700">
                    ₹{application.totalFee || 0}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 font-bold text-[11px]">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Payment Confirmed via Razorpay Portal</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">{previewDocument.docKey}</p>
                <h3 className="truncate text-sm font-extrabold text-slate-900">{previewDocument.file.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close document preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-80 flex-1 bg-slate-950 p-3">
              {previewDocument.file.url ? (
                /\.(png|jpe?g|webp)$/i.test(previewDocument.file.name || "") ? (
                  <img src={previewDocument.file.url} alt={previewDocument.file.name} className="size-full max-h-[65vh] object-contain" />
                ) : (
                  <iframe src={previewDocument.file.url} title={`Preview of ${previewDocument.file.name}`} className="h-[65vh] w-full rounded border-0 bg-white" />
                )
              ) : (
                <div className="flex h-80 flex-col items-center justify-center gap-2 text-slate-300">
                  <FileText className="size-8" />
                  <p className="text-xs font-semibold">This document does not have a preview URL.</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <span className="text-[11px] text-slate-500">Preview files carefully before approving.</span>
              {previewDocument.file.url && (
                <a href={previewDocument.file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline">
                  <ExternalLink size={14} /> Open full file
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flag Defective Reason Selector Modal */}
      {flaggingDocKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-rose-600 shrink-0" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Flag '{flaggingDocKey}' as Defective
                </h3>
              </div>
              <button
                onClick={() => setFlaggingDocKey(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                Select Defect / Rejection Reason:
              </label>
              {[
                "Image blurred or unreadable scan",
                "Name mismatch with applicant details",
                "Document incomplete (back side scan missing)",
                "Expired utility bill / lease agreement",
                "Invalid or missing signature",
                "Other",
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 text-xs font-medium text-slate-800 cursor-pointer p-2.5 rounded-lg border transition-all ${
                    selectedReason === reason
                      ? "bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 font-bold"
                      : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="defectReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {selectedReason === "Other" && (
                <Input
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Type specific defect reason for client..."
                  className="text-xs py-2 px-3 mt-2"
                />
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlaggingDocKey(null)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmFlagDefective}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Flag File & Pre-fill Query Alert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
