"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  ShieldCheck,
  Eye,
  CheckCircle2,
  Lock,
  ExternalLink,
  RefreshCw,
  PlusCircle,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/common/Button";
import SearchBar from "@/components/common/SearchBar";
import Badge from "@/components/ui/Badge/Badge";
import { ServicesGridSkeleton } from "@/components/ui/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { getApplications, ApplicationCase } from "@/lib/applications";
import { notify } from "@/lib/notify";

interface VaultDocument {
  id: string;
  docName: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  serviceTitle: string;
  serviceSlug: string;
  applicationId: string;
  status: string;
  fileUrl?: string;
  uploadedAt: string;
}

export default function UserDocumentsVaultPage() {
  const [cases, setCases] = useState<ApplicationCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedDoc, setSelectedDoc] = useState<VaultDocument | null>(null);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const data = await getApplications();
      setCases(data);
    } catch (err) {
      console.error("Failed to load vault documents:", err);
      notify.error("Error loading documents vault.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Map case documents into a unified list of vault documents
  const allVaultDocuments = useMemo(() => {
    const list: VaultDocument[] = [];

    cases.forEach((c) => {
      if (c.uploadedDocs && Object.keys(c.uploadedDocs).length > 0) {
        Object.entries(c.uploadedDocs).forEach(([docName, file], idx) => {
          list.push({
            id: `${c.id}-${docName}-${idx}`,
            docName: docName,
            fileName: file.name,
            fileSize: typeof file.size === "number" ? `${(file.size / 1024).toFixed(1)} KB` : String(file.size || "Unknown"),
            fileType: file.type || "PDF / Document",
            serviceTitle: c.serviceTitle,
            serviceSlug: c.serviceSlug,
            applicationId: c.id,
            status: c.status === "APPROVED" ? "VERIFIED" : "REGISTERED",
            fileUrl: file.url,
            uploadedAt: new Date(c.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          });
        });
      }
    });

    return list;
  }, [cases]);

  // Filtered vault documents
  const filteredDocuments = useMemo(() => {
    return allVaultDocuments.filter((doc) => {
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.serviceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.applicationId.toLowerCase().includes(searchTerm.toLowerCase());

      if (categoryFilter === "ALL") return matchesSearch;
      if (categoryFilter === "IDENTITY")
        return (
          matchesSearch &&
          (doc.docName.toLowerCase().includes("aadhaar") || doc.docName.toLowerCase().includes("pan"))
        );
      if (categoryFilter === "BUSINESS")
        return (
          matchesSearch &&
          (doc.docName.toLowerCase().includes("business") ||
            doc.docName.toLowerCase().includes("address") ||
            doc.docName.toLowerCase().includes("cheque"))
        );
      if (categoryFilter === "VERIFIED") return matchesSearch && doc.status === "VERIFIED";

      return matchesSearch;
    });
  }, [allVaultDocuments, searchTerm, categoryFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-lg bg-slate-900 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 size-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Lock className="size-3.5 text-indigo-400" />
              <span>256-Bit Encrypted AWS S3 Vault</span>
            </span>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Digital Document Chest
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              Permanent cloud vault storing all identity proofs, address documents, and approved certificates registered with your statutory filings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCases}
              className="p-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold"
              title="Refresh vault"
            >
              <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh Vault</span>
            </button>

            <Link href="/services">
              <Button variant="primary" size="sm" className="font-bold text-xs py-2.5 px-4 cursor-pointer flex items-center gap-1.5">
                <PlusCircle className="size-4" />
                <span>Upload New Case Docs</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Files Vaulted</span>
            <p className="text-xl font-black text-white">{allVaultDocuments.length}</p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Documents</span>
            <p className="text-xl font-black text-emerald-400">
              {allVaultDocuments.filter((d) => d.status === "VERIFIED").length}
            </p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Active Filings</span>
            <p className="text-xl font-black text-indigo-400">{cases.length}</p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Security Protocol</span>
            <p className="text-xs font-bold text-indigo-300 flex items-center gap-1 mt-1">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Magic-Byte Verified</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Reusable SearchBar Component */}
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by file name, doc type or ref ID..."
            size="sm"
            fullWidth={true}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
          {[
            { label: "All Files", value: "ALL" },
            { label: "Identity Proofs", value: "IDENTITY" },
            { label: "Business Proofs", value: "BUSINESS" },
            { label: "Verified Certificates", value: "VERIFIED" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === tab.value
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vault Grid */}
      {isLoading ? (
        <ServicesGridSkeleton count={6} />
      ) : filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="size-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    <FileText className="size-5" />
                  </div>

                  <Badge
                    variant={doc.status === "VERIFIED" ? "green" : "indigo"}
                    rounded="full"
                    size="sm"
                  >
                    {doc.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-xs text-slate-900 truncate" title={doc.docName}>
                    {doc.docName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5" title={doc.fileName}>
                    {doc.fileName}
                  </p>
                  <span className="text-[10px] font-bold text-indigo-600 block mt-1">
                    {doc.serviceTitle}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="group relative h-24 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
                  title={`Preview ${doc.fileName}`}
                >
                  {doc.fileUrl && /\.(png|jpe?g|webp)$/i.test(doc.fileName) ? (
                    <img
                      src={doc.fileUrl}
                      alt={`Preview of ${doc.fileName}`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center gap-2 text-slate-500">
                      <FileText className="size-7 text-indigo-500" />
                      <span className="text-[11px] font-bold">{doc.fileType.includes("PDF") ? "PDF document" : "Document"}</span>
                    </div>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-2 py-1 text-center text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    Click to preview
                  </span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-semibold">{doc.fileSize}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                          title="Preview file"
                  >
                    <Eye className="size-4" />
                  </button>

                  <Link href={`/applications/${doc.serviceSlug}`}>
                    <button
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Open application workspace"
                    >
                      <ExternalLink className="size-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <div className="size-12 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
              <FileCheck2 className="size-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Documents in Vault</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? "No vaulted documents match your search parameters."
                : "Complete a statutory application workspace to register your identity and business documents."}
            </p>
            <Link href="/services">
              <Button variant="primary" size="sm" className="font-bold text-xs py-2.5 px-5 cursor-pointer">
                Browse Statutory Services
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Document Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Vault Document Preview</h3>
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

            <div className="h-72 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
              {selectedDoc.fileUrl ? (
                /\.(png|jpe?g|webp)$/i.test(selectedDoc.fileName) ? (
                  <img
                    src={selectedDoc.fileUrl}
                    alt={`Preview of ${selectedDoc.fileName}`}
                    className="size-full object-contain"
                  />
                ) : (
                  <iframe
                    src={selectedDoc.fileUrl}
                    title={`Preview of ${selectedDoc.fileName}`}
                    className="size-full border-0 bg-white"
                  />
                )
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-center text-slate-300">
                  <FileText className="size-8" />
                  <p className="text-xs font-semibold">A preview is not available for this file.</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Document Type</span>
                <span className="font-bold text-slate-900">{selectedDoc.docName}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Original File Name</span>
                <span className="font-mono text-indigo-600 font-bold">{selectedDoc.fileName}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Statutory Filing</span>
                <span className="font-bold text-slate-800">{selectedDoc.serviceTitle}</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  <span>Magic Byte Verified</span>
                </span>

                <span className="text-slate-400 text-[10px] font-semibold">Uploaded: {selectedDoc.uploadedAt}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link href={`/applications/${selectedDoc.serviceSlug}`}>
                <Button variant="outline" size="sm" className="text-xs font-bold">
                  Open Workspace
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                {selectedDoc.fileUrl && (
                  <a href={selectedDoc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" size="sm" className="text-xs font-bold">
                      Open full file
                    </Button>
                  </a>
                )}
                <Button onClick={() => setSelectedDoc(null)} variant="outline" size="sm" className="text-xs font-bold">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
