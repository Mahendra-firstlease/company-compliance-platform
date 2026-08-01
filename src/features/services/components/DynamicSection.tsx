"use client";

import React from "react";
import { FormSectionConfig } from "@/types/form-config.types";
import DynamicField from "./DynamicField";
import { Control, FieldErrors } from "react-hook-form";

interface DynamicSectionProps {
  section: FormSectionConfig;
  control: Control<any>;
  errors: FieldErrors<any>;
  disabled?: boolean;
}

export default function DynamicSection({ section, control, errors, disabled = false }: DynamicSectionProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{section.title}</h3>
        {section.description && (
          <p className="text-xs text-slate-400 leading-normal mt-0.5">{section.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {section.fields.map((field) => (
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
            <DynamicField field={field} control={control} errors={errors} disabled={disabled} />
          </div>
        ))}
      </div>
    </div>
  );
}
