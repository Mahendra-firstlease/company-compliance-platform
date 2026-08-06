"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import Button from "@/components/common/Button";
import SearchBar from "@/components/common/SearchBar";
import Badge from "@/components/ui/Badge/Badge";
import { getApplications, ApplicationCase } from "@/lib/applications";
import {
  FileText,
  ArrowRight,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { TableSkeleton } from "@/components/ui/skeletons";
import { useClientPagination } from "@/hooks/useClientPagination";
import TablePagination from "@/components/ui/TablePagination";
import TablePaginationToolbar from "@/components/ui/TablePaginationToolbar";

export default function UserApplicationsPage() {
  const { data: session } = useSession();
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const data = await getApplications();
      setCases(data);
    } catch (err) {
      console.error("Failed to load user applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase());

      if (statusFilter === "ALL") return matchesSearch;
      if (statusFilter === "PENDING")
        return matchesSearch && (c.status === "DOCUMENTS_PENDING" || c.status === "PAYMENT_CONFIRMED");
      if (statusFilter === "REVIEW")
        return matchesSearch && (c.status === "UNDER_REVIEW" || c.status === "SUBMITTED");
      if (statusFilter === "APPROVED") return matchesSearch && c.status === "APPROVED";
      return matchesSearch;
    });
  }, [cases, searchTerm, statusFilter]);

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
    initialPageSize: 8,
    resetDeps: [searchTerm, statusFilter],
  });

  return (
    <Section className="py-12 bg-slate-50 min-h-screen">
      <Container>
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                Client Workspace
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                My Statutory Applications
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Track real-time progress, document uploads, and certificates for your registered cases.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchCases}
                className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Refresh applications"
              >
                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>

              <Link href="/services">
                <Button variant="primary" size="sm" className="font-bold text-xs py-2.5 px-4 cursor-pointer flex items-center gap-1.5">
                  <PlusCircle className="size-4" />
                  <span>Apply for New License</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Search & Status Filter Controls using Reusable SearchBar */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full sm:w-80">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search by ID or service name..."
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
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg w-full sm:w-auto overflow-x-auto scrollbar-none">
              {[
                { label: "All Cases", value: "ALL" },
                { label: "Pending", value: "PENDING" },
                { label: "Under Review", value: "REVIEW" },
                { label: "Approved", value: "APPROVED" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

          {/* Dynamic Applications Table / Cards */}
          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : filteredCases.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs divide-y divide-slate-100">
              {paginatedCases.map((c) => (
                <div
                  key={c.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{c.serviceTitle}</h3>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {c.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Applicant: <span className="font-semibold text-slate-700">{c.customerName}</span> ({c.customerPhone})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Submitted on: {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <Badge
                      variant={
                        c.status === "APPROVED" || c.status === "PAYMENT_CONFIRMED"
                          ? "green"
                          : c.query
                          ? "yellow"
                          : "indigo"
                      }
                      rounded="full"
                      size="sm"
                    >
                      {c.status === "PAYMENT_CONFIRMED"
                        ? "✓ PAYMENT CONFIRMED"
                        : c.query
                        ? "QUERY PENDING"
                        : c.status.replace("_", " ")}
                    </Badge>

                    <Link href={`/applications/${c.serviceSlug}`}>
                      <Button variant="outline" size="sm" className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                        <span>Open Workspace</span>
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              <TablePagination
                entryStart={entryStart}
                entryEnd={entryEnd}
                totalItems={totalItems}
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-4">
              <div className="size-12 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <FileText className="size-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Applications Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm
                  ? "No cases match your current search parameters."
                  : "You have not submitted any statutory applications yet."}
              </p>
              <Link href="/services">
                <Button variant="primary" size="sm" className="font-bold text-xs py-2.5 px-5 mt-2 cursor-pointer">
                  Browse 15+ Statutory Services
                </Button>
              </Link>
            </div>
          )}

        </div>
      </Container>
    </Section>
  );
}
