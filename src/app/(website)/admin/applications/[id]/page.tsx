"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
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
} from "lucide-react";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import FieldValue from "@/components/common/FieldValue";
import Select from "@/components/forms/Select";
import Textarea from "@/components/forms/Textarea";
import Input from "@/components/forms/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getApplicationBySlug, updateApplication, ApplicationCase } from "@/lib/applications";
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

  // Load application details & team specialists
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getApplicationBySlug(caseId);
        if (data) {
          setApplication(data);
          setAssignedOfficer(data.assignedExecutive || "");
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

  // Handle Status Update
  const handleUpdateStatus = async (newStatus: string) => {
    if (!application) return;
    setIsUpdatingStatus(newStatus);
    try {
      const res = await updateApplication(application.id, { status: newStatus as any });
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
      const res = await updateApplication(application.id, { assignedExecutive: execName });
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
      const res = await updateApplication(application.id, { query: queryText.trim() });
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
      notify.error("Please attach at least one certificate file or enter a title.");
      return;
    }

    setIsUploadingCert(true);
    try {
      let newCerts: any[] = [];

      if (certFiles.length > 0) {
        newCerts = certFiles.map((file, idx) => ({
          id: `CERT-${Date.now()}-${idx}`,
          name: certName.trim() ? `${certName.trim()} (${file.name})` : file.name,
          certificateName: certName.trim() ? `${certName.trim()} (${file.name})` : file.name,
          issuedDate: new Date().toISOString().split("T")[0],
          url: file.url || `/certificates/${application.id}_cert.pdf`,
          certificateUrl: file.url || `/certificates/${application.id}_cert.pdf`,
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

      const updatedCerts = [...(application.issuedCertificates || []), ...newCerts];
      const res = await updateApplication(application.id, {
        status: "APPROVED" as any,
        issuedCertificates: updatedCerts as any,
      });
      if (res.success && res.data) {
        setApplication(res.data);
        setCertName("");
        setCertFiles([]);
        notify.success(`Issued ${newCerts.length} official certificate(s) successfully!`);
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
        <p className="text-xs text-slate-500 font-semibold">Loading case workspace...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle className="size-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Application Case Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested filing tracking ID <span className="font-mono font-bold text-slate-800">#{caseId}</span> could not be found.
        </p>
        <Link href="/admin/applications">
          <Button variant="primary" size="sm">Back to Filing Queue</Button>
        </Link>
      </div>
    );
  }

  const steps = [
    { key: "PAYMENT_CONFIRMED", title: "Payment Verified", sub: "Fee received via Razorpay" },
    { key: "UNDER_REVIEW", title: "Under Verification", sub: "CA Audit & Document Check" },
    { key: "SUBMITTED", title: "Submitted to Ministry", sub: "Govt MCA/GST Filing Portal" },
    { key: "APPROVED", title: "Approved & Issued", sub: "Certificate Ready for Download" },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === application.status);
  const activeStepNumber = currentStepIdx >= 0 ? currentStepIdx + 1 : application.status === "APPROVED" ? 4 : 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Header & Breadcrumbs */}
      <div className="space-y-3 border-b border-slate-200/80 pb-5">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin/applications">
            <Button variant="outline" size="sm" className="text-xs font-bold gap-1.5 cursor-pointer">
              <ArrowLeft size={14} /> Back to Filing Queue
            </Button>
          </Link>

          <StatusBadge status={application.query ? "QUERY_RAISED" : application.status} size="md" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{application.serviceTitle}</h1>
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                #{application.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Customer: <strong className="text-slate-800">{application.customerName}</strong> &middot; Submitted on {formatDate(application.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://wa.me/${application.customerPhone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 flex items-center gap-1.5">
                <MessageSquare size={14} /> WhatsApp Applicant
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Visual Filing Stepper */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
            {steps.map((step, idx) => {
              const stepNo = idx + 1;
              const isCompleted = activeStepNumber > stepNo || application.status === "APPROVED";
              const isCurrent = activeStepNumber === stepNo && application.status !== "APPROVED";

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border transition-all ${
                    isCompleted
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                      : isCurrent
                      ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-900"
                      : "bg-slate-50/50 border-slate-200 text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isCompleted ? "✓" : stepNo}
                    </div>
                    <span className="text-xs font-bold leading-tight">{step.title}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium pl-8">{step.sub}</p>
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
              <CardDescription>Update filing lifecycle, manage customer queries, or issue certificates.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {application.query || application.queryResponse ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border space-y-3 ${application.queryStatus === "CLIENT_RESPONDED" ? "bg-teal-50/80 border-teal-200" : "bg-amber-50/80 border-amber-200"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`size-5 ${application.queryStatus === "CLIENT_RESPONDED" ? "text-teal-600" : "text-amber-600"}`} />
                        <div>
                          <h4 className={`font-bold text-xs ${application.queryStatus === "CLIENT_RESPONDED" ? "text-teal-950" : "text-amber-900"}`}>
                            {application.queryStatus === "CLIENT_RESPONDED"
                              ? "✅ Client Responded to Active Query"
                              : "⚠️ Active Query Alert Pending Customer Response"}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Query: "{application.query || application.queryNote}"
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={application.queryStatus || "QUERY_RAISED"} size="sm" />
                    </div>

                    {/* Render Client Written Response & Uploaded Files if Client Responded */}
                    {application.queryResponse && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <span>Applicant Written Clarification:</span>
                        </div>
                        <p className="text-slate-800 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                          "{application.queryResponse}"
                        </p>

                        {application.clientResponseFiles && application.clientResponseFiles.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 space-y-1.5">
                            <span className="font-bold text-[11px] text-slate-600 block">Re-uploaded Document(s):</span>
                            <div className="flex flex-wrap gap-2">
                              {application.clientResponseFiles.map((file: any, idx: number) => (
                                <FieldValue key={idx} value={file} compact />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearQuery}
                        className="text-xs font-bold bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                        leftIcon={<CheckCircle className="size-4 text-emerald-600" />}
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
                      variant={application.status === "UNDER_REVIEW" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                      disabled={isUpdatingStatus !== null}
                      className="rounded-lg justify-start font-bold text-xs py-2.5 cursor-pointer"
                      leftIcon={isUpdatingStatus === "UNDER_REVIEW" ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
                    >
                      1. In Review
                    </Button>

                    <Button
                      variant={application.status === "SUBMITTED" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus("SUBMITTED")}
                      disabled={isUpdatingStatus !== null}
                      className="rounded-lg justify-start font-bold text-xs py-2.5 cursor-pointer"
                      leftIcon={isUpdatingStatus === "SUBMITTED" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    >
                      2. Submit to Govt
                    </Button>

                    <Button
                      variant={application.status === "APPROVED" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus("APPROVED")}
                      disabled={isUpdatingStatus !== null}
                      className="rounded-lg justify-start font-bold text-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer"
                      leftIcon={isUpdatingStatus === "APPROVED" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
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
                    { label: "📄 Address proof blurred or unreadable", value: "Address proof blurred or unreadable. Please re-upload clear utility bill or registered lease agreement." },
                    { label: "🆔 PAN Card name mismatch", value: "PAN Card name does not match applicant full legal name. Please provide official name change proof or gazette copy." },
                    { label: "📑 Aadhaar Card front & back missing", value: "Aadhaar Card front and back side scans missing. Please upload complete document." },
                    { label: "🏬 FSSAI / Premises NOC Missing", value: "Premises No Objection Certificate (NOC) or electricity bill copy missing for business address verification." },
                    { label: "✍️ Signature Scan Invalid", value: "Specimen signature scan blurred or has colored background. Please upload clear black ink signature on white paper." },
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
              {application.status === "SUBMITTED" || application.status === "APPROVED" ? (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Issue Official Government Filing Certificate
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle size={10} /> Unlocked (Submitted to Ministry)
                    </span>
                  </div>

                  {application.issuedCertificates && application.issuedCertificates.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-emerald-800">Issued Certificates:</p>
                      {application.issuedCertificates.map((cert: any, i) => (
                        <div key={i} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Award className="size-4 text-emerald-600 shrink-0" />
                            <span className="font-bold text-emerald-900">{cert.certificateName || cert.name}</span>
                          </div>
                          <a href={cert.certificateUrl || cert.url} target="_blank" download className="text-emerald-700 hover:underline font-bold flex items-center gap-1">
                            <Download size={13} /> Download PDF
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 bg-slate-50/70 border border-slate-200/80 rounded-xl p-4">
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
                      disabled={isUploadingCert || (!certName.trim() && certFiles.length === 0)}
                      className="w-full sm:w-auto text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                      leftIcon={isUploadingCert ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />}
                    >
                      {isUploadingCert ? "Issuing Certificate(s)..." : `Attach & Issue ${certFiles.length > 1 ? `${certFiles.length} Certificates` : "Certificate"} to Customer`}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-slate-100 pt-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2.5">
                    <Clock size={16} className="text-slate-400 shrink-0" />
                    <span>
                      Official Certificate Issuance will unlock once filing stage is advanced to <strong>2. Submit to Govt (Submitted to Ministry)</strong>.
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
                <CardDescription>Dynamic form input fields provided by the applicant.</CardDescription>
              </div>
              {application.formData && Object.keys(application.formData).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => notify.success("Applicant form details approved by compliance officer.")}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                  leftIcon={<CheckCircle size={13} />}
                >
                  Approve Details
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-5">
              {application.formData && Object.keys(application.formData).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(application.formData).map(([k, v]) => (
                    <div key={k} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
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
                  Standard checkout details: Customer ({application.customerName}), Phone ({application.customerPhone}), Address ({application.address || "N/A"}).
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
                    Query Communication History Log ({application.queryHistory.length})
                  </CardTitle>
                  <CardDescription>Chronological log of queries raised, specialist notes, and customer responses.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-3">
                  {application.queryHistory.map((item, idx) => (
                    <div key={item.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">
                          Officer Query: "{item.queryText}"
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.respondedAt ? new Date(item.respondedAt).toLocaleDateString("en-IN") : "Pending"}
                        </span>
                      </div>

                      {item.clientReply && (
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800 space-y-1.5">
                          <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider block">Customer Reply:</span>
                          <p className="font-medium italic text-slate-900">"{item.clientReply}"</p>

                          {item.clientFiles && item.clientFiles.length > 0 && (
                            <div className="pt-1.5 border-t border-slate-100 space-y-1">
                              <span className="text-[10px] font-bold text-slate-500 block">Attached File(s):</span>
                              <div className="flex flex-wrap gap-2">
                                {item.clientFiles.map((f: any, fIdx: number) => (
                                  <FieldValue key={fIdx} value={f} compact />
                                ))}
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
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle>Submitted Applicant Files ({Object.keys(application.uploadedDocs || {}).length})</CardTitle>
              <CardDescription>Verification documents uploaded by applicant for auditing and approval.</CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {Object.keys(application.uploadedDocs || {}).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(application.uploadedDocs || {}).map(([docKey, docFile]: [string, any]) => (
                    <div key={docKey} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">{docKey}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={10} /> Uploaded
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate font-mono">{docFile.name}</p>
                      <div className="flex items-center justify-between pt-1">
                        {docFile.url && (
                          <a
                            href={docFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                          >
                            <ExternalLink size={13} /> View / Inspect File
                          </a>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => notify.success(`Approved '${docKey}' document.`)}
                          className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 py-1 px-2 h-auto"
                        >
                          Approve File
                        </Button>
                      </div>
                    </div>
                  ))}
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
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle>Assigned Backoffice Specialist</CardTitle>
              <CardDescription>Assign or transfer case to a chartered accountant or legal desk specialist.</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <Select
                value={assignedOfficer}
                onChange={(val) => handleAssignOfficer(val)}
                placeholder="-- Select Specialist from Database --"
                options={[
                  { label: "-- Select Specialist from Database --", value: "" },
                  { label: "Unassigned (Clear Assignment)", value: "Unassigned" },
                  ...specialists.map((spec) => ({
                    label: `${spec.name} — ${spec.role}`,
                    value: `${spec.name} (${spec.role})`,
                  })),
                ]}
              />
              <p className="text-[11px] text-slate-400">
                Specialists receive case status notifications & client query updates in real time.
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
                  <h4 className="font-extrabold text-sm text-slate-900">{application.customerName}</h4>
                  <p className="text-slate-400 text-[11px] font-mono">{application.customerPhone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-medium">Phone:</span>
                  <span className="font-mono font-bold text-slate-800">{application.customerPhone}</span>
                </div>
                {application.address && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-medium">State / Address:</span>
                    <span className="font-semibold text-slate-800">{application.address}</span>
                  </div>
                )}

                {application.formData && Object.keys(application.formData).length > 0 && (
                  <div className="pt-3 border-t border-slate-150 space-y-2">
                    <span className="font-extrabold text-[10px] text-indigo-700 uppercase tracking-wider block">
                      Submitted Service Form Fields
                    </span>
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono text-[11px]">
                      {Object.entries(application.formData).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center text-slate-700 gap-2">
                          <span className="font-medium text-slate-500 truncate">{k}:</span>
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
                className="w-full inline-flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors text-xs"
              >
                <MessageSquare size={15} /> Chat on WhatsApp
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
                  <span className="font-semibold text-slate-800">₹{application.governmentFee || 0}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Professional Consultation Fee:</span>
                  <span className="font-semibold text-slate-800">₹{application.professionalFee || 0}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-black text-sm text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-indigo-700">₹{application.totalFee || 0}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold text-[11px]">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Payment Confirmed via Razorpay Portal</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
