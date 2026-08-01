"use client";

import React, { useState } from "react";
import { ApplicationCase, updateApplication } from "@/lib/applications";
import { AlertTriangle, Send, CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";
import Button from "@/components/common/Button";
import Textarea from "@/components/forms/Textarea";
import MultiFileUpload from "@/components/upload/MultiFileUpload";
import { UploadedFile } from "@/components/upload/upload-utils";
import { notify } from "@/lib/notify";

interface QueryResponseModalProps {
  application: ApplicationCase | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QueryResponseModal({
  application,
  isOpen,
  onClose,
  onSuccess,
}: QueryResponseModalProps) {
  const [replyText, setReplyText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && uploadedFiles.length === 0) {
      notify.error("Please provide a written response or re-upload requested documents.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedFiles = uploadedFiles.map((f: any) => ({
        name: f.name,
        url: f.url || f.fileUrl || "",
        size: typeof f.size === "number" ? `${(f.size / 1024).toFixed(1)} KB` : String(f.size || ""),
      }));

      // Append to query history
      const currentHistory = application.queryHistory || [];
      const newHistoryEntry = {
        id: `qhist_${Date.now()}`,
        queryText: application.query || application.queryNote || "Clarification Required",
        raisedBy: application.assignedExecutive || "Compliance Officer",
        createdAt: new Date().toISOString(),
        clientReply: replyText.trim(),
        clientFiles: formattedFiles,
        respondedAt: new Date().toISOString(),
        status: "CLIENT_RESPONDED" as const,
      };

      const res = await updateApplication(application.id, {
        queryResponse: replyText.trim(),
        queryStatus: "CLIENT_RESPONDED",
        clientResponseFiles: formattedFiles,
        queryHistory: [newHistoryEntry, ...currentHistory],
      });

      if (res.success) {
        notify.success("Response and revised documents submitted to your compliance specialist!");
        setReplyText("");
        setUploadedFiles([]);
        onSuccess();
        onClose();
      } else {
        notify.error(res.error || "Failed to submit response.");
      }
    } catch (err) {
      notify.error("An error occurred while submitting your response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Respond to Specialist Query</h3>
              <p className="text-[11px] text-slate-300 font-mono">Ref ID: {application.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Query Notice Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <span>Query Raised by Compliance Officer:</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed font-semibold italic pl-5">
              "{application.query || application.queryNote || "Please review and re-upload required documents."}"
            </p>
          </div>

          {/* Written Response Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Your Written Clarification / Explanation
            </label>
            <Textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="e.g. I have re-uploaded the clear front and back scans of my Aadhaar card as requested..."
              className="text-xs p-3"
            />
          </div>

          {/* Re-upload Document File Dropzone */}
          <div className="space-y-1.5">
            <MultiFileUpload
              label="Re-upload Corrected Document(s) (PDF / Images)"
              value={uploadedFiles}
              onChange={setUploadedFiles}
              allowedTypes={["pdf", "png", "jpg", "jpeg"]}
              maxFiles={5}
              maxSizeMb={10}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || (!replyText.trim() && uploadedFiles.length === 0)}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              leftIcon={isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            >
              {isSubmitting ? "Submitting Response..." : "Submit Response to Officer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
