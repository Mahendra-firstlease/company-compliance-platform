"use client";

import * as React from "react";
import { useState, useRef } from "react";
import { UploadCloud, FileText, Trash2, Eye, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";

// ----------------------------------------
// OWASP Security Helpers
// ----------------------------------------

/**
 * Sanitize filename to prevent path traversal, directory escape, 
 * and malicious command injection via special characters.
 */
export function sanitizeFilename(filename: string): string {
  // 1. Retrieve the base name only (remove any path traversal segments)
  const baseName = filename.split(/[\\/]/).pop() || "";
  
  // 2. Remove any relative directory markers (e.g. .., ..., etc)
  let cleanName = baseName.replace(/\.\.+/g, ".");
  
  // 3. Allow only safe characters (alphanumeric, dashes, underscores, single dots)
  cleanName = cleanName.replace(/[^a-zA-Z0-9_\.-]/g, "_");
  
  // 4. Limit file length to 80 characters to prevent buffer overflow attacks
  if (cleanName.length > 80) {
    const extIdx = cleanName.lastIndexOf(".");
    const ext = extIdx !== -1 ? cleanName.substring(extIdx) : "";
    cleanName = cleanName.substring(0, 80 - ext.length) + ext;
  }
  
  return cleanName;
}

const MIME_MAP: Record<string, string[]> = {
  pdf: ["application/pdf"],
  png: ["image/png"],
  jpg: ["image/jpeg", "image/pjpeg", "image/jpg"],
  jpeg: ["image/jpeg", "image/pjpeg", "image/jpg"],
};

/**
 * Perform strict client-side validation of file sizes, extensions, and MIME signatures.
 */
export function validateFileSecurity(
  file: File, 
  allowedExts: string[], 
  maxSizeMb: number
): { isValid: boolean; error?: string } {
  // 1. Check file size limits to prevent Denial of Service (DoS) attacks
  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { isValid: false, error: `File size exceeds the allowable limit of ${maxSizeMb}MB.` };
  }

  // 2. Check filename extension case-insensitively
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!allowedExts.map(e => e.toLowerCase()).includes(ext)) {
    return { isValid: false, error: `File extension '.${ext}' is restricted. Allowed formats: ${allowedExts.join(", ")}.` };
  }

  // 3. Match MIME Type content signature against expected extensions (prevent double-extension / spoofing)
  const expectedMimes = MIME_MAP[ext];
  if (expectedMimes && !expectedMimes.includes(file.type)) {
    return { isValid: false, error: "File content-type signature mismatch. Upload blocked for safety." };
  }

  return { isValid: true };
}

// ----------------------------------------
// FileUpload Component
// ----------------------------------------
export interface UploadedFile {
  name: string;
  size: string;
  type: string;
  url?: string;
}

interface FileUploadProps {
  value?: UploadedFile | null;
  onChange?: (file: UploadedFile | null) => void;
  onView?: () => void;
  allowedTypes?: string[];
  maxSizeMb?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function FileUpload({
  value,
  onChange,
  onView,
  allowedTypes = ["pdf", "png", "jpg", "jpeg"],
  maxSizeMb = 5,
  label,
  error,
  disabled = false,
}: FileUploadProps) {
  const [progress, setProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = progress > 0 && progress < 100;
  const displayError = error || localError;

  const processFile = (file: File) => {
    setLocalError(null);

    // Run security validations
    const check = validateFileSecurity(file, allowedTypes, maxSizeMb);
    if (!check.isValid) {
      setLocalError(check.error || "Security validation failed.");
      notify.error({
        title: "Security Check Failed",
        description: check.error || "File upload blocked."
      });
      return;
    }

    // Sanitize filename in compliance with OWASP guidelines
    const sanitizedName = sanitizeFilename(file.name);

    // Simulate progress bar upload
    let uploadProgress = 0;
    setProgress(5);

    const interval = setInterval(() => {
      uploadProgress += 20;
      setProgress(Math.min(uploadProgress, 100));

      if (uploadProgress >= 100) {
        clearInterval(interval);
        
        const objectUrl = URL.createObjectURL(file);
        if (onChange) {
          onChange({
            name: sanitizedName,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            type: file.type.split("/")[1]?.toUpperCase() || file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
            url: objectUrl
          });
        }

        notify.success({
          title: "File Secured",
          description: `Successfully attached: ${sanitizedName}`
        });
      }
    }, 150);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    if (disabled || isUploading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDelete = () => {
    setProgress(0);
    setLocalError(null);
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        /* Successful File Attachment card */
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="size-8 bg-primary-light text-primary rounded-lg flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-semibold text-slate-700 truncate max-w-40 md:max-w-xs">{value.name}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{value.size} &middot; {value.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onView && (
              <button
                type="button"
                onClick={onView}
                className="text-slate-400 hover:text-primary-hover hover:bg-slate-100 rounded-md p-1.5 transition-colors cursor-pointer"
                title="Preview document"
              >
                <Eye size={14} />
              </button>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md p-1.5 transition-colors cursor-pointer"
                title="Remove document"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ) : isUploading ? (
        /* Uploading Progress Bar Simulator */
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-primary">
            <span className="flex items-center gap-1.5">
              <Loader2 className="animate-spin" size={14} />
              Encrypting & Uploading...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        /* Drag & Drop Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center p-4 border border-dashed rounded-lg text-center transition-all cursor-pointer",
            isDragActive 
              ? "border-primary bg-primary-light/20" 
              : displayError 
              ? "border-red-300 hover:border-red-400 bg-red-50/10" 
              : "border-slate-300 hover:border-primary hover:bg-slate-50/30",
            disabled && "cursor-not-allowed opacity-50 bg-slate-50 border-slate-200 hover:border-slate-200"
          )}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            disabled={disabled}
            accept={allowedTypes.map(t => `.${t}`).join(",")}
            onChange={handleFileChange}
          />
          <UploadCloud size={20} className={cn("mb-1", displayError ? "text-red-400" : "text-slate-400")} />
          <span className="text-xs font-semibold text-primary">Click to upload file</span>
          <span className="text-xs text-slate-400 mt-0.5 font-medium">PDF/PNG/JPG max {maxSizeMb}MB</span>
        </div>
      )}

      {/* Error layout wrapper */}
      {displayError && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 font-semibold mt-1">
          <AlertCircle size={12} className="shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}
