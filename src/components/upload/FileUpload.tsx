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
  onValidationError?: (message: string | null) => void;
  allowedTypes?: string[];
  maxSizeMb?: number;
  maxSizeBytes?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  applicationId?: string;
}

export default function FileUpload({
  value,
  onChange,
  onView,
  onValidationError,
  allowedTypes = ["pdf", "png", "jpg", "jpeg"],
  maxSizeMb = 5,
  maxSizeBytes,
  label,
  error,
  disabled = false,
  applicationId,
}: SingleFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const isUploadingRef = React.useRef(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const setValidationError = (message: string | null) => {
    setLocalError(message);
    onValidationError?.(message);
  };

  const displayError = error || localError;

  const handleFilesSelected = async (files: File[]) => {
    if (isUploadingRef.current) return;
    const file = files[0];
    if (!file) return;
    isUploadingRef.current = true;

    // Purge old S3 object if user is replacing an already uploaded file
    if (value?.key || value?.url) {
      deleteUploadedFile(value.key || value.url).catch(() => {});
    }

    setValidationError(null);
    setIsUploading(true);

    try {
      const effectiveMaxMb = maxSizeBytes ? maxSizeBytes / (1024 * 1024) : maxSizeMb;
      const uploaded = await processSingleFileUpload(
        file,
        label || file.name,
        allowedTypes,
        effectiveMaxMb,
        applicationId,
      );
      if (onChange) {
        onChange(uploaded);
      }
      notify.success({
        title: "File Attached",
        description: `Attached: ${uploaded.name}`,
      });
    } catch (err: any) {
      const message = err?.message || "File upload failed.";
      setValidationError(message);
      notify.error({
        title: "Upload Failed",
        description: message,
      });
    } finally {
      setIsUploading(false);
      isUploadingRef.current = false;
    }
  };

  const handleRemove = async () => {
    // Automatically purge old file from AWS S3 bucket upon removal
    if (value?.key || value?.url) {
      deleteUploadedFile(value.key || value.url).catch(() => {});
    }
    setValidationError(null);
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
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
          onValidationError={setValidationError}
          allowedTypes={allowedTypes}
          maxSizeMb={maxSizeMb}
          maxSizeBytes={maxSizeBytes}
          disabled={disabled}
          multiple={false}
          error={displayError}
        />
      )}

      {displayError && value && (
        <p className="text-xs text-red-500 font-semibold mt-1" role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}
