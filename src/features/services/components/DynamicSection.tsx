"use client";

import React from "react";
import { FormSectionConfig } from "@/types/form-config.types";
import DynamicField from "./DynamicField";
import { Control, FieldErrors, UseFormSetError, UseFormClearErrors } from "react-hook-form";
import { isFieldVisible } from "../utils/field-visibility";

interface DynamicSectionProps {
  section: FormSectionConfig;
  control: Control<any>;
  errors: FieldErrors<any>;
  formValues?: Record<string, unknown>;
  disabled?: boolean;
  applicationId?: string;
  setError?: UseFormSetError<any>;
  clearErrors?: UseFormClearErrors<any>;
  fieldQueries?: Record<string, any>;
  docVerifications?: Record<string, any>;
}

export default function DynamicSection({
  section,
  control,
  errors,
  formValues,
  disabled = false,
  applicationId,
  setError,
  clearErrors,
  fieldQueries,
  docVerifications,
}: DynamicSectionProps) {
  const visibleFields = formValues
    ? section.fields.filter((field) => isFieldVisible(field, formValues))
    : section.fields;

  if (visibleFields.length === 0) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{section.title}</h3>
        {section.description && (
          <p className="text-xs text-slate-500 leading-normal mt-0.5 max-w-md">{section.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleFields.map((field) => (
          <div
            key={field.id}
            className={
              field.type === "textarea" ||
              field.type === "file" ||
              field.type === "front-back-file" ||
              field.type === "multi-file"
                ? "md:col-span-2"
                : "col-span-1"
            }
          >
            <DynamicField
              field={field}
              control={control}
              errors={errors}
              disabled={disabled}
              applicationId={applicationId}
              setError={setError}
              clearErrors={clearErrors}
              fieldQuery={
                fieldQueries?.[field.id] ||
                (docVerifications?.[field.id]?.status === "DEFECTIVE"
                  ? { message: docVerifications[field.id].reason || "Document flagged as defective. Please re-upload a clear copy." }
                  : undefined)
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
