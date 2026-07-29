"use client";

import React from "react";
import { FormFieldConfig } from "@/types/form-config.types";
import { Control, Controller, FieldErrors } from "react-hook-form";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import Textarea from "@/components/forms/Textarea";
import Checkbox from "@/components/forms/Checkbox";
import { UISelect as Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/forms/Select";
import DynamicUpload from "./DynamicUpload";

interface DynamicFieldProps {
  field: FormFieldConfig;
  control: Control<any>;
  errors: FieldErrors<any>;
}

export default function DynamicField({ field, control, errors }: DynamicFieldProps) {
  const errorMessage = errors[field.id]?.message as string | undefined;

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
                disabled={field.disabled}
                readOnly={field.readOnly}
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
                disabled={field.disabled}
                rows={3}
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
                <SelectTrigger className="w-full">
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
              type={field.type}
              uploadRule={"uploadRule" in field ? field.uploadRule : undefined}
              frontRule={"frontRule" in field ? field.frontRule : undefined}
              backRule={"backRule" in field ? field.backRule : undefined}
              value={controllerField.value}
              onChange={controllerField.onChange}
              error={errorMessage}
            />
          )}
        />
      );
    }

    default:
      return null;
  }
}
