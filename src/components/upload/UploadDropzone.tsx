"use client";

import React, { useMemo, useCallback } from "react";
import { useDropzone, Accept, FileRejection } from "react-dropzone";
import { UploadCloud, AlertCircle, FileCheck, FileX } from "lucide-react";
import { cn } from "@/lib/utils";
import { dropzoneRejectMessage } from "./upload-size-utils";

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onValidationError?: (message: string | null) => void;
  allowedTypes?: string[];
  maxSizeMb?: number;
  maxSizeBytes?: number;
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
  onValidationError,
  allowedTypes = ["pdf", "png", "jpg", "jpeg"],
  maxSizeMb = 5,
  maxSizeBytes: maxSizeBytesProp,
  disabled = false,
  multiple = false,
  error,
  placeholderText,
}: UploadDropzoneProps) {
  const maxSizeBytes = maxSizeBytesProp ?? maxSizeMb * 1024 * 1024;
  const sizeLabel =
    maxSizeBytes < 1024 * 1024
      ? `${Math.round(maxSizeBytes / 1024)}KB`
      : `${Math.round(maxSizeBytes / (1024 * 1024))}MB`;

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

  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const code = fileRejections[0]?.errors[0]?.code;
        const message = dropzoneRejectMessage(code, allowedTypes, maxSizeBytes);
        onValidationError?.(message);
        return;
      }

      onValidationError?.(null);
      if (acceptedFiles.length > 0 && !disabled) {
        onFilesSelected(multiple ? acceptedFiles : [acceptedFiles[0]]);
      }
    },
    [allowedTypes, maxSizeBytes, onValidationError, disabled, onFilesSelected, multiple]
  );

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop: handleDrop,
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
          "flex flex-col items-center justify-center p-5 rounded-lg text-center transition-colors cursor-pointer select-none outline-1 outline-dashed -outline-offset-1",
          isDragAccept ? "outline-emerald-500 bg-emerald-50/60" : "",
          isDragReject ? "outline-red-500 bg-red-50/60" : "",
          isDragActive && !isDragAccept && !isDragReject ? "outline-primary bg-primary/5" : "",
          error
            ? "outline-red-300 hover:outline-red-400 bg-red-50/10"
            : !isDragActive
            ? "outline-slate-300/80 hover:outline-primary hover:bg-primary/5 bg-slate-50/50"
            : "",
          disabled && "cursor-not-allowed opacity-50 bg-slate-50 outline-slate-200 hover:outline-slate-200"
        )}
      >
        <input {...getInputProps()} />

        {isDragAccept ? (
          <FileCheck size={24} className="mb-1.5 text-emerald-600" />
        ) : isDragReject ? (
          <FileX size={24} className="mb-1.5 text-red-500" />
        ) : (
          <UploadCloud
            size={24}
            className={cn(
              "mb-1.5 transition-colors",
              error ? "text-red-400" : isDragActive ? "text-primary" : "text-slate-500"
            )}
          />
        )}

        <span className="text-xs font-extrabold text-primary">
          {isDragAccept
            ? "Drop files here to attach..."
            : isDragReject
            ? "File format or size restricted!"
            : placeholderText ||
              (multiple ? "Click or drag multiple files here to upload" : "Click or drag file here to upload")}
        </span>

        <span className="text-xs text-slate-500 font-medium mt-1">
          {allowedTypes.join(", ").toUpperCase()} &middot; Max {sizeLabel}
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
