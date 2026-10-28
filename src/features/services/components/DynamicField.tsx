"use client";

import React from "react";
import { FormFieldConfig } from "@/types/form-config.types";
import { Control, Controller, FieldErrors, UseFormSetError, UseFormClearErrors } from "react-hook-form";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import Textarea from "@/components/forms/Textarea";
import Checkbox from "@/components/forms/Checkbox";
import { UISelect as Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/forms/Select";
import DynamicUpload from "./DynamicUpload";
import { AlertTriangle } from "lucide-react";
import { getInputValidationProps } from "../validators/resolve-field-validation";
import { cleanErrorMessage } from "../utils/flatten-form-errors";

interface DynamicFieldProps {
  field: FormFieldConfig;
  control: Control<any>;
  errors: FieldErrors<any>;
  disabled?: boolean;
  applicationId?: string;
  setError?: UseFormSetError<any>;
  clearErrors?: UseFormClearErrors<any>;
  fieldQuery?: { message?: string; reason?: string; status?: string } | string;
}

export default function DynamicField({
  field,
  control,
  errors,
  disabled = false,
  applicationId,
  setError,
  clearErrors,
  fieldQuery,
}: DynamicFieldProps) {
  const fieldError = errors[field.id];
  const rawErrorMessage =
    (fieldError?.message as string | undefined) ||
    (field.type === "front-back-file" &&
      typeof fieldError === "object" &&
      fieldError !== null &&
      [
        (fieldError as { frontUrl?: { message?: string } }).frontUrl?.message,
        (fieldError as { backUrl?: { message?: string } }).backUrl?.message,
      ].find(Boolean)) ||
    undefined;
  const errorMessage = rawErrorMessage
    ? cleanErrorMessage(field.label || field.id, rawErrorMessage)
    : undefined;
  const queryMsg =
    typeof fieldQuery === "string"
      ? fieldQuery
      : fieldQuery?.message || (fieldQuery as any)?.reason;

  const isFieldDisabled = (disabled && !queryMsg) || field.disabled;
  const inputValidation = getInputValidationProps(field);

  const fieldElement = (() => {
    switch (field.type) {
    case "text":
    case "email":
    case "phone":
    case "number": {
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={field.defaultValue || ""}
          render={({ field: controllerField }) => (
            <FormGroup label={field.label} required={field.required} error={errorMessage}>
              <Input
                {...controllerField}
                type={field.type === "number" ? "number" : "text"}
                placeholder={field.placeholder}
                disabled={isFieldDisabled}
                readOnly={field.readOnly}
                minLength={typeof inputValidation.minLength === "number" ? inputValidation.minLength : undefined}
                maxLength={typeof inputValidation.maxLength === "number" ? inputValidation.maxLength : undefined}
                pattern={typeof inputValidation.pattern === "string" ? inputValidation.pattern : undefined}
                min={typeof inputValidation.min === "number" ? inputValidation.min : undefined}
                max={typeof inputValidation.max === "number" ? inputValidation.max : undefined}
              />
            </FormGroup>
          )}
        />
      );
    }

    case "textarea": {
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={field.defaultValue || ""}
          render={({ field: controllerField }) => (
            <FormGroup label={field.label} required={field.required} error={errorMessage}>
              <Textarea
                {...controllerField}
                placeholder={field.placeholder}
                disabled={isFieldDisabled}
                rows={3}
                minLength={typeof inputValidation.minLength === "number" ? inputValidation.minLength : undefined}
                maxLength={typeof inputValidation.maxLength === "number" ? inputValidation.maxLength : undefined}
              />
            </FormGroup>
          )}
        />
      );
    }

    case "date": {
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={field.defaultValue || ""}
          render={({ field: controllerField }) => (
            <FormGroup label={field.label} required={field.required} error={errorMessage}>
              <Input
                {...controllerField}
                type="date"
                disabled={isFieldDisabled}
                readOnly={field.readOnly}
                min={typeof inputValidation.minDate === "string" ? inputValidation.minDate : undefined}
                max={typeof inputValidation.maxDate === "string" ? inputValidation.maxDate : undefined}
              />
            </FormGroup>
          )}
        />
      );
    }

    case "select": {
      const options = field.optionsSource.type === "static" ? field.optionsSource.options : [];
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={field.defaultValue || ""}
          render={({ field: controllerField }) => (
            <FormGroup label={field.label} required={field.required} error={errorMessage}>
              <Select value={controllerField.value} onValueChange={controllerField.onChange}>
                <SelectTrigger className="w-full" disabled={isFieldDisabled}>
                  <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormGroup>
          )}
        />
      );
    }

    case "checkbox":
    case "switch": {
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={field.defaultValue || false}
          render={({ field: controllerField }) => (
            <Checkbox
              label={field.label}
              checked={controllerField.value}
              onChange={controllerField.onChange}
              disabled={isFieldDisabled}
              error={errorMessage}
            />
          )}
        />
      );
    }

    case "file":
    case "multi-file":
    case "front-back-file": {
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={field.defaultValue || null}
          render={({ field: controllerField }) => (
            <DynamicUpload
              id={field.id}
              label={field.label}
              description={field.description}
              type={field.type}
              uploadRule={"uploadRule" in field ? field.uploadRule : undefined}
              frontRule={"frontRule" in field ? field.frontRule : undefined}
              backRule={"backRule" in field ? field.backRule : undefined}
              value={controllerField.value}
              onChange={controllerField.onChange}
              disabled={isFieldDisabled}
              error={errorMessage}
              applicationId={applicationId}
              onUploadError={(msg) => {
                if (msg) {
                  setError?.(field.id as any, { type: "custom", message: msg });
                } else {
                  clearErrors?.(field.id as any);
                }
              }}
            />
          )}
        />
      );
    }

    default:
      return null;
    }
  })();

  if (!queryMsg) {
    return fieldElement;
  }

  return (
    <div
      data-queried-field="true"
      data-field-id={field.id}
      className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/40 ring-2 ring-amber-400 space-y-2.5 transition-all"
    >
      <div className="flex items-start gap-2 p-2.5 bg-amber-100/90 border border-amber-300 rounded-lg text-xs text-amber-950 font-medium">
        <AlertTriangle size={15} className="text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-[11px] text-amber-900 block">Admin Query</span>
          <p className="mt-0.5 leading-relaxed">{queryMsg}</p>
        </div>
      </div>
      {fieldElement}
    </div>
  );
}
