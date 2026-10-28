"use client";

import { useState } from "react";
import { UploadRuleConfig } from "@/types/form-config.types";
import { useModal } from "@/components/ui/overlay";
import FileUpload from "@/components/upload/FileUpload";
import { UploadedFile } from "@/components/upload/upload-utils";
import { ExternalLink, Download, FileText } from "lucide-react";
import { downloadFile } from "@/utils/download";

interface DynamicUploadProps {
  id: string;
  label: string;
  description?: string;
  type: "file" | "multi-file" | "front-back-file";
  uploadRule?: UploadRuleConfig;
  frontRule?: UploadRuleConfig;
  backRule?: UploadRuleConfig;
  value?: any;
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
  applicationId?: string;
  onUploadError?: (message: string | null) => void;
}

export default function DynamicUpload({
  id,
  label,
  description,
  type,
  uploadRule,
  frontRule,
  backRule,
  value,
  onChange,
  disabled = false,
  error,
  applicationId,
  onUploadError,
}: DynamicUploadProps) {
  if (type === "front-back-file") {
    return (
      <FrontBackUploadZone
        label={label}
        description={description}
        frontRule={frontRule || uploadRule!}
        backRule={backRule || uploadRule!}
        value={value || { frontUrl: "", backUrl: "", front: null, back: null }}
        onChange={onChange}
        disabled={disabled}
        error={error}
        applicationId={applicationId}
        onUploadError={onUploadError}
      />
    );
  }

  return (
    <SingleUploadZone
      id={id}
      label={label}
      description={description}
      uploadRule={uploadRule!}
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
      applicationId={applicationId}
      onUploadError={onUploadError}
    />
  );
}

