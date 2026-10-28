"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  Download,
  Award,
  MessageSquare,
  Phone,
  ExternalLink,
  X,
  Paperclip,
  Send,
  Eye,
  Check,
} from "lucide-react";
import Button from "@/components/common/Button";
import Input from "@/components/forms/Input";
import FieldValue from "@/components/common/FieldValue";
import { Card, CardContent } from "@/components/ui/card";
import {
  getApplicationBySlug,
  updateApplication,
  ApplicationCase,
  certificateDownloadName,
  resolveDocumentViewUrl,
} from "@/lib/applications";
import { MultiFileUpload, UploadedFile } from "@/components/upload";
import { notify } from "@/lib/notify";
import { formatDate } from "@/utils/formatters";
import { downloadFile } from "@/utils/download";
import {
  areApplicantFilesApproved,
  canAdvanceWorkflowStatus,
  getDocumentsVerificationSummary,
  getSubmittedFormEntries,
  getWorkflowBlockers,
  isFormDataApproved,
} from "@/lib/application-workflow";

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const documentsSectionRef = useRef<HTMLDivElement | null>(null);

  const [application, setApplication] = useState<ApplicationCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
  const [flaggingFieldKey, setFlaggingFieldKey] = useState<string | null>(null);
  const [fieldQueryInput, setFieldQueryInput] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [previewDocument, setPreviewDocument] = useState<{
    docKey: string;
    file: UploadedFile;
  } | null>(null);

  const submittedFormEntries = getSubmittedFormEntries(
    application?.formData || {},
  );

  // Load application details
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getApplicationBySlug(caseId);
        if (data) {
          setApplication(data);
          setDocVerifications(data.formData?._docVerification || {});
        }
      } catch (err) {
        console.error("Failed to load application detail:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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
      notify.success(`Document '${docKey}' verified successfully!`);
    } else {
      notify.error("Failed to verify document.");
    }
  };

  // Handle Field-level Query
  const handleSendFieldQuery = async (fieldKey: string) => {
    if (!application || !fieldQueryInput.trim()) {
      notify.error("Please enter a correction note for this field.");
      return;
    }

    const currentForm = (application.formData || {}) as Record<string, any>;
    const currentQueries = (currentForm._fieldQueries || {}) as Record<string, any>;
    const updatedQueries = {
      ...currentQueries,
      [fieldKey]: {
        message: fieldQueryInput.trim(),
        createdAt: new Date().toISOString(),
      },
    };

    const queryTextMsg = `Correction required on ${fieldKey.replace(/_/g, " ")}: ${fieldQueryInput.trim()}`;

    const res = await updateApplication(application.id, {
      query: queryTextMsg,
      formData: {
        ...currentForm,
        _fieldQueries: updatedQueries,
      },
    });

    if (res.success && res.data) {
      setApplication(res.data);
      setFlaggingFieldKey(null);
      setFieldQueryInput("");
      notify.success(`Query raised on '${fieldKey.replace(/_/g, " ")}' and sent to client.`);
    } else {
      notify.error("Failed to raise query on field.");
    }
  };

  const handleClearFieldQuery = async (fieldKey: string) => {
    if (!application) return;

    const currentForm = (application.formData || {}) as Record<string, any>;
    const currentQueries = { ...((currentForm._fieldQueries || {}) as Record<string, any>) };
    delete currentQueries[fieldKey];

    const hasRemainingQueries = Object.keys(currentQueries).length > 0;

    const res = await updateApplication(application.id, {
      query: hasRemainingQueries ? application.query : "",
      formData: {
        ...currentForm,
        _fieldQueries: currentQueries,
      },
    });

    if (res.success && res.data) {
      setApplication(res.data);
      notify.success(`Query on '${fieldKey.replace(/_/g, " ")}' cleared.`);
    } else {
      notify.error("Failed to clear query.");
    }
  };

  // Handle Flag Defective with Smart Query Auto-fill
  const handleConfirmFlagDefective = async () => {
    if (!application || !flaggingDocKey) return;
    const reasonText =
      selectedReason === "Other" ? customReason.trim() : selectedReason;
    if (!reasonText) {
      notify.error("Please select or enter a reason for flagging this document.");
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
      const autoQueryMsg = `Document verification issue identified on '${flaggingDocKey}': ${reasonText}. Please re-upload a clear and valid copy.`;
      setQueryText(autoQueryMsg);
      notify.warning(`'${flaggingDocKey}' flagged as defective  Message pre-filled below.`);
      setFlaggingDocKey(null);
      setSelectedReason("");
      setCustomReason("");
      messageInputRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      notify.error("Failed to flag document.");
    }
  };

  const workflowContext = application
    ? {
        currentStatus: application.status,
        formData: (application.formData || {}) as Record<string, unknown>,
        uploadedDocs: (application.uploadedDocs || {}) as Record<string, unknown>,
        docVerifications,
        hasActiveQuery: Boolean(application.query),
      }
    : null;

  const formApproved = workflowContext
    ? isFormDataApproved(workflowContext.formData)
    : false;
  const filesApproved = workflowContext
    ? areApplicantFilesApproved(
        workflowContext.uploadedDocs,
        workflowContext.docVerifications,
      )
    : false;
  const docSummary = workflowContext
    ? getDocumentsVerificationSummary(
        workflowContext.uploadedDocs,
        workflowContext.docVerifications,
      )
    : { total: 0, verified: 0, pending: 0, defective: 0, allVerified: true };

  const getStatusBlockers = (targetStatus: string) =>
    workflowContext
      ? getWorkflowBlockers({
          ...workflowContext,
          targetStatus,
        })
      : [];

  const canAdvanceTo = (targetStatus: string) =>
    workflowContext
      ? canAdvanceWorkflowStatus({
          ...workflowContext,
          targetStatus,
        })
      : false;

  // Handle Status Update
  const handleUpdateStatus = async (newStatus: string) => {
    if (!application) return;

    const blockers = getStatusBlockers(newStatus);
    if (blockers.length > 0) {
      notify.error(blockers[0]);
      return;
    }

    setIsUpdatingStatus(newStatus);
    try {
      const res = await updateApplication(application.id, {
        status: newStatus as any,
      });
      if (res.success && res.data) {
        setApplication(res.data);
        notify.success(`Filing stage updated to ${newStatus}.`);
      } else {
        notify.error(res.error || "Failed to update filing stage.");
      }
    } catch (err) {
      notify.error("Failed to update filing stage.");
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleApproveFormData = async () => {
    if (!application) return;

    const currentForm = (application.formData || {}) as Record<string, any>;
    const res = await updateApplication(application.id, {
      formData: {
        ...currentForm,
        _formDataApproved: true,
        _formDataApprovedAt: new Date().toISOString(),
      },
    });

    if (res.success && res.data) {
      setApplication(res.data);
      notify.success("Applicant form details approved by admin.");
    } else {
      notify.error("Failed to approve applicant form details.");
    }
  };

  // Raise Customer Query Alert with Smart Field Matching
  const handleRaiseQuery = async () => {
    if (!application || !queryText.trim()) {
      notify.error("Please enter a message for the client.");
      return;
    }
    try {
      const currentForm = (application.formData || {}) as Record<string, any>;
      const currentQueries = { ...((currentForm._fieldQueries || {}) as Record<string, any>) };
      const lowerMsg = queryText.toLowerCase();

      // Smart Field Matching
      const formKeys = Object.keys(currentForm).filter((k) => !k.startsWith("_"));
      let smartMatchedCount = 0;

      for (const key of formKeys) {
        const lowerKey = key.toLowerCase();
        const isPanMatch = lowerMsg.includes("pan") && lowerKey.includes("pan");
        const isAddressMatch = lowerMsg.includes("address") && lowerKey.includes("address");
        const isPhoneMatch =
          (lowerMsg.includes("phone") || lowerMsg.includes("mobile")) &&
          (lowerKey.includes("phone") || lowerKey.includes("mobile"));
        const isNameMatch =
          (lowerMsg.includes("trade") || lowerMsg.includes("name")) &&
          (lowerKey.includes("trade") || lowerKey.includes("name"));
        const isAadhaarMatch = lowerMsg.includes("aadhaar") && lowerKey.includes("aadhaar");
        const isEmailMatch = lowerMsg.includes("email") && lowerKey.includes("email");

        if (isPanMatch || isAddressMatch || isPhoneMatch || isNameMatch || isAadhaarMatch || isEmailMatch) {
          currentQueries[key] = {
            message: queryText.trim(),
            createdAt: new Date().toISOString(),
            autoTagged: true,
          };
          smartMatchedCount++;
        }
      }

      const res = await updateApplication(application.id, {
        query: queryText.trim(),
        formData: {
          ...currentForm,
          _fieldQueries: currentQueries,
        },
      });

      if (res.success && res.data) {
        setApplication(res.data);
        setQueryText("");
        if (smartMatchedCount > 0) {
          notify.success(`Message sent & smart-matched ${smartMatchedCount} field(s) for client correction.`);
        } else {
          notify.success("Message sent to customer workspace.");
        }
      } else {
        notify.error("Failed to send message.");
      }
    } catch (err) {
      notify.error("Failed to send message.");
    }
  };

  // Clear Query Alert
  const handleClearQuery = async () => {
    if (!application) return;
    try {
      const currentForm = (application.formData || {}) as Record<string, any>;
      const res = await updateApplication(application.id, {
        query: "",
        formData: {
          ...currentForm,
          _fieldQueries: {},
        },
      });
      if (res.success && res.data) {
        setApplication(res.data);
        setQueryText("");
        notify.success("Customer query and field flags marked as resolved.");
      } else {
        notify.error("Failed to clear query.");
      }
    } catch (err) {
      notify.error("Failed to clear query.");
    }
  };

  // Submit certificate(s)
  const handleIssueCertificate = async () => {
    if (!application) return;

    if (certFiles.length === 0 && !certName.trim()) {
      notify.error("Please attach at least one certificate file or enter a title.");
      return;
    }

    if (application.status !== "SUBMITTED" && application.status !== "APPROVED") {
      notify.error('Advance filing stage to "Submitted to Ministry" before issuing certificates.');
      return;
    }

    setIsUploadingCert(true);
    try {
      const filesToIssue =
        certFiles.length > 0
          ? certFiles
          : [
              {
                name: `${certName.trim()}.pdf`,
                url: "",
                size: "0",
                type: "application/pdf",
              },
            ];

      let successCount = 0;

      for (const file of filesToIssue) {
        if (!file.url) {
          notify.error("Certificate file must be uploaded before issuing.");
          continue;
        }

        const certificateName = certName.trim()
          ? certFiles.length > 1
            ? `${certName.trim()} (${file.name})`
            : certName.trim()
          : file.name;

        const res = await fetch("/api/admin/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId: application.id,
            certificateName,
            fileUrl: file.url,
            fileName: file.name,
            fileSize: String(file.size),
            fileType: file.type,
          }),
        });

        if (res.ok) {
          successCount++;
        } else {
          const data = await res.json().catch(() => ({}));
          notify.error(data.error || `Failed to issue ${file.name}.`);
        }
      }

      if (successCount > 0) {
        const refreshed = await getApplicationBySlug(application.id);
        if (refreshed) setApplication(refreshed);
        setCertName("");
        setCertFiles([]);
        notify.success(`Issued ${successCount} official certificate(s) to the customer.`);
      }
    } catch (err) {
      notify.error("Failed to issue certificates.");
    } finally {
      setIsUploadingCert(false);
    }
  };

  // Template Quick Click Helper
  const applyTemplate = (template: string) => {
    setQueryText(template);
    messageInputRef.current?.focus();
  };

  // Calculate Next Step Configuration
  const nextStepInfo = useMemo(() => {
    if (!application) return null;
    const status = application.status;

    if (
      status === "PAYMENT_CONFIRMED" ||
      status === "DOCUMENTS_PENDING" ||
      status === "PAYMENT_PENDING"
    ) {
      return {
        target: "UNDER_REVIEW",
        title: "Start verification",
        description: "Review applicant files and begin backoffice CA audit.",
        buttonLabel: "Start review",
        canAdvance: canAdvanceTo("UNDER_REVIEW"),
        blockers: getStatusBlockers("UNDER_REVIEW"),
      };
    }

    if (status === "UNDER_REVIEW") {
      return {
        target: "SUBMITTED",
        title: "Submit to government",
        description: `Send the verified application to the ${application.serviceTitle} portal.`,
        buttonLabel: "Submit to govt",
        canAdvance: canAdvanceTo("SUBMITTED"),
        blockers: getStatusBlockers("SUBMITTED"),
      };
    }

    if (status === "SUBMITTED") {
      return {
        target: "APPROVED",
        title: "Approve and issue certificate",
        description: "Ministry processing is complete. Release the official registration certificate to the client.",
        buttonLabel: "Approve & issue",
        canAdvance: canAdvanceTo("APPROVED"),
        blockers: getStatusBlockers("APPROVED"),
      };
    }

    return {
      target: null,
      title: "Filing completed",
      description: "All statutory requirements satisfied and certificate delivered.",
      buttonLabel: "Completed",
      canAdvance: false,
      blockers: [],
    };
  }, [application, workflowContext, docVerifications]);

  // Action Count Needed
  const itemsNeedingAction = useMemo(() => {
    if (!application) return 0;
    let count = 0;
    if (docSummary.total === 0 || !filesApproved) count++;
    if (!formApproved && submittedFormEntries.length > 0) count++;
    if (application.query) count++;
    return count;
  }, [docSummary, filesApproved, formApproved, submittedFormEntries, application?.query]);

  if (isLoading) {
    return (
      <div className="p-16 text-center space-y-3">
        <Loader2 className="size-8 text-emerald-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">
          Loading case workspace...
        </p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-16 text-center space-y-4">
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

  // Active step ranking for horizontal stepper
  const currentStepMap: Record<string, number> = {
    PAYMENT_PENDING: 1,
    PAYMENT_CONFIRMED: 1,
    DOCUMENTS_PENDING: 1,
    UNDER_REVIEW: 2,
    SUBMITTED: 3,
    APPROVED: 4,
  };
  const activeStepNo = currentStepMap[application.status] || 2;

  const stepperSteps = [
    {
      num: 1,
      title: "Payment verified",
      subtitle: `Razorpay · ${formatDate(application.createdAt)}`,
    },
    {
      num: 2,
      title: "Under verification",
      subtitle: "CA audit and document check",
    },
    {
      num: 3,
      title: "Submitted to ministry",
      subtitle: `Filed on the portal`,
    },
    {
      num: 4,
      title: "Approved and issued",
      subtitle: "Certificate ready to download",
    },
  ];

  const applicantDocsList = Object.entries(application.uploadedDocs || {}).filter(
    ([k]) => !k.startsWith("_"),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16 font-sans">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to filing queue
        </Link>
      </div>

      {/* Case Header Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="size-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText size={26} className="text-emerald-700" />
          </div>
          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {application.serviceTitle}
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <span className="font-bold text-slate-800">{application.customerName}</span>
              <span>&middot;</span>
              <span>Submitted {formatDate(application.createdAt)}</span>
              <span>&middot;</span>
              <span className="font-mono text-slate-500 font-semibold">
                #{application.id}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0 self-start md:self-center">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full px-3.5 py-1 text-xs font-bold shadow-2xs">
            <Check size={14} className="stroke-[2.5]" /> Payment confirmed
          </span>
        </div>
      </div>

      {/* Horizontal Step Progress Bar */}
      <Card>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stepperSteps.map((step) => {
              const isDone =
                activeStepNo > step.num || application.status === "APPROVED";
              const isInProgress =
                activeStepNo === step.num && application.status !== "APPROVED";

              return (
                <div key={step.num} className="space-y-1.5">
                  <div
                    className={`h-1 w-full rounded-full mb-3 ${
                      isDone
                        ? "bg-emerald-600"
                        : isInProgress
                          ? "bg-blue-600"
                          : "bg-slate-200"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-wider block ${
                      isDone
                        ? "text-emerald-800"
                        : isInProgress
                          ? "text-blue-700"
                          : "text-slate-400"
                    }`}
                  >
                    {step.num} &middot;{" "}
                    {isDone ? "DONE" : isInProgress ? "IN PROGRESS" : "UP NEXT"}
                  </span>
                  <p className="font-bold text-sm text-slate-900 leading-tight">
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 leading-normal">
                    {step.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: 2-Column Desktop View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Approx 66% width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: NEXT STEP */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  NEXT STEP
                </span>
                {itemsNeedingAction > 0 ? (
                  <span className="bg-amber-100/90 text-amber-900 border border-amber-200 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-700" />
                    <span>
                      {itemsNeedingAction} item
                      {itemsNeedingAction > 1 ? "s" : ""} needs action
                    </span>
                  </span>
                ) : (
                  <span className="bg-emerald-100/90 text-emerald-900 border border-emerald-200 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    <span>Ready to advance</span>
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {nextStepInfo?.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {nextStepInfo?.description}
                </p>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2.5">
                {/* 1. Payment Received */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Check size={14} className="stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">Payment received</p>
                      <p className="text-[11px] text-slate-500">
                        ₹{(application.totalFee || 0).toLocaleString("en-IN")} paid via Razorpay
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 shrink-0">
                    Done
                  </span>
                </div>

                {/* 2. Customer Queries Resolved */}
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    application.query
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-slate-200/80 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center shrink-0 ${
                        application.query
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {application.query ? (
                        <AlertTriangle size={13} />
                      ) : (
                        <Check size={14} className="stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">
                        Customer queries resolved
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {application.query
                          ? `Active query: "${application.query}"`
                          : "No open queries"}
                      </p>
                    </div>
                  </div>
                  {application.query ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearQuery}
                      className="border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs py-1 px-3 h-8 rounded-lg shrink-0 cursor-pointer"
                    >
                      Resolve query
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 shrink-0">
                      Done
                    </span>
                  )}
                </div>

                {/* 3. Documents Uploaded and Verified */}
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    docSummary.total === 0 || !filesApproved
                      ? "border-amber-200 bg-amber-50/60"
                      : "border-slate-200/80 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center shrink-0 ${
                        docSummary.total === 0 || !filesApproved
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {docSummary.total === 0 || !filesApproved ? (
                        <span className="font-black text-xs">!</span>
                      ) : (
                        <Check size={14} className="stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">
                        Documents uploaded and verified
                      </p>
                      <p className="text-[11px] text-amber-800 font-medium">
                        {docSummary.total === 0
                          ? "The customer has not uploaded any files yet"
                          : filesApproved
                            ? `All ${docSummary.total} documents verified`
                            : `${docSummary.verified}/${docSummary.total} verified (${docSummary.defective > 0 ? `${docSummary.defective} defective` : `${docSummary.pending} pending`})`}
                      </p>
                    </div>
                  </div>

                  {docSummary.total === 0 ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        applyTemplate(
                          "Please upload the required verification documents in your workspace so we can proceed with your application.",
                        );
                      }}
                      className="border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs py-1 px-3 h-8 rounded-lg shrink-0 cursor-pointer bg-white"
                    >
                      Request documents
                    </Button>
                  ) : !filesApproved ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        documentsSectionRef.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                      className="border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs py-1 px-3 h-8 rounded-lg shrink-0 cursor-pointer bg-white"
                    >
                      Review documents
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 shrink-0">
                      Done
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button & Explanatory Text */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                {nextStepInfo?.target ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleUpdateStatus(nextStepInfo.target!)}
                    disabled={
                      isUpdatingStatus !== null || !nextStepInfo.canAdvance
                    }
                    title={nextStepInfo.blockers[0]}
                    className={`font-bold text-xs py-2.5 px-6 rounded-lg shrink-0 cursor-pointer ${
                      nextStepInfo.canAdvance
                        ? "bg-[#008069] hover:bg-[#00705c] text-white"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed border-0 opacity-80"
                    }`}
                  >
                    {isUpdatingStatus ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" /> Updating...
                      </span>
                    ) : (
                      nextStepInfo.buttonLabel
                    )}
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg">
                    ✔ Application Completed
                  </span>
                )}
                <span className="text-xs text-slate-500 leading-relaxed">
                  Unlocks after documents are verified. The certificate is issued
                  once the ministry approves.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Message the Customer */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Message the customer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ask for a document or a correction. The customer sees it in their
                  workspace.
                </p>
              </div>

              {/* Quick Templates */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="text-slate-500 font-medium">Quick templates</span>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      "Please upload the required verification documents in your workspace so we can proceed with your application.",
                    )
                  }
                  className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-semibold cursor-pointer transition-colors"
                >
                  Request documents
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      "Some submitted details require correction. Please review your form information and update accordingly.",
                    )
                  }
                  className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-semibold cursor-pointer transition-colors"
                >
                  Correct details
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyTemplate(
                      "We need additional clarification regarding your filing before we can submit it to the government portal.",
                    )
                  }
                  className="px-3 py-1 rounded-full border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 font-semibold cursor-pointer transition-colors"
                >
                  Need clarification
                </button>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Your message
                </label>
                <textarea
                  ref={messageInputRef}
                  rows={4}
                  maxLength={1000}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Write a message for the customer..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 bg-white leading-relaxed resize-y"
                />
                <div className="flex justify-end text-[11px] text-slate-400 font-mono">
                  {queryText.length} / 1000
                </div>
              </div>

              {/* Send Button */}
              <div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleRaiseQuery}
                  className="bg-[#008069] hover:bg-[#00705c] text-white font-bold text-xs py-2.5 px-5 rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send size={14} /> Send to customer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 1. Application Details (Full Width Row) */}
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Application details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applicant profile, contact info, and submitted statutory registration inputs.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {submittedFormEntries.length > 0 && !formApproved && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApproveFormData}
                      className="text-xs font-bold text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center gap-1.5 h-8 px-3 rounded-lg"
                    >
                      <CheckCircle size={13} className="text-emerald-700" />
                      <span>Approve Details</span>
                    </Button>
                  )}
                  {formApproved && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <Check size={13} className="text-emerald-700 stroke-[2.5]" />
                      <span>Approved</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                    Customer Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {application.customerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                    Contact Phone
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                    {application.customerPhone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold uppercase tracking-wider">
                    Registered Address
                  </span>
                  <span className="font-medium text-slate-800 text-xs mt-0.5 block">
                    {application.address || "Not provided"}
                  </span>
                </div>
              </div>

              {/* Submitted Dynamic Form Data & Uploaded Documents */}
              {submittedFormEntries.length > 0 && (
                <div className="pt-2 space-y-3">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Submitted Registration Form Fields ({submittedFormEntries.length}):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {submittedFormEntries.map(([k, v]) => {
                      const fieldQueries = ((application.formData as any)?._fieldQueries || {}) as Record<string, { message: string }>;
                      const currentFieldQuery = fieldQueries[k];
                      const isFlaggingThisField = flaggingFieldKey === k;

                      return (
                        <div
                          key={k}
                          className={`p-3.5 rounded-xl border bg-white space-y-2 text-xs shadow-2xs transition-all ${
                            currentFieldQuery
                              ? "border-amber-300 ring-2 ring-amber-300/30 bg-amber-50/20"
                              : "border-slate-200/80"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-bold capitalize block text-[11px]">
                              {k.replace(/_/g, " ")}
                            </span>
                            {currentFieldQuery ? (
                              <button
                                type="button"
                                onClick={() => handleClearFieldQuery(k)}
                                className="text-[10px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-full cursor-pointer flex items-center gap-1 transition-colors"
                                title="Click to clear query"
                              >
                                <span>Query Raised</span>
                                <span className="font-mono text-slate-500">✕</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setFlaggingFieldKey(k);
                                  setFieldQueryInput("");
                                }}
                                className="text-[10px] font-semibold text-slate-500 hover:text-amber-800 hover:bg-amber-50 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                              >
                                Flag Query
                              </button>
                            )}
                          </div>

                          <div className="font-medium text-slate-900 break-words">
                            <FieldValue value={v} compact />
                          </div>

                          {currentFieldQuery && (
                            <div className="text-[11px] p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                              <span className="font-bold text-[10px] uppercase tracking-wider block text-amber-800">Note to Client:</span>
                              {currentFieldQuery.message}
                            </div>
                          )}

                          {isFlaggingThisField && (
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 pt-2 animate-fade-in">
                              <span className="text-[11px] font-bold text-slate-700 block">
                                Request correction for {k.replace(/_/g, " ")}:
                              </span>
                              <input
                                type="text"
                                value={fieldQueryInput}
                                onChange={(e) => setFieldQueryInput(e.target.value)}
                                placeholder="e.g. Value does not match PAN / invalid format"
                                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-700"
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setFlaggingFieldKey(null)}
                                  className="h-7 text-[11px] px-2.5"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleSendFieldQuery(k)}
                                  className="h-7 text-[11px] px-2.5 bg-[#008069] text-white"
                                >
                                  Send Query
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Applicant Documents (Full Width Row, Below Details) */}
          <Card ref={documentsSectionRef}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Applicant documents
                  </h3>
                  <p className="text-xs text-slate-500">
                    Uploaded verification files, identification scans, and premises documents.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  {applicantDocsList.length} files
                </span>
              </div>

              {applicantDocsList.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center space-y-2.5">
                  <Paperclip size={28} className="text-slate-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">
                    No documents uploaded for this case yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      applyTemplate(
                        "Please upload your required verification documents (PAN Card, Address Proof, Photographs) in the portal.",
                      );
                    }}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer block mx-auto"
                  >
                    Ask the customer to upload
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {applicantDocsList.map(([docKey, fileData]) => {
                    const file = fileData as UploadedFile;
                    const verification = docVerifications[docKey];
                    const isVerified = verification?.status === "VERIFIED";
                    const isDefective = verification?.status === "DEFECTIVE";

                    return (
                      <div
                        key={docKey}
                        className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-2.5 text-xs shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 capitalize truncate">
                            {docKey.replace(/_/g, " ")}
                          </span>
                          {isVerified ? (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              VERIFIED
                            </span>
                          ) : isDefective ? (
                            <span className="text-[10px] font-extrabold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                              DEFECTIVE
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                              PENDING
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg">
                          <span className="truncate max-w-[200px] font-mono">
                            {file?.name || "Uploaded file"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPreviewDocument({ docKey, file })}
                            className="text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                          >
                            <Eye size={12} /> Inspect file
                          </button>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyDoc(docKey)}
                            disabled={isVerified}
                            className={`h-8 text-xs font-bold px-3 flex-1 rounded-lg ${
                              isVerified
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 cursor-default"
                                : "text-emerald-700 border-slate-300 hover:bg-emerald-50 cursor-pointer"
                            }`}
                          >
                            {isVerified ? "Verified" : "Verify"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFlaggingDocKey(docKey)}
                            disabled={isDefective}
                            className={`h-8 text-xs font-bold px-3 flex-1 rounded-lg ${
                              isDefective
                                ? "bg-rose-50 text-rose-800 border-rose-200 cursor-default"
                                : "text-rose-700 border-slate-300 hover:bg-rose-50 cursor-pointer"
                            }`}
                          >
                            {isDefective ? "Defective" : "Flag"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Approx 33% width) */}
        <div className="space-y-6">
          {/* Card 1: Applicant */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Applicant</h3>

              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base shrink-0">
                  {application.customerName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 truncate">
                    {application.customerName}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    {application.customerPhone}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <a
                  href={`https://wa.me/${application.customerPhone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button
                    fullWidth
                    className="bg-[#008069] hover:bg-[#00705c] text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <MessageSquare size={15} /> WhatsApp
                  </Button>
                </a>
                <a href={`tel:${application.customerPhone}`} className="block w-full">
                  <Button
                    fullWidth
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone size={15} /> Call
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Payment */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Payment</h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Government filing fee</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{(application.governmentFee || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Professional consultation fee</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{(application.professionalFee || application.totalFee || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-600">Total paid</span>
                <span className="text-2xl font-black text-emerald-800 font-mono">
                  ₹{(application.totalFee || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-lg py-2.5 px-3 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>Confirmed via Razorpay</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Certificate Issuance & Deliverables (Visible when Submitted or Approved) */}
          {(application.status === "SUBMITTED" ||
            application.status === "APPROVED" ||
            (application.issuedCertificates &&
              application.issuedCertificates.length > 0)) && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Award size={16} className="text-emerald-700" />
                    Official Certificates
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                {application.issuedCertificates &&
                  application.issuedCertificates.length > 0 && (
                    <div className="space-y-2">
                      {application.issuedCertificates.map((cert: any, i) => (
                        <div
                          key={i}
                          className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-emerald-950 truncate">
                              {cert.certificateName || cert.name}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              downloadFile(
                                cert.certificateUrl || cert.url,
                                certificateDownloadName(
                                  application.serviceTitle,
                                  cert.certificateName ||
                                    cert.name ||
                                    "Official_Certificate",
                                ),
                              )
                            }
                            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Download size={13} /> PDF
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                <div className="space-y-3 pt-1 border-t border-slate-100">
                  <Input
                    type="text"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    placeholder="Certificate Title (e.g. GST Certificate - Form REG-06)"
                    className="text-xs py-2 px-3 bg-white"
                  />

                  <MultiFileUpload
                    label="Attach Certificate (PDF / Image)"
                    value={certFiles}
                    onChange={setCertFiles}
                    allowedTypes={["pdf", "png", "jpg", "jpeg"]}
                    maxFiles={5}
                    maxSizeMb={10}
                    convertToPdf
                  />

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={handleIssueCertificate}
                    disabled={
                      isUploadingCert ||
                      (!certName.trim() && certFiles.length === 0)
                    }
                    className="bg-[#008069] hover:bg-[#00705c] text-white font-bold text-xs py-2 rounded-lg cursor-pointer"
                  >
                    {isUploadingCert ? (
                      <span className="flex items-center gap-1.5 justify-center">
                        <Loader2 size={13} className="animate-spin" /> Issuing...
                      </span>
                    ) : (
                      "Issue Certificate to Client"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Document Inline Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-slate-700 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-bold text-primary capitalize">
                  {previewDocument.docKey.replace(/_/g, " ")}
                </p>
                <h3 className="truncate text-base font-extrabold text-slate-900">
                  {previewDocument.file.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                aria-label="Close document preview"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-80 flex-1 bg-slate-950 p-3">
              {previewDocument.file.url ? (
                /\.(png|jpe?g|webp)$/i.test(previewDocument.file.name || "") ? (
                  <img
                    src={resolveDocumentViewUrl(previewDocument.file.url)}
                    alt={previewDocument.file.name}
                    className="size-full max-h-[65vh] object-contain"
                  />
                ) : (
                  <object
                    data={resolveDocumentViewUrl(previewDocument.file.url)}
                    type="application/pdf"
                    className="h-[65vh] w-full rounded"
                  >
                    <iframe
                      src={resolveDocumentViewUrl(previewDocument.file.url)}
                      title={`Preview of ${previewDocument.file.name}`}
                      className="h-[65vh] w-full rounded border-0 bg-white"
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-slate-300">
                        <FileText className="size-8 text-primary" />
                        <p className="text-xs font-semibold">
                          Inline preview not supported by your browser.
                        </p>
                        <a
                          href={resolveDocumentViewUrl(previewDocument.file.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-primary underline"
                        >
                          Open document in new tab
                        </a>
                      </div>
                    </iframe>
                  </object>
                )
              ) : (
                <div className="flex h-80 flex-col items-center justify-center gap-2 text-slate-300">
                  <FileText className="size-8" />
                  <p className="text-xs font-semibold">
                    This document does not have a preview URL.
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <span className="text-[11px] text-slate-500">
                Preview files carefully before approving.
              </span>
              {previewDocument.file.url && (
                <a
                  href={resolveDocumentViewUrl(previewDocument.file.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
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
                className="p-1 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
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
                    className="accent-primary focus:ring-primary"
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
                className="text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmFlagDefective}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                Flag File & Pre-fill Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
