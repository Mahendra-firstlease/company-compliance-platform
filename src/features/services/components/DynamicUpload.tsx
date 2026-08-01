"use client";

import React, { useState } from "react";
import { UploadRuleConfig } from "@/types/form-config.types";
import { validateFileMagicBytes, sanitizeFilename } from "@/lib/upload-safety";
import { UploadCloud, FileText, CheckCircle2, Trash2, Eye, RefreshCw, AlertCircle, Image as ImageIcon } from "lucide-react";
import { useModal } from "@/components/ui/overlay";

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
        value={value || { frontUrl: "", backUrl: "" }}
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
  uploadRule: UploadRuleConfig;
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
}) {
  const modal = useModal();
  const [fileState, setFileState] = useState<{
    name: string;
    size: string;
    type: string;
    url: string;
  } | null>(value?.name ? value : null);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // 1. Size Validation
    if (uploadRule && file.size > uploadRule.maxSizeBytes) {
      const maxMb = (uploadRule.maxSizeBytes / (1024 * 1024)).toFixed(1);
      setUploadError(`File exceeds maximum size limit of ${maxMb}MB.`);
      return;
    }

    // 2. Extension Check
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (uploadRule && !uploadRule.allowedExtensions.includes(ext)) {
      setUploadError(`Allowed extensions: ${uploadRule.allowedExtensions.join(", ")}`);
      return;
    }

    // 3. Magic Bytes Check
    const isValidMagic = await validateFileMagicBytes(file);
    if (!isValidMagic) {
      setUploadError("File header signature verification failed. Please upload a valid image or PDF.");
      return;
    }

    const sanitizedName = sanitizeFilename(file.name);
    const objectUrl = URL.createObjectURL(file);

    const fileMeta = {
      name: sanitizedName,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || ext.toUpperCase(),
      url: objectUrl,
    };

    setFileState(fileMeta);
    onChange(fileMeta);
  };

  const handleRemove = () => {
    if (disabled) return;
    setFileState(null);
    setUploadError(null);
    onChange(null);
  };

  const handlePreview = (fileName: string, fileUrl: string) => {
    modal.open({
      title: `Document Preview: ${fileName}`,
      size: "lg",
      content: (
        <div className="space-y-4 text-center py-2">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center min-h-75">
            {fileName.toLowerCase().endsWith(".pdf") ? (
              <iframe src={fileUrl} className="w-full h-96 border-0" title={fileName} />
            ) : (
              <img src={fileUrl} className="max-h-96 w-auto max-w-full object-contain p-2" alt={fileName} />
            )}
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-2 text-left">
      <label className="block text-xs font-bold text-slate-700">{label}</label>

      {fileState ? (
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-emerald-950 truncate max-w-44">{fileState.name}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">{fileState.size} &middot; Attached</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {fileState.url && (
              <button
                type="button"
                onClick={() => handlePreview(fileState.name, fileState.url)}
                className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/60 rounded-md transition-colors cursor-pointer"
                title="Preview document"
              >
                <Eye className="size-4" />
              </button>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                title="Remove document"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={`relative border-2 border-dashed rounded-lg p-4 text-center ${disabled ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-60" : "border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 cursor-pointer transition-all"}`}>
          <input
            type="file"
            id={id}
            disabled={disabled}
            onChange={handleFileSelect}
            accept={uploadRule?.allowedMimeTypes.join(",")}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          />
          <div className="flex flex-col items-center gap-1.5 pointer-events-none">
            <UploadCloud className="size-6 text-indigo-600" />
            <p className="text-xs font-bold text-slate-800">
              Click or drag to upload <span className="text-indigo-600 font-extrabold">{label}</span>
            </p>
            <p className="text-[10px] font-semibold text-slate-400">
              Accepted: {uploadRule?.allowedExtensions.join(", ").toUpperCase()} (Max {(uploadRule?.maxSizeBytes! / (1024 * 1024)).toFixed(1)}MB)
            </p>
          </div>
        </div>
      )}

      {(error || uploadError) && (
        <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{uploadError || error}</span>
        </p>
      )}
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
  value: { frontUrl?: string; backUrl?: string; frontMeta?: any; backMeta?: any };
  onChange: (val: any) => void;
  disabled?: boolean;
  error?: string;
}) {
  const modal = useModal();
  const [front, setFront] = useState<any>(value?.frontMeta || null);
  const [back, setBack] = useState<any>(value?.backMeta || null);

  const handleUpload = async (side: "front" | "back", file: File) => {
    if (disabled) return;
    const isValidMagic = await validateFileMagicBytes(file);
    if (!isValidMagic) return;

    const sanitizedName = sanitizeFilename(file.name);
    const objectUrl = URL.createObjectURL(file);
    const meta = {
      name: sanitizedName,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      url: objectUrl,
    };

    if (side === "front") {
      setFront(meta);
      onChange({
        ...value,
        frontUrl: objectUrl,
        frontMeta: meta,
        backUrl: back?.url || "",
        backMeta: back,
      });
    } else {
      setBack(meta);
      onChange({
        ...value,
        frontUrl: front?.url || "",
        frontMeta: front,
        backUrl: objectUrl,
        backMeta: meta,
      });
    }
  };

  const handlePreview = (fileName: string, fileUrl: string) => {
    modal.open({
      title: `Document Preview: ${fileName}`,
      size: "lg",
      content: (
        <div className="space-y-4 text-center py-2">
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center min-h-75">
            {fileName.toLowerCase().endsWith(".pdf") ? (
              <iframe src={fileUrl} className="w-full h-96 border-0" title={fileName} />
            ) : (
              <img src={fileUrl} className="max-h-96 w-auto max-w-full object-contain p-2" alt={fileName} />
            )}
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-2 text-left">
      <label className="block text-xs font-bold text-slate-700">{label}</label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Front Side Upload */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Front Side:</span>
          {front ? (
            <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 truncate max-w-28">{front.name}</span>
              <div className="flex items-center gap-1.5">
                {front.url && (
                  <button
                    type="button"
                    onClick={() => handlePreview(front.name, front.url)}
                    className="text-slate-600 hover:text-indigo-600 p-1"
                    title="Preview Front side"
                  >
                    <Eye className="size-3.5" />
                  </button>
                )}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setFront(null);
                      onChange({ ...value, frontUrl: "", frontMeta: null });
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove Front side"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={`relative border border-dashed border-slate-300 ${disabled ? "bg-slate-100 cursor-not-allowed opacity-60" : "hover:border-indigo-500 cursor-pointer"} p-2.5 rounded-lg text-center`}>
              <input
                type="file"
                disabled={disabled}
                onChange={(e) => e.target.files?.[0] && handleUpload("front", e.target.files[0])}
                accept={frontRule.allowedMimeTypes.join(",")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-xs font-bold text-indigo-600">+ Upload Front Image</span>
            </div>
          )}
        </div>

        {/* Back Side Upload */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Back Side:</span>
          {back ? (
            <div className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-800 truncate max-w-28">{back.name}</span>
              <div className="flex items-center gap-1.5">
                {back.url && (
                  <button
                    type="button"
                    onClick={() => handlePreview(back.name, back.url)}
                    className="text-slate-600 hover:text-indigo-600 p-1"
                    title="Preview Back side"
                  >
                    <Eye className="size-3.5" />
                  </button>
                )}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => {
                      setBack(null);
                      onChange({ ...value, backUrl: "", backMeta: null });
                    }}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Remove Back side"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={`relative border border-dashed border-slate-300 ${disabled ? "bg-slate-100 cursor-not-allowed opacity-60" : "hover:border-indigo-500 cursor-pointer"} p-2.5 rounded-lg text-center`}>
              <input
                type="file"
                disabled={disabled}
                onChange={(e) => e.target.files?.[0] && handleUpload("back", e.target.files[0])}
                accept={backRule.allowedMimeTypes.join(",")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-xs font-bold text-indigo-600">+ Upload Back Image</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