function SingleUploadZone({
  id,
  label,
  description,
  uploadRule,
  value,
  onChange,
  disabled = false,
  error,
  applicationId,
  onUploadError,
}: {
  id: string;
  label: string;
  description?: string;
  uploadRule?: UploadRuleConfig;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
  applicationId?: string;
  onUploadError?: (message: string | null) => void;
}) {
  const modal = useModal();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const allowedTypes = uploadRule?.allowedExtensions || ["pdf", "png", "jpg", "jpeg"];
  const maxSizeBytes = uploadRule?.maxSizeBytes;
  const maxSizeMb = maxSizeBytes ? Math.round(maxSizeBytes / (1024 * 1024)) : 5;

  const handleUploadError = (message: string | null) => {
    setUploadError(message);
    onUploadError?.(message);
  };

  const handlePreview = () => {
    if (!value?.url) return;
    const previewUrl =
      value.url.startsWith("http") || value.url.startsWith("/storage/")
        ? `/api/download?url=${encodeURIComponent(value.url)}&filename=${encodeURIComponent(value.name || "document.pdf")}&disposition=inline`
        : value.url;

    const isPdf = Boolean(
      value.name?.toLowerCase().endsWith(".pdf") ||
      (value.type && String(value.type).toUpperCase().includes("PDF")) ||
      value.url?.toLowerCase().includes(".pdf")
    );

    modal.open({
      title: `Document Preview: ${value.name || "Uploaded Document"}`,
      size: "lg",
      content: (
        <div className="space-y-3 py-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-600 truncate max-w-xs">{value.name}</span>
            <div className="flex items-center gap-2">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-primary bg-primary-light hover:bg-primary-light/80 border border-primary-border rounded-md transition-colors"
              >
                <ExternalLink size={12} />
                <span>Open in New Tab</span>
              </a>
              <button
                type="button"
                onClick={() => downloadFile(value.url, value.name)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <Download size={12} />
                <span>Download</span>
              </button>
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center min-h-[420px]">
            {isPdf ? (
              <object
                data={previewUrl}
                type="application/pdf"
                className="w-full h-[420px] rounded"
              >
                <iframe src={previewUrl} className="w-full h-[420px] border-0" title={value.name}>
                  <div className="p-8 text-center space-y-3">
                    <FileText className="size-10 text-primary mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Preview not directly supported in this browser.</p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-bold text-primary underline"
                    >
                      Click here to view PDF in full screen
                    </a>
                  </div>
                </iframe>
              </object>
            ) : (
              <img src={previewUrl} className="max-h-[420px] w-auto max-w-full object-contain p-2" alt={value.name} />
            )}
          </div>
        </div>
      ),
    });
  };

  const handleFileUploadChange = (uploaded: UploadedFile | null) => {
    if (!uploaded) {
      onChange(null);
      return;
    }

    handleUploadError(null);
    const formattedVal = {
      name: uploaded.name,
      size: uploaded.size,
      type: uploaded.type,
      url: uploaded.url,
      uploadedAt: uploaded.uploadedAt,
    };
    onChange(formattedVal);
  };

  return (
    <div className="space-y-1.5 w-full text-left">
      <FileUpload
        label={label}
        value={value}
        onChange={handleFileUploadChange}
        onView={handlePreview}
        onValidationError={handleUploadError}
        allowedTypes={allowedTypes}
        maxSizeBytes={maxSizeBytes}
        maxSizeMb={maxSizeMb}
        disabled={disabled}
        error={error || uploadError || undefined}
        applicationId={applicationId}
      />
    </div>
  );
}

function FrontBackUploadZone({
  label,
  description,
  frontRule,
  backRule,
  value,
  onChange,
  disabled = false,
  error,
  applicationId,
  onUploadError,
}: {
  label: string;
  description?: string;
  frontRule: UploadRuleConfig;
  backRule: UploadRuleConfig;
  value: { frontUrl?: string; backUrl?: string; front?: UploadedFile | null; back?: UploadedFile | null };
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
  applicationId?: string;
  onUploadError?: (message: string | null) => void;
}) {
  const modal = useModal();
  const frontAllowed = frontRule?.allowedExtensions || ["pdf", "png", "jpg", "jpeg"];
  const frontMb = frontRule?.maxSizeBytes ? Math.round(frontRule.maxSizeBytes / (1024 * 1024)) : 5;

  const backAllowed = backRule?.allowedExtensions || ["pdf", "png", "jpg", "jpeg"];
  const backMb = backRule?.maxSizeBytes ? Math.round(backRule.maxSizeBytes / (1024 * 1024)) : 5;

  const handlePreviewFile = (file?: UploadedFile | null, titlePrefix = "Document") => {
    if (!file?.url) return;
    const previewUrl =
      file.url.startsWith("http") || file.url.startsWith("/storage/")
        ? `/api/download?url=${encodeURIComponent(file.url)}&filename=${encodeURIComponent(file.name || "document.pdf")}&disposition=inline`
        : file.url;

    const isPdf = Boolean(
      file.name?.toLowerCase().endsWith(".pdf") ||
      (file.type && String(file.type).toUpperCase().includes("PDF")) ||
      file.url?.toLowerCase().includes(".pdf")
    );

    modal.open({
      title: `${titlePrefix} Preview: ${file.name || "Uploaded Document"}`,
      size: "lg",
      content: (
        <div className="space-y-3 py-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-600 truncate max-w-xs">{file.name}</span>
            <div className="flex items-center gap-2">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-primary bg-primary-light hover:bg-primary-light/80 border border-primary-border rounded-md transition-colors"
              >
                <ExternalLink size={12} />
                <span>Open in New Tab</span>
              </a>
              <button
                type="button"
                onClick={() => downloadFile(file.url!, file.name)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
              >
                <Download size={12} />
                <span>Download</span>
              </button>
            </div>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center min-h-[420px]">
            {isPdf ? (
              <object
                data={previewUrl}
                type="application/pdf"
                className="w-full h-[420px] rounded"
              >
                <iframe src={previewUrl} className="w-full h-[420px] border-0" title={file.name}>
                  <div className="p-8 text-center space-y-3">
                    <FileText className="size-10 text-primary mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Preview not directly supported in this browser.</p>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-bold text-primary underline"
                    >
                      Click here to view PDF in full screen
                    </a>
                  </div>
                </iframe>
              </object>
            ) : (
              <img src={previewUrl} className="max-h-[420px] w-auto max-w-full object-contain p-2" alt={file.name} />
            )}
          </div>
        </div>
      ),
    });
  };

  const handleFrontChange = (file: UploadedFile | null) => {
    onChange({
      ...value,
      front: file,
      frontUrl: file?.url || "",
    });
  };

  const handleBackChange = (file: UploadedFile | null) => {
    onChange({
      ...value,
      back: file,
      backUrl: file?.url || "",
    });
  };

  return (
    <div className="space-y-2 text-left">
      <label className="block text-xs font-semibold text-slate-700">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FileUpload
          label="Front Side Copy"
          value={value?.front}
          onChange={handleFrontChange}
          onView={() => handlePreviewFile(value?.front, "Front Side")}
          onValidationError={onUploadError}
          allowedTypes={frontAllowed}
          maxSizeBytes={frontRule?.maxSizeBytes}
          maxSizeMb={frontMb}
          disabled={disabled}
          error={error}
          applicationId={applicationId}
        />
        <FileUpload
          label="Back Side Copy"
          value={value?.back}
          onChange={handleBackChange}
          onView={() => handlePreviewFile(value?.back, "Back Side")}
          onValidationError={onUploadError}
          allowedTypes={backAllowed}
          maxSizeBytes={backRule?.maxSizeBytes}
          maxSizeMb={backMb}
          disabled={disabled}
          applicationId={applicationId}
        />
      </div>
    </div>
  );
}
