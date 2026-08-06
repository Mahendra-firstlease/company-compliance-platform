"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  getApplications,
  ApplicationCase,
  updateApplication,
} from "@/lib/applications";
import DataTable, { ColumnDef } from "@/components/ui/DataTable";

import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/common/Button";
import { Drawer } from "@/components/ui/overlay";
import {
  UISelect as Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/forms/Select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Lock, Send, UserCheck, ArrowRight } from "lucide-react";
import { notify } from "@/lib/notify";
import apiFetch from "@/lib/apiClient";
import Textarea from "@/components/forms/Textarea";
import StatusBadge from "@/components/common/StatusBadge";
import {
  canAdvanceWorkflowStatus,
  DocVerificationMap,
  getWorkflowBlockers,
} from "@/lib/application-workflow";

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("");
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const list = await getApplications();
      setCases(list);
    }
    loadData();

    apiFetch<any[]>("/admin/team")
      .then((team) => {
        if (Array.isArray(team)) setSpecialists(team);
      })
      .catch(() => {});
  }, []);

  const selectedCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) || null,
    [cases, selectedCaseId]
  );

  const handleUpdateStatus = async (status: string) => {
    if (!selectedCase) return;

    const formData = (selectedCase.formData || {}) as Record<string, unknown>;
    const blockers = getWorkflowBlockers({
      currentStatus: selectedCase.status,
      targetStatus: status,
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

    setIsUpdatingStatus(status);
    try {
      const result = await updateApplication(selectedCase.id, {
        status: status as any,
      });
      if (!result.success) {
        notify.error(result.error || "Failed to update status.");
        return;
      }
      const list = await getApplications();
      setCases(list);
      notify.success(`Status updated to ${status}`);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleAssignOfficer = async (officer: string) => {
    if (!selectedCaseId) return;
    await updateApplication(selectedCaseId, { assignedExecutive: officer });
    const list = await getApplications();
    setCases(list);
    setAssignedOfficer(officer);
    notify.success(`Assigned officer: ${officer}`);
  };

  const handleRaiseQuery = async () => {
    if (!selectedCaseId || !queryText.trim()) return;
    await updateApplication(selectedCaseId, { query: queryText.trim() });
    const list = await getApplications();
    setCases(list);
    notify.warning(`Clarification query alert submitted to customer.`);
  };

  const handleClearQuery = async () => {
    if (!selectedCaseId) return;
    await updateApplication(selectedCaseId, { query: "" });
    const list = await getApplications();
    setCases(list);
    setQueryText("");
    notify.success("Active query warning cleared.");
  };

  // Column definitions for applications tab list table
  const applicationsColumns = useMemo<ColumnDef<ApplicationCase>[]>(
    () => [
      {
        header: "Filing ID",
        accessorKey: "id",
        cell: (row) => (
          <span className="font-semibold text-slate-500">{row.id}</span>
        ),
      },
      {
        header: "Service",
        accessorKey: "serviceTitle",
        cell: (row) => (
          <span className="font-semibold text-slate-800">
            {row.serviceTitle}
          </span>
        ),
      },
      {
        header: "Customer Name",
        accessorKey: "customerName",
        cell: (row) => (
          <span className="font-semibold text-slate-700">
            {row.customerName}
          </span>
        ),
      },
      {
        header: "Phone Number",
        accessorKey: "customerPhone",
        cell: (row) => (
          <span className="text-slate-500">{row.customerPhone}</span>
        ),
      },
      {
        header: "Officer Assigned",
        accessorKey: "assignedExecutive",
        cell: (row) => (
          <span className="text-slate-600">
            {row.assignedExecutive || "Unassigned"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (row) => (
          <StatusBadge status={row.queryStatus || (row.query ? "QUERY_RAISED" : row.status)} size="sm" />
        ),
      },
      {
        header: "Action",
        accessorKey: "action",
        cell: (row) => (
          <Link href={`/admin/applications/${row.id}`} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300"
            >
              View Case Details <ArrowRight size={13} />
            </Button>
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-2xs p-6 space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800 text-sm">
          All Filing Queue Entries
        </h3>
      </div>

      <DataTable
        columns={applicationsColumns}
        data={cases}
        searchKey="serviceTitle"
        searchPlaceholder="Search by filing service..."
        defaultPageSize={10}
        onRowClick={(row) => router.push(`/admin/applications/${row.id}`)}
        selectedRowId={selectedCaseId}
        getRowId={(row) => row.id}
        mobileCardRender={(row) => (
          <div className="p-3 bg-white border border-slate-200/80 rounded-lg space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {row.id}
              </span>
              <StatusBadge status={row.queryStatus || (row.query ? "QUERY_RAISED" : row.status)} size="sm" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-slate-900 leading-snug">{row.serviceTitle}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{row.customerName}</p>
              <p className="text-[10px] text-slate-400">{row.customerPhone}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                Officer: <strong className="text-slate-800">{row.assignedExecutive || "Unassigned"}</strong>
              </span>
              <Link href={`/admin/applications/${row.id}`} onClick={(e) => e.stopPropagation()}>
                <Button variant="outline" size="sm" className="text-xs font-bold py-1.5 px-3 flex items-center gap-1 min-h-[36px]">
                  View Details <ArrowRight size={12} />
                </Button>
              </Link>
            </div>
          </div>
        )}
      />
      <Drawer
        open={selectedCaseId !== null}
        onClose={() => setSelectedCaseId(null)}
        title="Filing Case Details"
        description={
          selectedCase
            ? `${selectedCase.serviceTitle} · Tracking ID: ${selectedCase.id}`
            : undefined
        }
        direction="right"
      >
        {selectedCase && (
          <div className="space-y-6 text-left">
            {/* Customer Info */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer</span>
                <span className="text-slate-700">
                  {selectedCase.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="text-slate-700">
                  {selectedCase.customerPhone}
                </span>
              </div>
              <div className="border-t border-slate-150 pt-2 text-left">
                <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider mb-1">
                  Registered Address
                </span>
                <span className="text-slate-600 leading-relaxed block truncate">
                  {selectedCase.address || "Not Provided"}
                </span>
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                Verification Documents
              </h4>
              <div className="space-y-2">
                {Object.keys(selectedCase.uploadedDocs).length > 0 ? (
                  Object.entries(selectedCase.uploadedDocs).map(
                    ([docName, docFile]) => (
                      <div
                        key={docName}
                        className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                      >
                        <span className="text-slate-600 truncate max-w-32">
                          {docName}
                        </span>
                        <span
                          className="text-primary font-semibold truncate max-w-32"
                          title={docFile.name}
                        >
                          {docFile.name}
                        </span>
                      </div>
                    ),
                  )
                ) : (
                  <div className="text-center py-4 bg-slate-50/50 border border-slate-100 rounded-lg text-xs text-slate-400 italic">
                    No files uploaded.
                  </div>
                )}
              </div>
            </div>

            {/* Assign Officer */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Assign Officer
              </label>
              <Select
                value={assignedOfficer}
                onValueChange={(val) => handleAssignOfficer(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {specialists.map((spec) => (
                    <SelectItem key={spec.id} value={`${spec.name} (${spec.role})`}>
                      {spec.name} ({spec.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Process Actions */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Advance Stage Workflow
              </label>

              {selectedCase.query ? (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2 items-start">
                  <Lock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-normal font-semibold">
                    Actions locked. Resolve active queries first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={
                      selectedCase.status === "UNDER_REVIEW"
                        ? "primary"
                        : "outline"
                    }
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
                      })
                    }
                    leftIcon={
                      isUpdatingStatus === "UNDER_REVIEW" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <UserCheck size={12} />
                      )
                    }
                  >
                    Set: Under Review
                  </Button>
                  <Button
                    variant={
                      selectedCase.status === "SUBMITTED"
                        ? "primary"
                        : "outline"
                    }
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
                      })
                    }
                    leftIcon={
                      isUpdatingStatus === "SUBMITTED" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )
                    }
                  >
                    Set: Ministry Submitted
                  </Button>
                  <Button
                    variant={
                      selectedCase.status === "APPROVED" ? "primary" : "outline"
                    }
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
                      })
                    }
                    leftIcon={
                      isUpdatingStatus === "APPROVED" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )
                    }
                  >
                    Set: Approved & Issue Cert
                  </Button>
                </div>
              )}
            </div>

            {/* Query Block */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Raise Query Alert
              </label>
              <Textarea
                rows={2}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Detail the revisions needed..."
                className="text-xs p-2.5"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="text-xs"
                  onClick={handleClearQuery}
                  disabled={!selectedCase.query}
                >
                  Clear Query
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  onClick={handleRaiseQuery}
                  disabled={!queryText.trim()}
                >
                  Raise Query
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
