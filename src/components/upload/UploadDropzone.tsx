"use client";

import React, { useMemo } from "react";
import { useDropzone, Accept } from "react-dropzone";
import { UploadCloud, AlertCircle, FileCheck, FileX } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  allowedTypes?: string[];
  maxSizeMb?: number;
  disabled?: boolean;
  multiple?: boolean;
  error?: string | null;
  placeholderText?: string;
}

const MIME_ACCEPT_MAP: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export default function UploadDropzone({
  onFilesSelected,
  allowedTypes = ["pdf", "png", "jpg", "jpeg"],
  maxSizeMb = 5,
  disabled = false,
  multiple = false,
  error,
  placeholderText,
}: UploadDropzoneProps) {
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const acceptMap = useMemo<Accept>(() => {
    const acc: Record<string, string[]> = {};
    allowedTypes.forEach((ext) => {
      const mime = MIME_ACCEPT_MAP[ext.toLowerCase()];
      if (mime) {
        if (!acc[mime]) acc[mime] = [];
        acc[mime].push(`.${ext}`);
      }
    });
    return acc as Accept;
  }, [allowedTypes]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0 && !disabled) {
        onFilesSelected(multiple ? acceptedFiles : [acceptedFiles[0]]);
      }
    },
    accept: acceptMap,
    maxSize: maxSizeBytes,
    disabled,
    multiple,
  });

  return (
    <div className="space-y-1 w-full">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-lg text-center transition-all cursor-pointer select-none",
          isDragAccept ? "border-emerald-500 bg-emerald-50/60 scale-[1.01]" : "",
          isDragReject ? "border-red-500 bg-red-50/60" : "",
          isDragActive && !isDragAccept && !isDragReject ? "border-indigo-500 bg-indigo-50/60 scale-[1.01]" : "",
          error
            ? "border-red-300 hover:border-red-400 bg-red-50/10"
            : !isDragActive
            ? "border-slate-300 hover:border-indigo-500 hover:bg-slate-50/50"
            : "",
          disabled && "cursor-not-allowed opacity-50 bg-slate-50 border-slate-200 hover:border-slate-200"
        )}
      >
        <input {...getInputProps()} />

        {isDragAccept ? (
          <FileCheck size={24} className="mb-1.5 text-emerald-600 animate-bounce" />
        ) : isDragReject ? (
          <FileX size={24} className="mb-1.5 text-red-500 animate-pulse" />
        ) : (
          <UploadCloud
            size={24}
            className={cn(
              "mb-1.5 transition-colors",
              error ? "text-red-400" : isDragActive ? "text-indigo-600" : "text-slate-400"
            )}
          />
        )}

        <span className="text-xs font-extrabold text-indigo-700">
          {isDragAccept
            ? "Drop files here to attach..."
            : isDragReject
            ? "File format or size restricted!"
            : placeholderText ||
              (multiple ? "Click or drag multiple files here to upload" : "Click or drag file here to upload")}
        </span>

        <span className="text-[11px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">
          {allowedTypes.join(", ").toUpperCase()} max {maxSizeMb}MB
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold mt-1">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
