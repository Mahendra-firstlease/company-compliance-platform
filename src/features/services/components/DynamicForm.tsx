"use client";

import React, { useMemo, useRef, useState } from "react";
import { ServiceFormConfig } from "@/types/form-config.types";
import { buildDynamicZodSchema } from "../validators/dynamic-schema-builder";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicSection from "./DynamicSection";
import Button from "@/components/common/Button";
import { ShieldCheck, Loader2, Save, Lock, AlertCircle, AlertTriangle } from "lucide-react";
import { notify } from "@/lib/notify";
import { flattenFormErrors } from "../utils/flatten-form-errors";

interface DynamicFormProps {
  config: ServiceFormConfig;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
  applicationId?: string;
  fieldQueries?: Record<string, any>;
  docVerifications?: Record<string, any>;
  globalQuery?: string;
}

export default function DynamicForm({
  config,
  initialValues,
  onSubmit,
  isSubmitting = false,
  disabled = false,
  applicationId,
  fieldQueries,
  docVerifications,
  globalQuery,
}: DynamicFormProps) {
  // 1. Build Zod validation schema dynamically from configuration
  const dynamicSchema = useMemo(() => buildDynamicZodSchema(config), [config]);

  const hasActiveQueries = useMemo(() => {
    if (globalQuery) return true;
    if (fieldQueries && Object.keys(fieldQueries).length > 0) return true;
    if (
      docVerifications &&
      Object.values(docVerifications).some((v: any) => v?.status === "DEFECTIVE")
    ) {
      return true;
    }
    return false;
  }, [globalQuery, fieldQueries, docVerifications]);
  const initializedRef = useRef(false);
  const [submitErrorSummary, setSubmitErrorSummary] = useState<string[]>([]);

  // 2. Initialize React Hook Form with dynamic schema resolver
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: initialValues || {},
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  // Restore saved draft on client mount (restores text fields + uploaded S3 file URLs)
  React.useEffect(() => {
    if (initializedRef.current) return;

    let values = { ...(initialValues || {}) };
    try {
      const saved = localStorage.getItem(`draft_${config.serviceSlug}`);
      if (saved) {
        values = { ...values, ...JSON.parse(saved) };
      }
    } catch {
      // Silently ignore parse errors
    }

    if (Object.keys(values).length > 0 || initialValues) {
      reset(values, { keepErrors: false });
      initializedRef.current = true;
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
      setSubmitErrorSummary([]);

      notify.success({
        title: "Draft Saved!",
        description: "Your application progress and uploaded document S3 links have been saved.",
      });
    } catch (err) {
      setSubmitErrorSummary(["Could not write draft to local storage."]);
      notify.error({
        title: "Draft Save Error",
        description: "Could not write draft to local storage.",
      });
    }
  };

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      setSubmitErrorSummary([]);
      console.log("Submitting form data:", data);
      await onSubmit(data);
      // Clean up saved draft upon successful submission
      localStorage.removeItem(`draft_${config.serviceSlug}`);
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const handleInvalidSubmit = (formErrors: typeof errors) => {
    const flatErrors = flattenFormErrors(formErrors);
    setSubmitErrorSummary(flatErrors.map((e) => e.message));

    const firstMessage = flatErrors[0]?.message;
    const firstFieldId = flatErrors[0]?.fieldId.split(".")[0];
    if (firstFieldId) {
      const el = document.querySelector(`[name="${firstFieldId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    notify.error({
      title: "Please fix the highlighted fields",
      description:
        firstMessage ||
        "Some required fields are missing or invalid.",
    });
  };

  const visibleErrorCount = flattenFormErrors(errors).length;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)} className="space-y-6" noValidate>
      {/* Active Compliance Query Notice */}
      {hasActiveQueries && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-950 space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <AlertTriangle className="size-5 shrink-0 text-amber-600" />
            <span>Compliance Action Required</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-900 font-medium">
            {globalQuery
              ? `Admin Query: "${globalQuery}"`
              : "Admin has requested corrections on the highlighted fields below."}
          </p>
        </div>
      )}
      {/* Locked Status Notice Banner */}
      {disabled && (
        <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2.5">
          <Lock className="size-4 text-slate-500 shrink-0" />
          <span>
            <strong>Filing Locked for Verification:</strong> Application details and files cannot be modified while under review by legal specialists or ministry officers.
          </span>
        </div>
      )}

      {/* Accessible Error Summary Alert Box */}
      {(submitErrorSummary.length > 0 || visibleErrorCount > 0) && (
        <div
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 space-y-2"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 font-bold text-red-900">
            <AlertCircle className="size-4 shrink-0 text-red-600" />
            <span>
              {visibleErrorCount > 0
                ? `Please fix ${visibleErrorCount} field${visibleErrorCount === 1 ? "" : "s"} below`
                : "Please fix the following issues"}
            </span>
          </div>
          <ul className="list-disc pl-5 space-y-1 font-medium text-red-800">
            {(submitErrorSummary.length > 0 ? submitErrorSummary : flattenFormErrors(errors).map((e) => e.message))
              .slice(0, 6)
              .map((message) => (
                <li key={message}>{message}</li>
              ))}
          </ul>
        </div>
      )}

      {/* Sections List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs divide-y divide-slate-100 overflow-hidden">
        {config.sections.map((section) => (
          <DynamicSection
            key={section.id}
            section={section}
            control={control}
            errors={errors}
            formValues={formValues}
            disabled={disabled}
            applicationId={applicationId}
            setError={setError}
            clearErrors={clearErrors}
            fieldQueries={fieldQueries}
            docVerifications={docVerifications}
          />
        ))}
      </div>

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
              <span>Transmitting Documents...</span>
            </>
          ) : hasActiveQueries ? (
            <>
              <ShieldCheck className="size-4" />
              <span>Submit Corrections to Admin</span>
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              <span>Submit Application for Statutory Review</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
