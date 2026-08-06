"use client";

import { downloadFile } from "@/utils/download";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/common/Button";
import SearchBar from "@/components/common/SearchBar";
import Badge from "@/components/ui/Badge/Badge";
import { notify } from "@/lib/notify";
import { TableSkeleton } from "@/components/ui/skeletons";
import { useClientPagination } from "@/hooks/useClientPagination";
import TablePagination from "@/components/ui/TablePagination";
import TablePaginationToolbar from "@/components/ui/TablePaginationToolbar";

interface AdminDocument {
  id: string;
  applicationId: string;
  serviceTitle: string;
  serviceSlug: string;
  customerName: string;
  customerPhone: string;
  userEmail: string;
  docName: string;
  fileName: string;
  fileUrl: string;
  viewUrl: string;
  fileSize: string | number;
  fileType: string;
  status: string;
  createdAt: string;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("ALL");
  const [selectedDoc, setSelectedDoc] = useState<AdminDocument | null>(null);
  const isImageDocument = (document: AdminDocument) =>
    /\.(png|jpe?g|webp)$/i.test(document.fileName);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      } else {
        notify.error("Failed to fetch user documents.");
      }
    } catch (err) {
      console.error("Admin document fetch error:", err);
      notify.error("Network error fetching user documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.applicationId.toLowerCase().includes(searchTerm.toLowerCase());

      if (docTypeFilter === "ALL") return matchesSearch;
      return matchesSearch && doc.docName.toLowerCase().includes(docTypeFilter.toLowerCase());
    });
  }, [documents, searchTerm, docTypeFilter]);

  const {
    pageItems: paginatedDocuments,
    pageIndex,
    pageSize,
    totalItems,
    totalPages,
    entryStart,
    entryEnd,
    pageSizeOptions,
    setPageIndex,
    setPageSize,
  } = useClientPagination(filteredDocuments, {
    initialPageSize: 10,
    resetDeps: [searchTerm, docTypeFilter],
  });

  const handleUpdateDocumentStatus = (id: string, newStatus: "VERIFIED" | "REJECTED") => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
    notify.success(`Document marked as ${newStatus}`);
    if (selectedDoc?.id === id) {
      setSelectedDoc((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Backoffice Verification Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Uploaded Documents Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Inspect, verify, and audit user-submitted identity, GST, PAN, and trademark files from MySQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDocuments}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold"
            title="Refresh document queue"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Files</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar using Reusable SearchBar Component */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by file, applicant, or ref ID..."
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

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg w-full sm:w-auto overflow-x-auto scrollbar-none">
          {[
            { label: "All Documents", value: "ALL" },
            { label: "Aadhaar / ID", value: "aadhaar" },
            { label: "PAN Card", value: "pan" },
            { label: "Address Proof", value: "address" },
            { label: "Business Proof", value: "business" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDocTypeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                docTypeFilter === tab.value
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Documents Table */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filteredDocuments.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Document Details</th>
                  <th className="p-4">Applicant / Case Ref</th>
                  <th className="p-4">Service</th>
                  <th className="p-4">File Info</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="group relative size-12 shrink-0 overflow-hidden rounded-lg border border-indigo-100 bg-slate-950 text-indigo-300"
                          title={`Preview ${doc.fileName}`}
                        >
                          {isImageDocument(doc) ? (
                            <img src={doc.viewUrl} alt={`Preview of ${doc.fileName}`} className="size-full object-cover" />
                          ) : (
                            <FileText className="absolute inset-0 m-auto size-5" />
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/55 opacity-0 transition-opacity group-hover:opacity-100">
                            <Eye className="size-4 text-white" />
                          </span>
                        </button>
                        <div>
                          <p className="font-bold text-slate-900">{doc.fileName}</p>
                          <span className="text-[11px] text-slate-400 font-semibold">{doc.docName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-800">{doc.customerName}</p>
                      <p className="text-[11px] text-slate-500">{doc.userEmail}</p>
                      <p className="text-[11px] font-mono text-slate-400">{doc.applicationId}</p>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-700">{doc.serviceTitle}</span>
                    </td>

                    <td className="p-4 text-slate-500">
                      <p className="font-mono text-[11px]">{doc.fileType || "application/pdf"}</p>
                      <p className="text-[10px] text-slate-400">{doc.fileSize}</p>
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={
                          doc.status === "VERIFIED"
                            ? "green"
                            : doc.status === "REJECTED"
                            ? "red"
                            : "indigo"
                        }
                        rounded="full"
                        size="sm"
                      >
                        {doc.status}
                      </Badge>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="size-3.5" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => downloadFile(doc.viewUrl, doc.fileName)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Download file to device"
                        >
                          <Download className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden divide-y divide-slate-100">
            {paginatedDocuments.map((doc) => (
              <div key={doc.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDoc(doc)}
                    className="size-12 shrink-0 overflow-hidden rounded-lg border border-indigo-100 bg-slate-950"
                  >
                    {isImageDocument(doc) ? (
                      <img src={doc.viewUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <FileText className="m-auto size-5 text-indigo-300" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-slate-900 truncate">{doc.fileName}</p>
                    <p className="text-[11px] text-slate-500">{doc.docName}</p>
                    <p className="text-[11px] font-semibold text-indigo-600 mt-1">{doc.serviceTitle}</p>
                  </div>
                  <Badge
                    variant={doc.status === "VERIFIED" ? "green" : doc.status === "REJECTED" ? "red" : "indigo"}
                    rounded="full"
                    size="sm"
                  >
                    {doc.status}
                  </Badge>
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <p className="font-bold text-slate-800">{doc.customerName}</p>
                  <p className="truncate">{doc.userEmail}</p>
                  <p className="font-mono text-slate-400">{doc.applicationId}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="flex-1 min-h-[44px] rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadFile(doc.viewUrl, doc.fileName)}
                    className="min-h-[44px] min-w-[44px] rounded-lg border border-slate-200 text-slate-600"
                    aria-label="Download"
                  >
                    <Download className="size-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>

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
          <h3 className="text-base font-bold text-slate-900">No Documents Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? "No uploaded user documents match your search query."
              : "No user documents have been uploaded to MySQL yet."}
          </p>
        </div>
      )}

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-4xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Document Verification Inspector</h3>
                  <p className="text-[11px] text-slate-400">Ref ID: {selectedDoc.applicationId}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="h-[42vh] min-h-72 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 p-2">
              {isImageDocument(selectedDoc) ? (
                <img
                  src={selectedDoc.viewUrl}
                  alt={`Preview of ${selectedDoc.fileName}`}
                  className="size-full object-contain"
                />
              ) : (
                <iframe
                  src={selectedDoc.viewUrl}
                  title={`Preview of ${selectedDoc.fileName}`}
                  className="size-full rounded border-0 bg-white"
                />
              )}
            </div>

            {/* Document Info Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicant</span>
                  <span className="font-bold text-slate-800">{selectedDoc.customerName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Service</span>
                  <span className="font-bold text-indigo-600">{selectedDoc.serviceTitle}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Document Type</span>
                  <span className="font-bold text-slate-700">{selectedDoc.docName}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">File Name</span>
                  <span className="font-mono text-[11px] text-slate-700 truncate block">{selectedDoc.fileName}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200">
                  <CheckCircle2 className="size-3" />
                  <span>Magic Byte Signature Verified</span>
                </span>

                <a
                  href={selectedDoc.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>Open Full File</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleUpdateDocumentStatus(selectedDoc.id, "VERIFIED")}
                  variant="primary"
                  size="sm"
                  className="font-bold text-xs py-2.5 px-4 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Approve Document</span>
                </Button>

                <button
                  onClick={() => handleUpdateDocumentStatus(selectedDoc.id, "REJECTED")}
                  className="px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <XCircle className="size-4" />
                  <span>Reject & Raise Query</span>
                </button>
              </div>

              <Button
                onClick={() => setSelectedDoc(null)}
                variant="outline"
                size="sm"
                className="text-xs font-bold"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
