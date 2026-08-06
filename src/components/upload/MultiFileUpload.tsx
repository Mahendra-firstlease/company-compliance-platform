"use client";

import React, { useState } from "react";
import { notify } from "@/lib/notify";
import { UploadedFile, processSingleFileUpload } from "./upload-utils";
import UploadDropzone from "./UploadDropzone";
import UploadPreview from "./UploadPreview";
import UploadProgress from "./UploadProgress";

export interface MultiFileUploadProps {
  value?: UploadedFile[];
  onChange?: (files: UploadedFile[]) => void;
  allowedTypes?: string[];
  maxSizeMb?: number;
  maxFiles?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  applicationId?: string;
  convertToPdf?: boolean;
}

export default function MultiFileUpload({
  value = [],
  onChange,
  allowedTypes = ["pdf", "png", "jpg", "jpeg"],
  maxSizeMb = 5,
  maxFiles = 10,
  label,
  error,
  disabled = false,
  applicationId,
  convertToPdf = false,
}: MultiFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const currentFiles = Array.isArray(value) ? value : [];
  const displayError = error || localError;

  const handleFilesSelected = async (files: File[]) => {
    setLocalError(null);

    // Limit check
    if (currentFiles.length + files.length > maxFiles) {
      const errStr = `Cannot attach more than ${maxFiles} files (currently attached ${currentFiles.length}).`;
      setLocalError(errStr);
      notify.error({ title: "Limit Exceeded", description: errStr });
      return;
    }

    setIsUploading(true);
    setUploadProgressText(`Uploading ${files.length} ${files.length === 1 ? "file" : "files"}...`);

    try {
      // Process all files in parallel
      const uploadPromises = files.map((f) =>
        processSingleFileUpload(f, label || f.name, allowedTypes, maxSizeMb, applicationId, convertToPdf)
      );

      const results = await Promise.allSettled(uploadPromises);

      const successfulFiles: UploadedFile[] = [];
      let failCount = 0;

      results.forEach((res) => {
        if (res.status === "fulfilled") {
          successfulFiles.push(res.value);
        } else {
          failCount++;
        }
      });

      if (successfulFiles.length > 0) {
        const updatedList = [...currentFiles, ...successfulFiles];
        if (onChange) {
          onChange(updatedList);
        }
        notify.success({
          title: "Files Attached",
          description: `Successfully attached ${successfulFiles.length} file(s).`,
        });
      }

      if (failCount > 0) {
        const errStr = `${failCount} file(s) failed security checks or upload limits.`;
        setLocalError(errStr);
        notify.error({ title: "Partial Upload Failure", description: errStr });
      }
    } catch (err: any) {
      setLocalError(err.message || "Failed to process multi-file upload.");
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setLocalError(null);
    const updated = currentFiles.filter((_, idx) => idx !== indexToRemove);
    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[11px] font-bold text-slate-400">
            {currentFiles.length} / {maxFiles} Files
          </span>
        </div>
      )}

      {/* Attachment List Preview */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          {currentFiles.map((file, idx) => (
            <UploadPreview
              key={file.id || `${file.name}_${idx}`}
              file={file}
              onRemove={() => handleRemoveFile(idx)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && <UploadProgress progressMessage={uploadProgressText} />}

      {/* Upload Dropzone (hidden if maxFiles limit reached) */}
      {!disabled && currentFiles.length < maxFiles && !isUploading && (
        <UploadDropzone
          onFilesSelected={handleFilesSelected}
          allowedTypes={allowedTypes}
          maxSizeMb={maxSizeMb}
          disabled={disabled}
          multiple={true}
          error={displayError}
          placeholderText={`Click or drag files here to upload (max ${maxFiles} files)`}
        />
      )}
    </div>
  );
}
