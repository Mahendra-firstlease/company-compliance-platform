"use client";

import React from "react";
import { FileText, Trash2, Eye, FileCheck } from "lucide-react";
import { UploadedFile } from "./upload-utils";

interface UploadPreviewProps {
  file: UploadedFile;
  onRemove?: () => void;
  onView?: () => void;
  disabled?: boolean;
}

export default function UploadPreview({
  file,
  onRemove,
  onView,
  disabled = false,
}: UploadPreviewProps) {
  const isImage =
    ["PNG", "JPG", "JPEG", "WEBP"].includes((file.type || "").toUpperCase()) ||
    Boolean(file.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ||
    Boolean(file.name?.match(/\.(jpeg|jpg|gif|png|webp)$/i));

  const isPdf =
    Boolean(
      (file.type || "").toUpperCase().includes("PDF") ||
      file.url?.match(/\.pdf($|\?)/i) ||
      file.name?.match(/\.pdf$/i)
    );

  // Ensure view URL routes through inline viewer proxy if it's S3 or private storage
  const viewUrl = file.url
    ? file.url.startsWith("http") || file.url.startsWith("/storage/")
      ? `/api/download?url=${encodeURIComponent(file.url)}&filename=${encodeURIComponent(file.name || "document.pdf")}&disposition=inline`
      : file.url
    : "#";

  return (
    <div className="flex items-center justify-between bg-slate-50/90 border border-slate-200 hover:border-slate-300 rounded-lg p-3 transition-colors">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="size-9 bg-primary/5 text-primary rounded-lg flex items-center justify-center shrink-0 border border-primary/15 font-bold text-xs overflow-hidden">
          {isImage && file.url ? (
            <img
              src={viewUrl}
              alt={file.name}
              className="size-full object-cover rounded-md"
              loading="lazy"
            />
          ) : isPdf ? (
            <div className="flex flex-col items-center justify-center text-rose-600 bg-rose-50 size-full font-bold">
              <FileText size={16} />
              <span className="text-[9px] font-black tracking-tighter -mt-0.5">PDF</span>
            </div>
          ) : isImage ? (
            <FileCheck size={18} className="text-primary" />
          ) : (
            <FileText size={18} className="text-primary" />
          )}
        </div>
        <div className="text-left overflow-hidden">
          <p className="text-xs font-bold text-slate-800 truncate max-w-40 md:max-w-xs">{file.name}</p>
          <p className="text-xs text-slate-500">
            {file.size} &middot; {file.type}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {(onView || file.url) && (
          <a
            href={onView ? "#" : viewUrl}
            target={onView ? undefined : "_blank"}
            rel={onView ? undefined : "noopener noreferrer"}
            onClick={(e) => {
              if (onView) {
                e.preventDefault();
                onView();
              }
            }}
            className="text-slate-500 hover:text-primary hover:bg-primary/5 rounded-lg p-1.5 transition-colors cursor-pointer"
            title="Preview document"
          >
            <Eye size={15} />
          </a>
        )}
        {!disabled && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors cursor-pointer"
            title="Remove document"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
