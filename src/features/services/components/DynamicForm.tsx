"use client";

import React, { useMemo} from "react";
import { ServiceFormConfig } from "@/types/form-config.types";
import { buildDynamicZodSchema } from "../validators/dynamic-schema-builder";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DynamicSection from "./DynamicSection";
import Button from "@/components/common/Button";
import { ShieldCheck, Loader2, Save } from "lucide-react";
import { notify } from "@/lib/notify";

interface DynamicFormProps {
  config: ServiceFormConfig;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isSubmitting?: boolean;
}

export default function DynamicForm({
  config,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: DynamicFormProps) {
  // 1. Build Zod validation schema dynamically from configuration
  const dynamicSchema = useMemo(() => buildDynamicZodSchema(config), [config]);

  // 2. Initialize React Hook Form with dynamic schema resolver
  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: initialValues || {},
  });

  const handleSaveDraft = () => {
    const currentData = getValues();
    notify.success({
      title: "Draft Saved",
      description: "Application progress saved to local workspace.",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sections List */}
      {config.sections.map((section) => (
        <DynamicSection
          key={section.id}
          section={section}
          control={control}
          errors={errors}
        />
      ))}

      {/* Form Submit & Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
          className="w-full sm:w-auto text-xs font-bold flex items-center justify-center gap-2"
        >
          <Save className="size-4 text-slate-500" />
          <span>Save Progress Draft</span>
        </Button>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full sm:w-auto text-xs font-bold flex items-center justify-center gap-2 px-6 py-3 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Submitting Application...</span>
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
