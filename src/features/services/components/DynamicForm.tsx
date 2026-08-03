"use client";

import React, { useMemo } from "react";
import { ServiceFormConfig } from "@/types/form-config.types";
import { buildDynamicZodSchema } from "../validators/dynamic-schema-builder";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicSection from "./DynamicSection";
import Button from "@/components/common/Button";
import { ShieldCheck, Loader2, Save, Lock } from "lucide-react";
import { notify } from "@/lib/notify";

interface DynamicFormProps {
  config: ServiceFormConfig;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export default function DynamicForm({
  config,
  initialValues,
  onSubmit,
  isSubmitting = false,
  disabled = false,
}: DynamicFormProps) {
  // 1. Build Zod validation schema dynamically from configuration
  const dynamicSchema = useMemo(() => buildDynamicZodSchema(config), [config]);

  // 2. Initialize React Hook Form with dynamic schema resolver
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: initialValues || {},
  });

  // Restore saved draft on client mount (restores text fields + uploaded S3 file URLs)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(`draft_${config.serviceSlug}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        reset((prev) => ({ ...prev, ...initialValues, ...parsed }));
      }
    } catch (e) {
      // Silently ignore parse errors
    }
  }, [config.serviceSlug, reset, initialValues]);

  // Real-time automatic draft auto-save on form value changes
  const formValues = watch();

  React.useEffect(() => {
    if (!isDirty) return;
    const timeoutId = setTimeout(() => {
      try {
        const storageKey = `draft_${config.serviceSlug}`;
        localStorage.setItem(storageKey, JSON.stringify(formValues));
      } catch (err) {
        // Silently ignore storage quota errors
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [formValues, isDirty, config.serviceSlug]);

  const handleSaveDraft = () => {
    try {
      const currentData = getValues();
      const storageKey = `draft_${config.serviceSlug}`;
      localStorage.setItem(storageKey, JSON.stringify(currentData));

      notify.success({
        title: "Draft Saved! 💾",
        description: "Your application progress and uploaded document S3 links have been saved.",
      });
    } catch (err) {
      notify.error({
        title: "Draft Save Error",
        description: "Could not write draft to local storage.",
      });
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      console.log("Submitting form data:", data);
      await onSubmit(data);
      // Clean up saved draft upon successful submission
      localStorage.removeItem(`draft_${config.serviceSlug}`);
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const handleInvalidSubmit = (formErrors: typeof errors) => {
    const firstError = Object.values(formErrors).find((entry) => entry?.message);
    notify.error({
      title: "Please fix the highlighted fields",
      description:
        (firstError?.message as string | undefined) ||
        "Some required fields are missing or invalid.",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)} className="space-y-6">
      {/* Locked Status Notice Banner */}
      {disabled && (
        <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2.5">
          <Lock className="size-4 text-slate-500 shrink-0" />
          <span>
            <strong>Filing Locked for Verification:</strong> Application details and files cannot be modified while under review by legal specialists or ministry officers.
          </span>
        </div>
      )}

      {/* Sections List */}
      {config.sections.map((section) => (
        <DynamicSection
          key={section.id}
          section={section}
          control={control}
          errors={errors}
          disabled={disabled}
        />
      ))}

      {/* Form Submit & Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSubmitting || disabled}
          className="w-full sm:w-auto text-xs font-bold flex items-center justify-center gap-2"
        >
          <Save className="size-4 text-slate-500" />
          <span>Save Progress Draft</span>
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || disabled}
          className="w-full sm:w-auto text-xs font-bold flex items-center justify-center gap-2 px-6 py-3 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : disabled ? (
            <>
              <Lock className="size-4" />
              <span>Application Under Review</span>
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              <span>Submit Statutory Filing</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
