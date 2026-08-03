"use client";

import React from "react";
import { FileText, ExternalLink, Download } from "lucide-react";

interface FieldValueProps {
  value: any;
  compact?: boolean;
  className?: string;
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

  // 3. Handle Objects (Uploaded File Meta, Front/Back scans, or Generic JSON)
  if (typeof value === "object") {
    // A. Front-Back scan document object
    if (value.frontUrl || value.backUrl || value.front?.url || value.back?.url) {
      const frontHref = value.frontUrl || value.front?.url;
      const backHref = value.backUrl || value.back?.url;

      return (
        <div className="flex flex-wrap gap-2 items-center">
          {frontHref && (
            <a
              href={frontHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200/80 text-xs transition-colors"
            >
              <FileText size={13} className="text-indigo-600 shrink-0" />
              <span>Front Scan</span>
              <ExternalLink size={10} className="opacity-70 shrink-0" />
            </a>
          )}
          {backHref && (
            <a
              href={backHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200/80 text-xs transition-colors"
            >
              <FileText size={13} className="text-indigo-600 shrink-0" />
              <span>Back Scan</span>
              <ExternalLink size={10} className="opacity-70 shrink-0" />
            </a>
          )}
        </div>
      );
    }

    // B. Single document file object with url or fileUrl or path
    const fileUrl = value.url || value.fileUrl || value.path || value.location;
    const fileName = value.name || value.fileName || value.filename || value.title || "View Uploaded Document";

    if (fileUrl) {
      if (compact) {
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-indigo-700 hover:underline font-bold text-xs"
          >
            <FileText size={12} className="shrink-0 text-indigo-600" />
            <span className="truncate max-w-32">{fileName}</span>
            <ExternalLink size={10} className="shrink-0 opacity-70" />
          </a>
        );
      }

      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200/80 text-xs transition-all max-w-full group"
          title={fileName}
        >
          <FileText size={14} className="shrink-0 text-indigo-600 group-hover:scale-110 transition-transform" />
          <span className="truncate">{fileName}</span>
          {value.size && <span className="text-[10px] text-indigo-500 font-normal shrink-0">({value.size})</span>}
          <ExternalLink size={11} className="shrink-0 opacity-70 group-hover:opacity-100" />
        </a>
      );
    }

    // C. Object with name/title but no URL
    if (value.name || value.title || value.label) {
      return (
        <span className={`font-bold text-slate-800 ${className}`}>
          {value.name || value.title || value.label}
        </span>
      );
    }

    // D. Generic Object fallback
    return (
      <span className="font-mono text-slate-800 text-[11px] break-all">
        {JSON.stringify(value)}
      </span>
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
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200/80 text-xs transition-colors"
      >
        <FileText size={13} className="text-indigo-600 shrink-0" />
        <span>View Attachment</span>
        <ExternalLink size={10} className="opacity-70 shrink-0" />
      </a>
    );
  }

  return <span className={className}>{strVal}</span>;
}
