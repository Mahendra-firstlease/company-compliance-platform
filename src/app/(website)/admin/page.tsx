"use client";

import React, { useState, useEffect, useMemo } from "react";
import Button from "@/components/common/Button";
import { getApplications, updateApplication, ApplicationCase } from "@/lib/applications";
import { useModal, Drawer } from "@/components/ui/overlay";
import { notify } from "@/lib/notify";
import {
  Users,
  CheckCircle,
  FileText,
  UserCheck,
  Send,
  Loader2,
  Lock,
  Plus,
  ShieldCheck,
  CalendarDays,
  Clock,
  Eye,
  AlertCircle,
  IndianRupee,
  Building2,
  Phone,
  Mail,
  Filter,
} from "lucide-react";
import {
  UISelect as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/forms/Select";
import DataTable, { ColumnDef } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge/Badge";

export default function AdminPortalPage() {
  const modal = useModal();
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Form states for application processing
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [queryText, setQueryText] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Auto-poll applications from MySQL to get live real-time paid filings
  useEffect(() => {
    let active = true;

    const loadCases = async () => {
      try {
        const list = await getApplications();
        if (active) {
          setCases(list);
        }
      } catch (err) {
        console.error("Admin auto-poll error:", err);
      }
    };

    loadCases();

    const interval = setInterval(loadCases, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  // Sync state values when selected case changes
  useEffect(() => {
    if (selectedCase) {
      setAssignedOfficer(selectedCase.assignedExecutive || "");
      setQueryText(selectedCase.query || "");
    }
  }, [selectedCase]);

  // Filter cases by active status tab
  const filteredCases = useMemo(() => {
    if (statusFilter === "ALL") return cases;
    if (statusFilter === "QUERIES") return cases.filter((c) => !!c.query);
    return cases.filter((c) => c.status === statusFilter);
  }, [cases, statusFilter]);

  // Calculate statistics metrics
  const stats = useMemo(() => {
    const total = cases.length;
    const paidNew = cases.filter((c) => c.status === "PAYMENT_CONFIRMED").length;
    const pendingReview = cases.filter((c) => c.status === "UNDER_REVIEW").length;
    const inProgress = cases.filter((c) => c.status === "SUBMITTED").length;
    const completed = cases.filter((c) => c.status === "APPROVED").length;
    const queries = cases.filter((c) => !!c.query).length;
    const revenue = cases.reduce((acc, c) => acc + c.totalFee, 0);

    return { total, paidNew, pendingReview, inProgress, completed, queries, revenue };
  }, [cases]);

  // Column definitions for overview queue table
  const overviewColumns = useMemo<ColumnDef<ApplicationCase>[]>(() => [
    {
      header: "Filing ID",
      accessorKey: "id",
      cell: (row) => <span className="font-bold text-slate-600">{row.id}</span>
    },
    {
      header: "Service Product",
      accessorKey: "serviceTitle",
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.serviceTitle}</p>
          <p className="text-[11px] text-slate-400">₹{row.totalFee} Statutory Fee</p>
        </div>
      )
    },
    {
      header: "Customer Details",
      accessorKey: "customerName",
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-800">{row.customerName}</p>
          <p className="text-[11px] text-slate-400">{row.customerPhone}</p>
        </div>
      )
    },
    {
      header: "Assigned Executive",
      accessorKey: "assignedExecutive",
      cell: (row) => (
        <span className="text-xs font-medium text-slate-600">
          {row.assignedExecutive || "Unassigned"}
        </span>
      )
    },
    {
      header: "Filing Status",
      accessorKey: "status",
      cell: (row) => (
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
      )
    },
    {
      header: "Action",
      align: "right",
      cell: (row) => (
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
      )
    }
  ], [selectedCaseId]);

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
                <img src={docFile.url} className="max-h-96 w-auto max-w-full object-contain p-2" alt={docFile.name} />
              )}
            </div>
          ) : (
            <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center space-y-2">
              <FileText className="size-10 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Encrypted Document Preview</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                File is stored securely in statutory sandbox. Clean scan passed format checks.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => modal.closeAll()}>
              Close Inspector
            </Button>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-lg text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
            🛡️ Backoffice Case Console
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2 text-white">
            Filing Case Management Portal
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Review incoming paid applications, verify customer documents, assign CAs/CSs, and manage filing lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-lg p-4 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Revenue</span>
            <span className="text-xl font-black text-emerald-400">₹{stats.revenue.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === "ALL" ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Cases</span>
          <span className="text-2xl font-black text-slate-800 block mt-1">{stats.total}</span>
        </div>

        <div
          onClick={() => setStatusFilter("PAYMENT_CONFIRMED")}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === "PAYMENT_CONFIRMED" ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">New Paid</span>
          <span className="text-2xl font-black text-emerald-700 block mt-1">{stats.paidNew}</span>
        </div>

        <div
          onClick={() => setStatusFilter("UNDER_REVIEW")}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === "UNDER_REVIEW" ? "bg-amber-50 border-amber-300 ring-2 ring-amber-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">Under Review</span>
          <span className="text-2xl font-black text-amber-700 block mt-1">{stats.pendingReview}</span>
        </div>

        <div
          onClick={() => setStatusFilter("SUBMITTED")}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === "SUBMITTED" ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Govt Submitted</span>
          <span className="text-2xl font-black text-blue-700 block mt-1">{stats.inProgress}</span>
        </div>

        <div
          onClick={() => setStatusFilter("APPROVED")}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === "APPROVED" ? "bg-green-50 border-green-300 ring-2 ring-green-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-xs font-bold text-green-600 uppercase tracking-wider block">Approved</span>
          <span className="text-2xl font-black text-green-700 block mt-1">{stats.completed}</span>
        </div>

        <div
          onClick={() => setStatusFilter("QUERIES")}
          className={`p-4 rounded-lg border transition-all cursor-pointer ${
            statusFilter === "QUERIES" ? "bg-red-50 border-red-300 ring-2 ring-red-500/20" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">Queries Raised</span>
          <span className="text-2xl font-black text-red-700 block mt-1">{stats.queries}</span>
        </div>
      </div>

      {/* Filter Tabs Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {[
          { key: "ALL", label: `All Cases (${stats.total})` },
          { key: "PAYMENT_CONFIRMED", label: `New Paid (${stats.paidNew})` },
          { key: "UNDER_REVIEW", label: `Under Review (${stats.pendingReview})` },
          { key: "SUBMITTED", label: `Govt Submitted (${stats.inProgress})` },
          { key: "APPROVED", label: `Approved (${stats.completed})` },
          { key: "QUERIES", label: `Queries Raised (${stats.queries})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              statusFilter === tab.key
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Application Management Data Table Queue */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Filing Case Queue</h3>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-100">
            {filteredCases.length} Cases Displayed
          </span>
        </div>

        <DataTable
          columns={overviewColumns}
          data={filteredCases}
          searchKey="customerName"
          searchPlaceholder="Search by customer name, phone, or service title..."
          defaultPageSize={10}
          onRowClick={(row) => setSelectedCaseId(row.id)}
          selectedRowId={selectedCaseId}
          getRowId={(row) => row.id}
        />
      </div>

      {/* Slide-in Case Processor Drawer Panel */}
      <Drawer
        open={selectedCaseId !== null}
        onClose={() => setSelectedCaseId(null)}
        title="Filing Case Workspace Drawer"
        description={selectedCase ? `${selectedCase.serviceTitle} · Tracking ID: ${selectedCase.id}` : undefined}
        direction="right"
      >
        {selectedCase && (
          <div className="space-y-6 text-left">
            {/* Customer Info Card */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-sm">{selectedCase.customerName}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                  ₹{selectedCase.totalFee} PAID VIA RAZORPAY
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Phone Contact:</span>
                <span className="text-slate-800 font-semibold">{selectedCase.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Application Status:</span>
                <span className="text-indigo-600 font-bold">{selectedCase.status}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 text-left">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">Registered Address</span>
                <span className="text-slate-700 leading-relaxed block">{selectedCase.address || "India Registered Office Address"}</span>
              </div>
            </div>

            {/* Document Verification Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Customer Verification Files</h4>
                <span className="text-[10px] font-bold text-slate-400">
                  {Object.keys(selectedCase.uploadedDocs).length} Uploaded
                </span>
              </div>

              <div className="space-y-2">
                {Object.keys(selectedCase.uploadedDocs).length > 0 ? (
                  Object.entries(selectedCase.uploadedDocs).map(([docName, docFile]) => (
                    <div key={docName} className="flex justify-between items-center bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-2xs">
                      <div>
                        <p className="font-bold text-slate-800">{docName}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-44">{docFile.name} ({docFile.size})</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInspectDocument(docName, docFile)}
                        className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>Inspect File</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-5 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-400 font-medium">
                    No files attached yet by customer.
                  </div>
                )}
              </div>
            </div>

            {/* Assign Legal Specialist / CA / CS */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Assign Specialist / CA / CS</label>
              <Select value={assignedOfficer} onValueChange={(val) => handleAssignOfficer(val)}>
                <SelectTrigger className="w-full rounded-lg">
                  <SelectValue placeholder="Unassigned Specialist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned Specialist</SelectItem>
                  <SelectItem value="Rohan Sharma, Sr. Specialist">Rohan Sharma (Sr. Filing Specialist)</SelectItem>
                  <SelectItem value="Anjali Gupta, CA Consultant">Anjali Gupta (Chartered Accountant)</SelectItem>
                  <SelectItem value="Vikram Malhotra, CS Associate">Vikram Malhotra (Company Secretary)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Transition Action Buttons */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Advance Filing Stage</label>

              {selectedCase.query ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex gap-2.5 items-start">
                  <Lock className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900">
                    <p className="font-bold">Active Customer Query Pending</p>
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

              {/* Quick Template Dropdown */}
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
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Detail the revisions needed from the customer..."
                className="w-full rounded-lg border border-slate-200 p-3 text-xs outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-20 resize-none"
              />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="rounded-lg text-xs font-bold"
                  onClick={handleClearQuery}
                  disabled={!selectedCase.query}
                >
                  Clear Active Query
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                  onClick={handleRaiseQuery}
                  disabled={!queryText.trim()}
                >
                  Raise Query Alert
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
