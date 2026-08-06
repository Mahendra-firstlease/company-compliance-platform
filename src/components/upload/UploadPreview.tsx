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
    Boolean(file.url?.match(/\.(jpeg|jpg|gif|png|webp)$/i));

  return (
    <div className="flex items-center justify-between bg-slate-50/90 border border-slate-200 hover:border-slate-300 rounded-lg p-3 transition-colors shadow-2xs">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="size-9 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center shrink-0 border border-indigo-100 font-bold text-xs">
          {isImage ? <FileCheck size={18} className="text-indigo-600" /> : <FileText size={18} className="text-indigo-600" />}
        </div>
        <div className="text-left overflow-hidden">
          <p className="text-xs font-bold text-slate-800 truncate max-w-40 md:max-w-xs">{file.name}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {file.size} &middot; {file.type}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {(onView || file.url) && (
          <a
            href={file.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (onView) {
                e.preventDefault();
                onView();
              }
            }}
            className="text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg p-1.5 transition-colors cursor-pointer"
            title="Preview document"
          >
            <Eye size={15} />
          </a>
        )}
        {!disabled && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-colors cursor-pointer"
            title="Remove document"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
