"use client";

import React, { useState } from "react";
import { notify } from "@/lib/notify";
import { UploadedFile, processSingleFileUpload, deleteUploadedFile } from "./upload-utils";
import UploadDropzone from "./UploadDropzone";
import UploadPreview from "./UploadPreview";
import UploadProgress from "./UploadProgress";

export interface SingleFileUploadProps {
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
}: SingleFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error || localError;

  const handleFilesSelected = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    // Purge old S3 object if user is replacing an already uploaded file
    if (value?.key || value?.url) {
      deleteUploadedFile(value.key || value.url).catch(() => {});
    }

    setLocalError(null);
    setIsUploading(true);

    try {
      const uploaded = await processSingleFileUpload(file, label || file.name, allowedTypes, maxSizeMb);
      if (onChange) {
        onChange(uploaded);
      }
      notify.success({
        title: "File Attached",
        description: `Attached: ${uploaded.name}`,
      });
    } catch (err: any) {
      setLocalError(err.message || "File upload failed.");
      notify.error({
        title: "Upload Failed",
        description: err.message || "File upload failed.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    // Automatically purge old file from AWS S3 bucket upon removal
    if (value?.key || value?.url) {
      deleteUploadedFile(value.key || value.url).catch(() => {});
    }
    setLocalError(null);
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </label>
      )}

      {value ? (
        <UploadPreview file={value} onRemove={handleRemove} onView={onView} disabled={disabled} />
      ) : isUploading ? (
        <UploadProgress />
      ) : (
        <UploadDropzone
          onFilesSelected={handleFilesSelected}
          allowedTypes={allowedTypes}
          maxSizeMb={maxSizeMb}
          disabled={disabled}
          multiple={false}
          error={displayError}
        />
      )}
    </div>
  );
}
