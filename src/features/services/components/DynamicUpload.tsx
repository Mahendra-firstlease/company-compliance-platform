"use client";

import { UploadRuleConfig } from "@/types/form-config.types";
import { useModal } from "@/components/ui/overlay";
import FileUpload from "@/components/upload/FileUpload";
import { UploadedFile } from "@/components/upload/upload-utils";

interface DynamicUploadProps {
  id: string;
  label: string;
  type: "file" | "multi-file" | "front-back-file";
  uploadRule?: UploadRuleConfig;
  frontRule?: UploadRuleConfig;
  backRule?: UploadRuleConfig;
  value?: any;
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
}

export default function DynamicUpload({
  id,
  label,
  type,
  uploadRule,
  frontRule,
  backRule,
  value,
  onChange,
  disabled = false,
  error,
}: DynamicUploadProps) {
  if (type === "front-back-file") {
    return (
      <FrontBackUploadZone
        label={label}
        frontRule={frontRule || uploadRule!}
        backRule={backRule || uploadRule!}
        value={value || { frontUrl: "", backUrl: "", front: null, back: null }}
        onChange={onChange}
        disabled={disabled}
        error={error}
      />
    );
  }

  return (
    <SingleUploadZone
      id={id}
      label={label}
      uploadRule={uploadRule!}
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
    />
  );
}

function SingleUploadZone({
  id,
  label,
  uploadRule,
  value,
  onChange,
  disabled = false,
  error,
}: {
  id: string;
  label: string;
  uploadRule?: UploadRuleConfig;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
}) {
  const modal = useModal();

  const allowedTypes = uploadRule?.allowedExtensions || ["pdf", "png", "jpg", "jpeg"];
  const maxSizeMb = uploadRule?.maxSizeBytes
    ? Math.round(uploadRule.maxSizeBytes / (1024 * 1024))
    : 5;

  const handlePreview = () => {
    if (!value?.url) return;
    modal.open({
      title: `Document Preview: ${value.name}`,
      size: "lg",
      content: (
        <div className="space-y-4 text-center py-2">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center min-h-75">
            {value.name?.toLowerCase().endsWith(".pdf") ? (
              <iframe src={value.url} className="w-full h-96 border-0" title={value.name} />
            ) : (
              <img src={value.url} className="max-h-96 w-auto max-w-full object-contain p-2" alt={value.name} />
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
        allowedTypes={allowedTypes}
        maxSizeMb={maxSizeMb}
        disabled={disabled}
        error={error}
      />
    </div>
  );
}

function FrontBackUploadZone({
  label,
  frontRule,
  backRule,
  value,
  onChange,
  disabled = false,
  error,
}: {
  label: string;
  frontRule: UploadRuleConfig;
  backRule: UploadRuleConfig;
  value: { frontUrl?: string; backUrl?: string; front?: UploadedFile | null; back?: UploadedFile | null };
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
}) {
  const frontAllowed = frontRule?.allowedExtensions || ["pdf", "png", "jpg", "jpeg"];
  const frontMb = frontRule?.maxSizeBytes ? Math.round(frontRule.maxSizeBytes / (1024 * 1024)) : 5;

  const backAllowed = backRule?.allowedExtensions || ["pdf", "png", "jpg", "jpeg"];
  const backMb = backRule?.maxSizeBytes ? Math.round(backRule.maxSizeBytes / (1024 * 1024)) : 5;

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
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FileUpload
          label="Front Side Copy"
          value={value?.front}
          onChange={handleFrontChange}
          allowedTypes={frontAllowed}
          maxSizeMb={frontMb}
          disabled={disabled}
          error={error}
        />
        <FileUpload
          label="Back Side Copy"
          value={value?.back}
          onChange={handleBackChange}
          allowedTypes={backAllowed}
          maxSizeMb={backMb}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
