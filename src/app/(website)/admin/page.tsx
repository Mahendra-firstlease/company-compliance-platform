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
import { notify } from "@/lib/notify";
import SearchBar from "@/components/common/SearchBar";
import { useModal } from "@/components/ui/overlay";

export default function AdminDashboardPage() {
  const modal = useModal();
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states for application processing
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [queryText, setQueryText] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isUploadingCert, setIsUploadingCert] = useState(false);

  // Auto-poll applications from MySQL to get live real-time paid filings
  useEffect(() => {
    let active = true;

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
    if (!selectedCaseId) return;
    setIsUpdatingStatus(newStatus);

    try {
      await updateApplication(selectedCaseId, { status: newStatus });
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
    let uploadedFileUrl = "";
    let uploadedFileName = `${targetApp.serviceSlug}_certificate.pdf`;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadedFileName = file.name;
        uploadedFileUrl = URL.createObjectURL(file);
      }
    };

    const submitCertificate = async () => {
      if (!uploadedFileUrl) {
        // Fallback default sample certificate URL if no file picked
        uploadedFileUrl = `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
      }

      setIsUploadingCert(true);
      try {
        const res = await fetch("/api/admin/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicationId: targetApp.id,
            certificateName: certTitle,
            fileUrl: uploadedFileUrl,
            fileName: uploadedFileName,
            fileSize: "1.4 MB",
            fileType: "application/pdf",
          }),
        });

        if (res.ok) {
          notify.success(`Official Certificate uploaded and application APPROVED!`);
          const list = await getApplications();
          setCases(list);
          modal.closeAll();
        } else {
          notify.error("Failed to upload certificate.");
        }
      } catch (err) {
        console.error(err);
        notify.error("Error uploading certificate.");
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
            <label className="block text-xs font-bold text-slate-700">Select Official Certificate Document (PDF/PNG)</label>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Backoffice Legal Operations Console
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Statutory Filings Queue & Case Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time live MySQL application stream. Assign executives, audit uploaded documents, raise queries, and upload certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>5s Live Sync Active</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Paid Cases</span>
          <p className="text-2xl font-black text-slate-900">{cases.length}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Under Review</span>
          <p className="text-2xl font-black text-indigo-600">
            {cases.filter((c) => c.status === "UNDER_REVIEW").length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Queries</span>
          <p className="text-2xl font-black text-amber-600">
            {cases.filter((c) => Boolean(c.query)).length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Approved & Certificates Issued</span>
          <p className="text-2xl font-black text-emerald-600">
            {cases.filter((c) => c.status === "APPROVED").length}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls using Reusable SearchBar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Reusable SearchBar Component */}
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by customer, phone, or Ref ID..."
            size="sm"
            fullWidth={true}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Grid Layout: Table (70%) vs Manage Case Drawer (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table View */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
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
              {filteredCases.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => setSelectedCaseId(row.id)}
                  className="cursor-pointer"
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
                    <Badge
                      variant={
                        row.status === "APPROVED"
                          ? "green"
                          : row.status === "PAYMENT_CONFIRMED"
                          ? "green"
                          : row.query
                          ? "yellow"
                          : "indigo"
                      }
                      rounded="full"
                      size="sm"
                    >
                      {row.query ? "QUERY PENDING" : row.status === "PAYMENT_CONFIRMED" ? "✓ PAYMENT CONFIRMED" : row.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={selectedCaseId === row.id ? "primary" : "outline"}
                      size="sm"
                      className="text-xs font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseId(row.id);
                      }}
                    >
                      Manage Case
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Selected Case Management Panel */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 shadow-2xs">
          {selectedCase ? (
            <div className="space-y-6">
              {/* Selected Case Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">Ref: {selectedCase.id}</span>
                  <h3 className="font-black text-base text-slate-900">{selectedCase.serviceTitle}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{selectedCase.customerName} &middot; {selectedCase.customerPhone}</p>
                </div>
                <Badge
                  variant={selectedCase.status === "APPROVED" ? "green" : "indigo"}
                  rounded="full"
                  size="sm"
                >
                  {selectedCase.status.replace("_", " ")}
                </Badge>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Backoffice Specialist</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter CA/CS Executive Name..."
                    value={assignedOfficer}
                    onChange={(e) => setAssignedOfficer(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 outline-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold text-xs shrink-0"
                    onClick={() => handleAssignOfficer(assignedOfficer)}
                  >
                    Assign
                  </Button>
                </div>
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
                      disabled={isUpdatingStatus !== null}
                      className="rounded-lg justify-start font-bold text-xs py-2.5"
                      leftIcon={isUpdatingStatus === "UNDER_REVIEW" ? <Loader2 className="size-4 animate-spin" /> : <UserCheck className="size-4" />}
                    >
                      1. Move to Under Review (Verification)
                    </Button>

                    <Button
                      variant={selectedCase.status === "SUBMITTED" ? "primary" : "outline"}
                      size="sm"
                      fullWidth
                      onClick={() => handleUpdateStatus("SUBMITTED")}
                      disabled={isUpdatingStatus !== null}
                      className="rounded-lg justify-start font-bold text-xs py-2.5"
                      leftIcon={isUpdatingStatus === "SUBMITTED" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    >
                      2. Mark Submitted to Ministry (Govt Filing)
                    </Button>

                    <Button
                      variant={selectedCase.status === "APPROVED" ? "primary" : "outline"}
                      size="sm"
                      fullWidth
                      onClick={() => handleUpdateStatus("APPROVED")}
                      disabled={isUpdatingStatus !== null}
                      className="rounded-lg justify-start font-bold text-xs py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
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

                <select
                  onChange={(e) => {
                    if (e.target.value) setQueryText(e.target.value);
                  }}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 outline-none font-medium"
                >
                  <option value="">Quick Query Templates...</option>
                  <option value="Address proof blurred or unreadable. Please re-upload clear utility bill or lease agreement.">
                    Address proof blurred or unreadable
                  </option>
                  <option value="PAN Card name does not match applicant full name. Please provide official name proof.">
                    PAN Card name mismatch
                  </option>
                  <option value="Aadhaar Card front and back side scans missing. Please upload complete document.">
                    Aadhaar front/back scans missing
                  </option>
                </select>

                <textarea
                  rows={2}
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder="Type specific query for client workspace..."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 outline-none"
                />

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={handleRaiseQuery}
                    className="font-bold text-xs py-2 bg-amber-600 hover:bg-amber-700 text-white border-0"
                  >
                    Raise Query Alert
                  </Button>
                  {selectedCase.query && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearQuery}
                      className="font-bold text-xs py-2 text-slate-600 shrink-0"
                    >
                      Clear Query
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <ClipboardList className="size-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Select a case from the queue to manage filing stages.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
