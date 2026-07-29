"use client";

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
        doc.applicationId.toLowerCase().includes(searchTerm.toLowerCase());

      if (docTypeFilter === "ALL") return matchesSearch;
      return matchesSearch && doc.docName.toLowerCase().includes(docTypeFilter.toLowerCase());
    });
  }, [documents, searchTerm, docTypeFilter]);

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Reusable SearchBar Component */}
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by file, applicant, or ref ID..."
            size="sm"
            fullWidth={true}
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
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
          <div className="overflow-x-auto">
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
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                          <FileText className="size-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doc.fileName}</p>
                          <span className="text-[11px] text-slate-400 font-semibold">{doc.docName}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-800">{doc.customerName}</p>
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
                          <span>Inspect</span>
                        </button>

                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Open/Download file"
                        >
                          <Download className="size-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
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
                  href={selectedDoc.fileUrl}
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
