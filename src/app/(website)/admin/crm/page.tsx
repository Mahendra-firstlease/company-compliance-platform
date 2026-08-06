"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  PhoneCall,
  Mail,
  UserCheck,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Plus,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/common/Button";
import { Card, CardContent } from "@/components/ui/card";
import Badge from "@/components/ui/Badge/Badge";
import apiFetch from "@/lib/apiClient";
import { notify } from "@/lib/notify";
import { useModal } from "@/components/ui/overlay";
import { formatDate } from "@/utils/formatters";
import Select from "@/components/forms/Select";
import Textarea from "@/components/forms/Textarea";
import SearchBar from "@/components/common/SearchBar";
import { useClientPagination } from "@/hooks/useClientPagination";
import TablePagination from "@/components/ui/TablePagination";
import TablePaginationToolbar from "@/components/ui/TablePaginationToolbar";

interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceRequested: string;
  status: "NEW" | "CONTACTED" | "QUOTATION_SENT" | "CONVERTED";
  assignedExecutive?: string;
  notes?: string;
  createdAt: string;
}

export default function AdminCrmPage() {
  const modal = useModal();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState("ALL");
  const [specialists, setSpecialists] = useState<{ id: string; name: string; role: string }[]>([]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<LeadItem[]>("/admin/crm");
      setLeads(Array.isArray(data) ? data : []);
      const team = await apiFetch<{ id: string; name: string; role: string }[]>("/admin/team").catch(() => []);
      if (Array.isArray(team)) setSpecialists(team);
    } catch (err) {
      console.error("Failed to fetch CRM leads:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filtered Leads Computation
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.serviceRequested.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusTab === "ALL") return matchesSearch;
      return matchesSearch && l.status === statusTab;
    });
  }, [leads, searchQuery, statusTab]);

  const {
    pageItems: paginatedLeads,
    pageIndex,
    pageSize,
    totalItems,
    totalPages,
    entryStart,
    entryEnd,
    pageSizeOptions,
    setPageIndex,
    setPageSize,
  } = useClientPagination(filteredLeads, {
    initialPageSize: 10,
    resetDeps: [searchQuery, statusTab],
  });

  // Lead Detail & Status Update Modal Handler
  const handleManageLeadModal = (lead: LeadItem) => {
    let currentStatus = lead.status;
    let executive = lead.assignedExecutive || "Anjali Gupta (Senior Legal Advisor)";
    let leadNotes = lead.notes || "";

    const updateLead = () => {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, status: currentStatus, assignedExecutive: executive, notes: leadNotes }
            : l
        )
      );
      notify.success(`Updated lead stage for ${lead.name}`);
      modal.closeAll();
    };

    modal.open({
      title: `Manage Lead: ${lead.name}`,
      description: `Ref ID: ${lead.id} • ${lead.serviceRequested}`,
      size: "md",
      content: (
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <p className="font-bold text-slate-800">{lead.name}</p>
            <p className="text-slate-500">{lead.email} &middot; {lead.phone}</p>
            <p className="text-indigo-600 font-semibold pt-1">Target Service: {lead.serviceRequested}</p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Advance Lead Status Funnel</label>
            <Select
              defaultValue={currentStatus}
              onChange={(val) => (currentStatus = val as any)}
              options={[
                { label: "1. NEW (Uncontacted Inquiry)", value: "NEW" },
                { label: "2. CONTACTED (Consultation Done)", value: "CONTACTED" },
                { label: "3. QUOTATION SENT (Fee Offer Shared)", value: "QUOTATION_SENT" },
                { label: "4. CONVERTED (Paid Application Case)", value: "CONVERTED" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Assign Sales / CA Executive (Database Roster)</label>
            <Select
              defaultValue={executive}
              onChange={(val) => (executive = val)}
              placeholder="-- Select Specialist from Database --"
              options={[
                { label: "-- Select Specialist from Database --", value: "" },
                ...specialists.map((spec) => ({
                  label: `${spec.name} — ${spec.role}`,
                  value: `${spec.name} (${spec.role})`,
                })),
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Executive Notes & Follow-up Log</label>
            <Textarea
              rows={3}
              defaultValue={leadNotes}
              onChange={(e) => (leadNotes = e.target.value)}
              placeholder="e.g. Spoke with client regarding GST threshold limit. Quotation sent via WhatsApp."
              className="text-xs p-2.5"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => modal.closeAll()} className="text-xs font-bold">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={updateLead} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700">
              Save Lead Updates
            </Button>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pre-Sales CRM & Consultation Lead Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track inquiries, callback requests, cart abandonments, and sales funnel conversions for statutory filings.
          </p>
        </div>

        <Button variant="primary" size="sm" className="text-xs font-bold flex items-center gap-1.5 shrink-0">
          <Plus size={14} /> Add New Lead
        </Button>
      </div>

      {/* Funnel KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Leads</span>
            <p className="text-2xl font-black text-slate-900">{leads.length}</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Inquiries</span>
            <p className="text-2xl font-black text-amber-600">{leads.filter((l) => l.status === "NEW").length}</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quotations Sent</span>
            <p className="text-2xl font-black text-indigo-600">{leads.filter((l) => l.status === "QUOTATION_SENT").length}</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Converted Cases</span>
            <p className="text-2xl font-black text-emerald-600">{leads.filter((l) => l.status === "CONVERTED").length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar: Search & Funnel Status Tabs */}
      <div className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-full sm:w-72">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search lead name, phone or service..."
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

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full scrollbar-none">
          {[
            { label: "All Leads", value: "ALL" },
            { label: "New", value: "NEW" },
            { label: "Contacted", value: "CONTACTED" },
            { label: "Quotation Sent", value: "QUOTATION_SENT" },
            { label: "Converted", value: "CONVERTED" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusTab(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusTab === tab.value ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CRM Datatable */}
      <Card enableHover>
        <CardContent className="p-0">
          <>
            {/* Desktop Table View (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Lead Contact</th>
                    <th className="py-3 px-4">Service Requested</th>
                    <th className="py-3 px-4">Funnel Status</th>
                    <th className="py-3 px-4">Assigned Specialist</th>
                    <th className="py-3 px-4">Inquiry Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Loading CRM lead desk...
                      </td>
                    </tr>
                  ) : filteredLeads.length > 0 ? (
                    paginatedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-slate-900">{lead.name}</p>
                            <p className="text-[11px] text-slate-400">{lead.phone} &middot; {lead.email}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {lead.serviceRequested}
                        </td>

                        <td className="py-3.5 px-4">
                          <Badge
                            variant={
                              lead.status === "CONVERTED"
                                ? "green"
                                : lead.status === "QUOTATION_SENT"
                                ? "indigo"
                                : lead.status === "CONTACTED"
                                ? "blue"
                                : "yellow"
                            }
                            rounded="full"
                            size="sm"
                          >
                            {lead.status.replace("_", " ")}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {lead.assignedExecutive || "Unassigned"}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {formatDate(lead.createdAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="size-11 min-h-11 min-w-11 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors shadow-xs active:scale-95"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare size={14} className="text-white" />
                            </a>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageLeadModal(lead)}
                              className="text-xs font-bold cursor-pointer"
                            >
                              Manage Lead
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        No leads found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List (< sm) */}
            <div className="sm:hidden divide-y divide-slate-100 p-2">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading CRM leads...</div>
              ) : filteredLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <div key={lead.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{lead.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono">{lead.phone}</p>
                      </div>
                      <Badge
                        variant={
                          lead.status === "CONVERTED"
                            ? "green"
                            : lead.status === "QUOTATION_SENT"
                            ? "indigo"
                            : lead.status === "CONTACTED"
                            ? "blue"
                            : "yellow"
                        }
                        rounded="full"
                        size="sm"
                      >
                        {lead.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2.5 space-y-1 text-xs">
                      <p className="font-bold text-indigo-700">{lead.serviceRequested}</p>
                      <p className="text-[11px] text-slate-500">
                        Officer: <strong className="text-slate-800">{lead.assignedExecutive || "Unassigned"}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-xs shadow-xs active:scale-95 transition-all"
                      >
                        <MessageSquare size={13} className="text-white" /> WhatsApp
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageLeadModal(lead)}
                        className="text-xs font-bold py-1.5 px-3 min-h-[36px]"
                      >
                        Manage Lead
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">No leads found matching query.</div>
              )}
            </div>
            {filteredLeads.length > 0 && (
              <TablePagination
                entryStart={entryStart}
                entryEnd={entryEnd}
                totalItems={totalItems}
              />
            )}
          </>
        </CardContent>
      </Card>
    </div>
  );
}
