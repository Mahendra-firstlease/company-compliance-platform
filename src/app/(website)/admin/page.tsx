"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  Loader2,
  FileCheck2,
  Upload,
  FileText,
  Download,
  Award,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/ui/Badge/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getApplications, updateApplication, ApplicationCase } from "@/lib/applications";
import { processSingleFileUpload } from "@/components/upload/upload-utils";
import { notify } from "@/lib/notify";
import SearchBar from "@/components/common/SearchBar";
import { useModal } from "@/components/ui/overlay";
import Drawer from "@/components/ui/overlay/drawer/Drawer";
import apiFetch from "@/lib/apiClient";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Select from "@/components/forms/Select";
import Textarea from "@/components/forms/Textarea";
import StatusBadge from "@/components/common/StatusBadge";
import {
  canAdvanceWorkflowStatus,
  DocVerificationMap,
  getWorkflowBlockers,
} from "@/lib/application-workflow";
import { useClientPagination } from "@/hooks/useClientPagination";
import TablePagination from "@/components/ui/TablePagination";
import TablePaginationToolbar from "@/components/ui/TablePaginationToolbar";

export default function AdminDashboardPage() {
  const router = useRouter();
  const modal = useModal();
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states for application processing
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [queryText, setQueryText] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isUploadingCert, setIsUploadingCert] = useState(false);

  // Auto-poll applications from MySQL to get live real-time paid filings
  const [specialists, setSpecialists] = useState<{ id: string; name: string; role: string }[]>([]);

  useEffect(() => {
    let active = true;

    // Fetch dynamic team members from MySQL database
    apiFetch<{ id: string; name: string; role: string }[]>("/admin/team")
      .then((data) => {
        if (active && Array.isArray(data)) {
          setSpecialists(data);
        }
      })
      .catch((err) => console.warn("Error fetching team specialists:", err));

    const loadCases = async () => {
      try {
        const list = await getApplications();
        if (active && Array.isArray(list) && list.length > 0) {
          setCases(list);
        }
      } catch (err) {
        console.warn("Admin auto-poll error (retaining current view):", err);
      }
    };

    loadCases();

    const interval = setInterval(loadCases, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  // Sync assigned officer & query text when selecting a case
  useEffect(() => {
    if (selectedCase) {
      setAssignedOfficer(selectedCase.assignedExecutive || "");
      setQueryText(selectedCase.query || "");
    }
  }, [selectedCase]);

  // Filter cases based on status tabs & search bar
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerPhone.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === "ALL") return matchesSearch;
      if (statusFilter === "NEW_PAID") return matchesSearch && c.status === "PAYMENT_CONFIRMED";
      if (statusFilter === "UNDER_REVIEW") return matchesSearch && c.status === "UNDER_REVIEW";
      if (statusFilter === "SUBMITTED") return matchesSearch && c.status === "SUBMITTED";
      if (statusFilter === "APPROVED") return matchesSearch && c.status === "APPROVED";
      if (statusFilter === "QUERY_RAISED") return matchesSearch && Boolean(c.query);

      return matchesSearch;
    });
  }, [cases, statusFilter, searchTerm]);

  const {
    pageItems: paginatedCases,
    pageIndex,
    pageSize,
    totalItems,
    totalPages,
    entryStart,
    entryEnd,
    pageSizeOptions,
    setPageIndex,
    setPageSize,
  } = useClientPagination(filteredCases, {
    initialPageSize: 10,
    resetDeps: [statusFilter, searchTerm],
  });

  // Open Manage Case Dedicated Detail Workspace
  const handleOpenManageCase = (caseId: string) => {
    router.push(`/admin/applications/${caseId}`);
  };

  // Handler functions
  const handleAssignOfficer = async (officer: string) => {
    if (!selectedCaseId) return;
    await updateApplication(selectedCaseId, { assignedExecutive: officer });
    const list = await getApplications();
    setCases(list);
    setAssignedOfficer(officer);
    notify.success(officer ? `Assigned to ${officer.split(",")[0]}` : "Officer assignment cleared.");
  };

  const handleRaiseQuery = async () => {
    if (!selectedCaseId || !queryText.trim()) return;
    await updateApplication(selectedCaseId, { query: queryText });
    const list = await getApplications();
    setCases(list);
    notify.warning(`Clarification query alert submitted to customer workspace.`);
  };

  const handleClearQuery = async () => {
    if (!selectedCaseId) return;
    await updateApplication(selectedCaseId, { query: "" });
    const list = await getApplications();
    setCases(list);
    setQueryText("");
    notify.success("Active query warning cleared.");
  };

  const handleUpdateStatus = async (newStatus: "PAYMENT_CONFIRMED" | "UNDER_REVIEW" | "SUBMITTED" | "APPROVED") => {
    if (!selectedCase) return;

    const formData = (selectedCase.formData || {}) as Record<string, unknown>;
    const blockers = getWorkflowBlockers({
      currentStatus: selectedCase.status,
      targetStatus: newStatus,
      formData,
      uploadedDocs: selectedCase.uploadedDocs || {},
      docVerifications:
        (formData._docVerification as DocVerificationMap) || {},
      hasActiveQuery: Boolean(selectedCase.query),
    });

    if (blockers.length > 0) {
      notify.error(blockers[0]);
      return;
    }

    setIsUpdatingStatus(newStatus);

    try {
      const result = await updateApplication(selectedCase.id, { status: newStatus });
      if (!result.success) {
        notify.error(result.error || "Could not update status.");
        return;
      }
      const list = await getApplications();
      setCases(list);
      notify.success(`Filing stage updated to ${newStatus.replace("_", " ")}`);
    } catch (err) {
      console.error(err);
      notify.error({ title: "Update Failed", description: "Could not update status." });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  // Upload Official Certificate Handler & Modal
  const handleUploadCertificateModal = (targetApp: ApplicationCase) => {
    let certTitle = `Official ${targetApp.serviceTitle} Registration Certificate`;
    let selectedFile: File | null = null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      selectedFile = e.target.files?.[0] ?? null;
    };

    const submitCertificate = async () => {
      if (!selectedFile) {
        notify.error("Please select a certificate file to upload.");
        return;
      }

      setIsUploadingCert(true);
      try {
        const uploaded = await processSingleFileUpload(
          selectedFile,
          certTitle,
          ["pdf", "png", "jpg", "jpeg"],
          5,
          targetApp.id,
          true,
        );

        const res = await fetch("/api/admin/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId: targetApp.id,
            certificateName: certTitle,
            fileUrl: uploaded.url,
            fileName: uploaded.name,
            fileSize: uploaded.size,
            fileType: uploaded.type,
          }),
        });

        if (res.ok) {
          notify.success("Official certificate uploaded and application approved.");
          const list = await getApplications();
          setCases(list);
          modal.closeAll();
        } else {
          const data = await res.json().catch(() => ({}));
          notify.error(data.error || "Failed to upload certificate.");
        }
      } catch (err) {
        console.error(err);
        notify.error(err instanceof Error ? err.message : "Error uploading certificate.");
      } finally {
        setIsUploadingCert(false);
      }
    };

    modal.open({
      title: `Upload Official Certificate & License`,
      description: `For case Ref ID: ${targetApp.id} (${targetApp.customerName})`,
      size: "md",
      content: (
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Certificate Name / Title</label>
            <input
              type="text"
              defaultValue={certTitle}
              onChange={(e) => (certTitle = e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Select Official Certificate Document (PDF/PNG/JPG — images auto-convert to PDF)</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-lg p-6 text-center space-y-2 bg-slate-50 transition-colors">
              <Upload className="size-8 text-indigo-500 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Click to browse or drop government certificate</p>
              <p className="text-[10px] text-slate-400">PDF, PNG or JPEG files (Max 5MB)</p>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer pt-2"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => modal.closeAll()} className="text-xs font-bold">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={submitCertificate}
              disabled={isUploadingCert}
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-0 flex items-center gap-1.5"
            >
              {isUploadingCert ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />}
              <span>Upload & Issue Certificate</span>
            </Button>
          </div>
        </div>
      ),
    });
  };

  // Inspect customer uploaded file modal
  const handleInspectDocument = (docName: string, docFile: any) => {
    modal.open({
      title: `Inspect Document: ${docName}`,
      description: `Uploaded file: ${docFile.name} (${docFile.size})`,
      size: "lg",
      content: (
        <div className="space-y-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-800">{docName}</p>
              <p className="text-slate-400">{docFile.name} &middot; {docFile.size}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Verified Format
            </span>
          </div>

          {docFile.url ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center min-h-64">
              {docFile.type?.toUpperCase() === "PDF" ? (
                <iframe src={docFile.url} className="w-full h-96 border-0" title={docFile.name} />
              ) : (
                <img src={docFile.url} className="h-96 w-full aspect-video object-contain p-2" alt={docFile.name} />
              )}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-2">
              <FileCheck2 className="size-10 text-primary mx-auto" />
              <p className="text-xs font-bold text-slate-800">Document Ready for Review</p>
              <p className="text-xs text-slate-400">File magic bytes verified in client application workspace.</p>
            </div>
          )}
        </div>
      ),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Backoffice Legal Operations Console
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Statutory Filings Queue & Case Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time live MySQL application stream. Assign executives, audit uploaded documents, raise queries, and upload certificates.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>5s Live Sync Active</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/90 rounded-lg p-4 space-y-1 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid Cases</span>
            <span className="p-1.5 rounded-md bg-slate-100 text-slate-600">
              <ClipboardList size={14} />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{cases.length}</p>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-50/40 border border-indigo-100 rounded-lg p-4 space-y-1 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Under Review</span>
            <span className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
              <Clock size={14} />
            </span>
          </div>
          <p className="text-2xl font-black text-indigo-600">
            {cases.filter((c) => c.status === "UNDER_REVIEW").length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-amber-50/40 border border-amber-100 rounded-lg p-4 space-y-1 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Active Queries</span>
            <span className="p-1.5 rounded-md bg-amber-100 text-amber-600">
              <AlertTriangle size={14} />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600">
            {cases.filter((c) => Boolean(c.query)).length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-emerald-50/40 border border-emerald-100 rounded-lg p-4 space-y-1 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Approved & Certs</span>
            <span className="p-1.5 rounded-md bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={14} />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {cases.filter((c) => c.status === "APPROVED").length}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls using Reusable SearchBar */}
      <div className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-80">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by customer, phone, or Ref ID..."
              size="sm"
              fullWidth={true}
            />
          </div>

          <TablePaginationToolbar
            pageSize={pageSize}
            pageIndex={pageIndex}
            totalPages={totalPages}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={setPageSize}
            onPageChange={setPageIndex}
            className="sm:ml-auto"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg w-full overflow-x-auto max-w-full scrollbar-none">
          {[
            { label: "All Cases", value: "ALL" },
            { label: "New Paid", value: "NEW_PAID" },
            { label: "Under Review", value: "UNDER_REVIEW" },
            { label: "Govt Submitted", value: "SUBMITTED" },
            { label: "Approved", value: "APPROVED" },
            { label: "Queries Raised", value: "QUERY_RAISED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === tab.value
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Datatable Queue View (sm+) */}
      <div className="hidden sm:block bg-white border border-slate-200 rounded-lg overflow-x-auto max-w-full shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref ID</TableHead>
              <TableHead>Service Title</TableHead>
              <TableHead>Customer Details</TableHead>
              <TableHead>Assigned Executive</TableHead>
              <TableHead>Filing Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCases.map((row) => (
              <TableRow
                key={row.id}
                onClick={() => handleOpenManageCase(row.id)}
                className="cursor-pointer hover:bg-slate-50/80 transition-colors"
              >
                <TableCell className="font-mono text-xs font-bold text-slate-700 bg-slate-50">
                  {row.id}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-bold text-slate-900">{row.serviceTitle}</p>
                    <span className="text-[11px] text-slate-400">/{row.serviceSlug}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-bold text-slate-800">{row.customerName}</p>
                    <p className="text-[11px] text-slate-400">{row.customerPhone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-slate-600">
                    {row.assignedExecutive || "Unassigned"}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.query ? "QUERY_RAISED" : row.status} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/applications/${row.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
                    >
                      View Case Details <ArrowRight size={13} />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredCases.length > 0 && (
          <TablePagination
            entryStart={entryStart}
            entryEnd={entryEnd}
            totalItems={totalItems}
          />
        )}
      </div>

      {/* Mobile Stacked Card View (< sm) */}
      <div className="sm:hidden space-y-3 bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="space-y-3 p-3">
        {paginatedCases.map((row) => (
          <div
            key={row.id}
            onClick={() => handleOpenManageCase(row.id)}
            className="bg-white border border-slate-200/90 rounded-lg p-4 space-y-3 shadow-2xs hover:shadow-xs transition-all active:bg-slate-50 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <span className="font-mono text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {row.id}
              </span>
              <StatusBadge status={row.query ? "QUERY_RAISED" : row.status} size="sm" />
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{row.serviceTitle}</h4>
              <p className="text-xs font-semibold text-slate-700 mt-1">{row.customerName}</p>
              <p className="text-[11px] text-slate-400">{row.customerPhone}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                Officer: <strong className="text-slate-800">{row.assignedExecutive || "Unassigned"}</strong>
              </span>
              <Link href={`/admin/applications/${row.id}`} onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 min-h-[38px] px-3.5 flex items-center gap-1"
                >
                  View Details <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
          </div>
        ))}
        </div>
        {filteredCases.length > 0 && (
          <TablePagination
            entryStart={entryStart}
            entryEnd={entryEnd}
            totalItems={totalItems}
          />
        )}
      </div>

      {/* Official Project Vaul Drawer for Manage Case Details */}
      <Drawer
        open={isDrawerOpen && !!selectedCase}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedCase ? `Manage Case Ref: ${selectedCase.id}` : "Manage Case"}
        description={selectedCase ? `${selectedCase.serviceTitle} • ${selectedCase.customerName}` : ""}
        direction="right"
        className="max-w-xl"
      >
        {selectedCase && (
          <div className="space-y-6">
            {/* Selected Case Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-slate-400">Ref ID: {selectedCase.id}</span>
                <h3 className="font-black text-base text-slate-900">{selectedCase.serviceTitle}</h3>
                <p className="text-xs text-slate-500 font-semibold">{selectedCase.customerName} &middot; {selectedCase.customerPhone}</p>
                <div className="pt-2">
                  <Link href={`/admin/applications/${selectedCase.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-bold text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5 py-1.5 px-3">
                      <span>Open Full Case Workspace</span>
                      <ArrowRight size={13} />
                    </Button>
                  </Link>
                </div>
              </div>
              <StatusBadge status={selectedCase.query ? "QUERY_RAISED" : selectedCase.status} size="sm" />
            </div>

            {/* Upload Certificate Action Button */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-emerald-800">
                <Award className="size-5 shrink-0" />
                <h4 className="font-bold text-xs">Official Certificate Issuance</h4>
              </div>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                Upload government-issued registration certificates to mark the application APPROVED and deliver files to the customer workspace.
              </p>
              <Button
                onClick={() => handleUploadCertificateModal(selectedCase)}
                variant="primary"
                size="sm"
                fullWidth
                className="font-bold text-xs py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <Upload className="size-4" />
                <span>Upload Certificate & Approve</span>
              </Button>
            </div>

            {/* Uploaded User Documents List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Uploaded Applicant Documents</label>
              {Object.keys(selectedCase.uploadedDocs).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(selectedCase.uploadedDocs).map(([docName, file]) => (
                    <div
                      key={docName}
                      onClick={() => handleInspectDocument(docName, file)}
                      className="p-3 bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-indigo-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800">{docName}</p>
                          <p className="text-[10px] text-slate-400">{file.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 hover:underline">Inspect</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No applicant files uploaded yet.</p>
              )}
            </div>

            {/* Assign Executive Section */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Backoffice Specialist (MySQL Database)</label>
              <Select
                value={assignedOfficer}
                onChange={(val) => {
                  setAssignedOfficer(val);
                  handleAssignOfficer(val);
                }}
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
            </div>

            {/* Filing Status Workflow Buttons */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Advance Filing Stage</label>
              
              {selectedCase.query ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-xs text-amber-900">Active Query Pending Customer Action</h4>
                    <p className="text-[11px] text-amber-700 mt-0.5">Clear active query below after customer uploads revised documents.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={selectedCase.status === "UNDER_REVIEW" ? "primary" : "outline"}
                    size="sm"
                    fullWidth
                    onClick={() => handleUpdateStatus("UNDER_REVIEW")}
                    disabled={
                      isUpdatingStatus !== null ||
                      !canAdvanceWorkflowStatus({
                        currentStatus: selectedCase.status,
                        targetStatus: "UNDER_REVIEW",
                        formData: selectedCase.formData || {},
                        uploadedDocs: selectedCase.uploadedDocs || {},
                        docVerifications:
                          ((selectedCase.formData || {})._docVerification as DocVerificationMap) ||
                          {},
                        hasActiveQuery: Boolean(selectedCase.query),
                      })
                    }
                    className="rounded-lg justify-start font-bold text-xs py-2.5 cursor-pointer"
                    leftIcon={isUpdatingStatus === "UNDER_REVIEW" ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
                  >
                    1. Move to Under Review (Verification)
                  </Button>

                  <Button
                    variant={selectedCase.status === "SUBMITTED" ? "primary" : "outline"}
                    size="sm"
                    fullWidth
                    onClick={() => handleUpdateStatus("SUBMITTED")}
                    disabled={
                      isUpdatingStatus !== null ||
                      !canAdvanceWorkflowStatus({
                        currentStatus: selectedCase.status,
                        targetStatus: "SUBMITTED",
                        formData: selectedCase.formData || {},
                        uploadedDocs: selectedCase.uploadedDocs || {},
                        docVerifications:
                          ((selectedCase.formData || {})._docVerification as DocVerificationMap) ||
                          {},
                        hasActiveQuery: Boolean(selectedCase.query),
                      })
                    }
                    className="rounded-lg justify-start font-bold text-xs py-2.5 cursor-pointer"
                    leftIcon={isUpdatingStatus === "SUBMITTED" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  >
                    2. Mark Submitted to Ministry (Govt Filing)
                  </Button>

                  <Button
                    variant={selectedCase.status === "APPROVED" ? "primary" : "outline"}
                    size="sm"
                    fullWidth
                    onClick={() => handleUpdateStatus("APPROVED")}
                    disabled={
                      isUpdatingStatus !== null ||
                      !canAdvanceWorkflowStatus({
                        currentStatus: selectedCase.status,
                        targetStatus: "APPROVED",
                        formData: selectedCase.formData || {},
                        uploadedDocs: selectedCase.uploadedDocs || {},
                        docVerifications:
                          ((selectedCase.formData || {})._docVerification as DocVerificationMap) ||
                          {},
                        hasActiveQuery: Boolean(selectedCase.query),
                      })
                    }
                    className="rounded-lg justify-start font-bold text-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer"
                    leftIcon={isUpdatingStatus === "APPROVED" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                  >
                    3. Approve & Issue Government Certificate
                  </Button>
                </div>
              )}
            </div>

            {/* Raise Query Action Box */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Raise Customer Query</label>
                {selectedCase.query && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Active Query
                  </span>
                )}
              </div>

              <Select
                onChange={(val) => {
                  if (val) setQueryText(val);
                }}
                placeholder="Quick Query Templates..."
                options={[
                  { label: "Quick Query Templates...", value: "" },
                  { label: "Address proof blurred or unreadable", value: "Address proof blurred or unreadable. Please re-upload clear utility bill or lease agreement." },
                  { label: "PAN Card name mismatch", value: "PAN Card name does not match applicant full name. Please provide official name proof." },
                  { label: "Aadhaar Card front & back missing", value: "Aadhaar Card front and back side scans missing. Please upload complete document." },
                ]}
              />

              <Textarea
                rows={2}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Type specific query for client workspace..."
                className="text-xs p-2.5 bg-slate-50 border-slate-200"
              />

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={handleRaiseQuery}
                  className="font-bold text-xs py-2 bg-amber-600 hover:bg-amber-700 text-white border-0 cursor-pointer"
                >
                  Raise Query Alert
                </Button>
                {selectedCase.query && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearQuery}
                    className="font-bold text-xs py-2 text-slate-600 shrink-0 cursor-pointer"
                  >
                    Clear Query
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}
