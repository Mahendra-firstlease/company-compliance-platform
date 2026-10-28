"use client";

import React from "react";
import { FileText, ExternalLink, Download } from "lucide-react";
import { downloadFile, getInlineViewUrl } from "@/utils/download";

interface FieldValueProps {
  value: any;
  compact?: boolean;
  className?: string;
}

function formatDocName(name: string): string {
  const words = name
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : name;
}

export default function FieldValue({ value, compact = false, className = "" }: FieldValueProps) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400 italic">N/A</span>;
  }

  // 1. Handle Boolean
  if (typeof value === "boolean") {
    return (
      <span className={`font-bold ${value ? "text-emerald-700" : "text-slate-600"} ${className}`}>
        {value ? "Yes" : "No"}
      </span>
    );
  }

  // 2. Handle Arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-slate-400 italic">None</span>;
    }
    return (
      <div className="flex flex-col gap-1.5">
        {value.map((item, index) => (
          <FieldValue key={index} value={item} compact={compact} className={className} />
        ))}
      </div>
    );
  }

  // 3. Handle Objects (Uploaded File Meta, Front/Back scans, Document Maps, or Generic Objects)
  if (typeof value === "object") {
    // A. Front-Back scan document object
    if (value.frontUrl || value.backUrl || value.front?.url || value.back?.url) {
      const frontHref = value.frontUrl || value.front?.url;
      const backHref = value.backUrl || value.back?.url;

      return (
        <div className="flex flex-wrap gap-2 items-center">
          {frontHref && (
            <button
              type="button"
              onClick={() => downloadFile(frontHref, "Front_Scan.pdf")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-light hover:bg-primary-light text-primary font-bold border border-primary-border text-xs transition-colors cursor-pointer"
            >
              <FileText size={13} className="text-primary shrink-0" />
              <span>Front Scan</span>
              <Download size={10} className="opacity-70 shrink-0" />
            </button>
          )}
          {backHref && (
            <button
              type="button"
              onClick={() => downloadFile(backHref, "Back_Scan.pdf")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-light hover:bg-primary-light text-primary font-bold border border-primary-border text-xs transition-colors cursor-pointer"
            >
              <FileText size={13} className="text-primary shrink-0" />
              <span>Back Scan</span>
              <Download size={10} className="opacity-70 shrink-0" />
            </button>
          )}
        </div>
      );
    }

    // B. Single document file object with url or fileUrl or path
    const fileUrl = value.url || value.fileUrl || value.path || value.location;
    const fileName = value.name || value.fileName || value.filename || value.title || "Uploaded_Document.pdf";

    if (fileUrl) {
      const isPdf = Boolean(
        fileName.toLowerCase().endsWith(".pdf") ||
        (value.type && String(value.type).toUpperCase().includes("PDF")) ||
        fileUrl.toLowerCase().includes(".pdf")
      );
      const inlineHref = getInlineViewUrl(fileUrl, fileName);

      if (compact) {
        return (
          <div className="inline-flex items-center gap-1 text-xs">
            <FileText size={12} className={isPdf ? "shrink-0 text-rose-600" : "shrink-0 text-primary"} />
            <a
              href={inlineHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold truncate max-w-32"
            >
              {fileName}
            </a>
            <button
              type="button"
              onClick={() => downloadFile(fileUrl, fileName)}
              className="shrink-0 opacity-70 hover:opacity-100 text-slate-500 hover:text-primary p-0.5 cursor-pointer"
              title={`Download ${fileName}`}
            >
              <Download size={10} />
            </button>
          </div>
        );
      }

      return (
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-light hover:bg-primary-light/80 text-primary font-bold border border-primary-border text-xs transition-all max-w-full group"
          title={fileName}
        >
          <FileText size={14} className={isPdf ? "shrink-0 text-rose-600" : "shrink-0 text-primary"} />
          <a
            href={inlineHref}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate hover:underline"
          >
            {fileName}
          </a>
          {value.size && <span className="text-[11px] text-primary font-normal shrink-0">({value.size})</span>}
          <button
            type="button"
            onClick={() => downloadFile(fileUrl, fileName)}
            className="shrink-0 opacity-70 hover:opacity-100 hover:text-primary transition-opacity p-0.5 cursor-pointer"
            title={`Download ${fileName}`}
          >
            <Download size={11} />
          </button>
        </div>
      );
    }

    // C. Document Map / Collection (e.g. _uploadedDocs or { [docKey]: { url, name, size } })
    const entries = Object.entries(value);
    const isDocMap =
      entries.length > 0 &&
      entries.every(([, item]) => {
        if (!item || typeof item !== "object") return false;
        const candidate = item as Record<string, any>;
        return Boolean(
          candidate.url ||
            candidate.fileUrl ||
            candidate.path ||
            candidate.location ||
            candidate.frontUrl ||
            candidate.backUrl ||
            candidate.front?.url ||
            candidate.back?.url ||
            (candidate.name && (candidate.size || candidate.type))
        );
      });

    if (isDocMap) {
      return (
        <div className={`flex flex-wrap gap-1.5 items-center ${className}`}>
          {entries.map(([docKey, docVal]) => {
            const formattedDocName = formatDocName(docKey);
            const item = docVal as Record<string, any>;
            const docUrl = item.url || item.fileUrl || item.path || item.location;
            const docFileName = item.name || item.fileName || formattedDocName;

            if (docUrl) {
              const isPdf = Boolean(
                docFileName.toLowerCase().endsWith(".pdf") ||
                item.type?.toUpperCase().includes("PDF") ||
                docUrl.toLowerCase().includes(".pdf")
              );
              const inlineHref = getInlineViewUrl(docUrl, docFileName);

              return (
                <div
                  key={docKey}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-light hover:bg-primary-light/80 text-primary font-bold border border-primary-border text-[11px] transition-colors group"
                  title={`${formattedDocName}: ${docFileName}${item.size ? ` (${item.size})` : ""}`}
                >
                  <FileText size={11} className={isPdf ? "text-rose-600 shrink-0" : "text-primary shrink-0"} />
                  <span className="font-semibold text-slate-700">{formattedDocName}:</span>
                  <a
                    href={inlineHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate max-w-28 text-primary hover:underline"
                  >
                    {docFileName}
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadFile(docUrl, docFileName)}
                    className="opacity-70 hover:opacity-100 hover:text-primary transition-opacity cursor-pointer p-0.5"
                    title={`Download ${docFileName}`}
                  >
                    <Download size={10} className="shrink-0" />
                  </button>
                </div>
              );
            }

            return (
              <span
                key={docKey}
                className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
              >
                <FileText size={11} className="text-slate-400 shrink-0" />
                <span className="font-medium">{formattedDocName}</span>
              </span>
            );
          })}
        </div>
      );
    }

    // D. Object with name/title but no URL
    if (value.name || value.title || value.label) {
      return (
        <span className={`font-bold text-slate-800 ${className}`}>
          {value.name || value.title || value.label}
        </span>
      );
    }

    // E. Empty Object
    if (entries.length === 0) {
      return (
        <span className="text-slate-400 font-normal italic text-xs">
          None
        </span>
      );
    }

    // F. Generic Object fallback (render formatted key-value pills instead of raw JSON string)
    return (
      <div className={`inline-flex flex-wrap gap-1 items-center ${className}`}>
        {entries.map(([subKey, subVal]) => {
          const formattedSubKey = formatDocName(subKey);
          return (
            <span
              key={subKey}
              className="text-[11px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1 border border-slate-200/60"
            >
              <span className="text-slate-500">{formattedSubKey}:</span>
              <span className="font-semibold text-slate-800">
                {typeof subVal === "object" ? (
                  <FieldValue value={subVal} compact={true} />
                ) : (
                  String(subVal ?? "")
                )}
              </span>
            </span>
          );
        })}
      </div>
    );
  }

  // 4. Handle String / Number / Primitives
  const strVal = String(value);

  // Check if string is an HTTP/HTTPS or local upload URL
  if (
    strVal.startsWith("http://") ||
    strVal.startsWith("https://") ||
    strVal.startsWith("blob:") ||
    strVal.startsWith("/uploads/")
  ) {
    return (
      <a
        href={strVal}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-light hover:bg-primary-light text-primary font-bold border border-primary-border text-xs transition-colors"
      >
        <FileText size={13} className="text-primary shrink-0" />
        <span>View Attachment</span>
        <ExternalLink size={10} className="opacity-70 shrink-0" />
      </a>
    );
  }

  return <span className={className}>{strVal}</span>;
}
