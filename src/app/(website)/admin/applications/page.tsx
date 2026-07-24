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
import { CheckCircle, Loader2, Lock, Send, UserCheck } from "lucide-react";
import { notify } from "@/lib/notify";
export default function AdminApplicationsPage() {
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [queryText, setQueryText] = useState("");
  useEffect(() => {
    getApplications().then(setCases).catch(console.error);
  }, []);

  const selectedCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || null;
  }, [cases, selectedCaseId]);

  const handleUpdateStatus = async (
    newStatus: "UNDER_REVIEW" | "SUBMITTED" | "APPROVED",
  ) => {
    if (!selectedCaseId) return;
    setIsUpdatingStatus(newStatus);

    const updatePromise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
        notify.success(
          `Filing stage updated to ${newStatus.replace("_", " ")}`,
        );
      }, 1000);
    });

    try {
      await updatePromise;
      await updateApplication(selectedCaseId, { status: newStatus });
      const list = await getApplications();
      setCases(list);
      setIsUpdatingStatus(null);
    } catch {
      setIsUpdatingStatus(null);
    }
  };

  const handleAssignOfficer = async (officer: string) => {
    if (!selectedCaseId) return;
    await updateApplication(selectedCaseId, { assignedExecutive: officer });
    const list = await getApplications();
    setCases(list);
    setAssignedOfficer(officer);
    notify.success(
      officer
        ? `Assigned to ${officer.split(",")[0]}`
        : "Officer assignment cleared.",
    );
  };

    const handleRaiseQuery = async () => {
    if (!selectedCaseId || !queryText.trim()) return;
    await updateApplication(selectedCaseId, { query: queryText });
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
          <Badge
            variant={row.status === "APPROVED" ? "green" : "indigo"}
            rounded="full"
            size="sm"
          >
            {row.status.replace("_", " ")}
          </Badge>
        ),
      },
      {
        header: "Action",
        accessorKey: "action",
        cell: (row) => (
          <Button
            variant={selectedCaseId === row.id ? "primary" : "outline"}
            size="sm"
            className="text-xs font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCaseId(row.id);
            }}
          >
            Process
          </Button>
        ),
      },
    ],
    [setSelectedCaseId],
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
        onRowClick={(row) => setSelectedCaseId(row.id)}
        selectedRowId={selectedCaseId}
        getRowId={(row) => row.id}
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
                  <SelectItem value="Rohan Sharma, Sr. Specialist">
                    Rohan Sharma (Filing Specialist)
                  </SelectItem>
                  <SelectItem value="Anjali Gupta, CA Consultant">
                    Anjali Gupta (CA Consultant)
                  </SelectItem>
                  <SelectItem value="Vikram Malhotra, CS Associate">
                    Vikram Malhotra (CS Associate)
                  </SelectItem>
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
                    disabled={isUpdatingStatus !== null}
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
                    disabled={isUpdatingStatus !== null}
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
                      Object.keys(selectedCase.uploadedDocs).length === 0
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
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Detail the revisions needed..."
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary h-16 resize-none"
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
