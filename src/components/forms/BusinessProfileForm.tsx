"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { State } from "country-state-city";
import { Building2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Button from "@/components/common/Button";
import FormGroup from "@/components/forms/FormGroup";
import Input from "@/components/forms/Input";
import Select from "@/components/forms/Select";
import { notify } from "@/lib/notify";
import {
  businessProfileSchema,
  BusinessProfileFormValues,
} from "@/schemas/profile.schema";
import { saveBusinessProfileAction } from "@/lib/actions/profile";

const businessTypeOptions = [
  { label: "Private Limited Company (Pvt Ltd)", value: "Private Limited Company" },
  { label: "Limited Liability Partnership (LLP)", value: "LLP" },
  { label: "Sole Proprietorship", value: "Sole Proprietorship" },
  { label: "Partnership Firm", value: "Partnership Firm" },
  { label: "One Person Company (OPC)", value: "OPC" },
  { label: "Public Limited Company", value: "Public Limited Company" },
];

const industryOptions = [
  { label: "IT, Software, & SaaS", value: "IT & Software" },
  { label: "Food & Beverage (Cafes, Processing, Restaurants)", value: "Food & Beverage" },
  { label: "Manufacturing & Heavy Industry", value: "Manufacturing" },
  { label: "Retail & E-commerce", value: "Retail & E-commerce" },
  { label: "Healthcare & Pharmaceuticals", value: "Healthcare & Pharma" },
  { label: "Professional Services (Consultancy, Agency)", value: "Professional Services" },
  { label: "Real Estate & Construction", value: "Real Estate" },
  { label: "Logistics & Transport", value: "Logistics" },
  { label: "Other Business Sectors", value: "Other" },
];

const employeeOptions = [
  { label: "1 - 9 employees", value: "1-9 employees" },
  { label: "10 - 19 employees", value: "10-19 employees" },
  { label: "20 - 49 employees", value: "20-49 employees" },
  { label: "50+ employees", value: "50+ employees" },
];

const turnoverOptions = [
  { label: "Under ₹10 Lakhs", value: "Under 10L" },
  { label: "₹10 Lakhs - ₹40 Lakhs", value: "10L - 40L" },
  { label: "₹40 Lakhs - ₹1 Crore", value: "40L - 1Cr" },
  { label: "₹1 Crore - ₹5 Crores", value: "1Cr - 5Cr" },
  { label: "Over ₹5 Crores", value: "Over 5Cr" },
];

interface BusinessProfileFormProps {
  initialValues?: Partial<BusinessProfileFormValues>;
  onSuccess?: (savedProfile: any) => void;
  onCancel?: () => void;
}

export default function BusinessProfileForm({
  initialValues,
  onSuccess,
  onCancel,
}: BusinessProfileFormProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Dynamically load Indian States from country-state-city package
  const stateOptions = useMemo(() => {
    const indianStates = State.getStatesOfCountry("IN");
    return indianStates.map((st) => ({
      label: st.name,
      value: st.name,
    }));
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<BusinessProfileFormValues>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: initialValues?.businessName || "",
      businessType: initialValues?.businessType || "Private Limited Company",
      industry: initialValues?.industry || "IT & Software",
      state: initialValues?.state || "Maharashtra",
      employeeCount: initialValues?.employeeCount || "1-9 employees",
      annualTurnover: initialValues?.annualTurnover || "10L - 40L",
    },
  });

  // Keep form values synchronized when initialValues load asynchronously from DB
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      reset({
        businessName: initialValues.businessName || "",
        businessType: initialValues.businessType || "Private Limited Company",
        industry: initialValues.industry || "IT & Software",
        state: initialValues.state || "Maharashtra",
        employeeCount: initialValues.employeeCount || "1-9 employees",
        annualTurnover: initialValues.annualTurnover || "10L - 40L",
      });
    }
  }, [initialValues, reset]);

  const selectedType = watch("businessType");
  const selectedIndustry = watch("industry");
  const selectedState = watch("state");
  const selectedEmployees = watch("employeeCount");
  const selectedTurnover = watch("annualTurnover");

  const handleNextStep = async () => {
    const isValid = await trigger(["businessName", "businessType", "industry"]);
    if (isValid) {
      setStep(2);
    }
  };

  const onSubmit = async (values: BusinessProfileFormValues) => {
    try {
      const res = await saveBusinessProfileAction(values);

      if (!res.success) {
        notify.error({
          title: "Save Failed",
          description: res.error || "Could not update business profile.",
        });
        return;
      }

      notify.success({
        title: "Business Profile Saved",
        description:
          "Your profile has been saved. Recommended services updated!",
      });

      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err: any) {
      console.error("Save profile error:", err);
      notify.error({
        title: "Error",
        description: "An unexpected error occurred while saving profile.",
      });
    }
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-slate-200/80 shadow-xs">
      {/* Step Indicator Header (Mobile & Desktop Optimized) */}
      <div className="space-y-3 pb-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-8 sm:size-9 rounded-full bg-indigo-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-2xs">
              {step}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight truncate">
                {step === 1
                  ? "Step 1: Entity & Industry Details"
                  : "Step 2: Location & Business Scale"}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {step === 1
                  ? "Basic business identity"
                  : "State location and annual turnover metrics"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end shrink-0">
            <span className="text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/80 shadow-2xs">
              Step {step} of 2
            </span>
          </div>
        </div>

        {/* Visual Segmented Progress Bar */}
        <div className="flex items-center gap-1.5 pt-1">
          <div
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step >= 1 ? "bg-indigo-600" : "bg-slate-100"
            }`}
          />
          <div
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step >= 2 ? "bg-indigo-600" : "bg-slate-100"
            }`}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: businessName, businessType, industry */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Business Name */}
            <FormGroup
              label="Business / Company Name"
              error={errors.businessName?.message}
              required
            >
              <div className="relative">
                <Input
                  {...register("businessName")}
                  placeholder="e.g. Acme Tech Private Limited"
                  className="pl-9"
                />
                <Building2 className="size-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </FormGroup>

            {/* Entity Structure */}
            <FormGroup
              label="Entity Structure / Type"
              error={errors.businessType?.message}
              required
            >
              <Select
                options={businessTypeOptions}
                value={selectedType}
                onChange={(val) =>
                  setValue("businessType", val, { shouldValidate: true, shouldDirty: true })
                }
                placeholder="Select Business Type"
              />
            </FormGroup>

            {/* Industry Sector */}
            <FormGroup
              label="Industry Sector"
              error={errors.industry?.message}
              required
            >
              <Select
                options={industryOptions}
                value={selectedIndustry}
                onChange={(val) =>
                  setValue("industry", val, { shouldValidate: true, shouldDirty: true })
                }
                placeholder="Select Industry"
              />
            </FormGroup>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {onCancel ? (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              ) : (
                <div />
              )}

              <Button
                type="button"
                variant="primary"
                onClick={handleNextStep}
                className="flex items-center gap-2"
              >
                <span>Next</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: state, employeeCount, annualTurnover */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* State Selection (Populated dynamically via country-state-city) */}
            <FormGroup
              label="State / Location"
              error={errors.state?.message}
              required
            >
              <Select
                options={stateOptions}
                value={selectedState}
                onChange={(val) =>
                  setValue("state", val, { shouldValidate: true, shouldDirty: true })
                }
                placeholder="Select State"
              />
            </FormGroup>

            {/* Employee Team Size */}
            <FormGroup
              label="Employee Team Size"
              error={errors.employeeCount?.message}
              required
            >
              <Select
                options={employeeOptions}
                value={selectedEmployees}
                onChange={(val) =>
                  setValue("employeeCount", val, { shouldValidate: true, shouldDirty: true })
                }
                placeholder="Select Employee Size"
              />
            </FormGroup>

            {/* Annual Turnover Range */}
            <FormGroup
              label="Annual Turnover Range"
              error={errors.annualTurnover?.message}
              required
            >
              <Select
                options={turnoverOptions}
                value={selectedTurnover}
                onChange={(val) =>
                  setValue("annualTurnover", val, { shouldValidate: true, shouldDirty: true })
                }
                placeholder="Select Turnover"
              />
            </FormGroup>

            {/* Step 2 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="size-4" />
                <span>Previous</span>
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <CheckCircle2 className="size-4" />
                <span>
                  {isSubmitting ? "Saving..." : "Save"}
                </span>
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
