"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Edit3,
  SquareArrowOutUpRight,
  X,
  Clock,
  Layers,
  HelpCircle,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  DollarSign,
  ListChecks,
  Sparkles,
  HelpCircle as FaqIcon,
  Eye,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/common/Button";
import Badge from "@/components/ui/Badge/Badge";
import apiFetch from "@/lib/apiClient";
import { notify } from "@/lib/notify";
import { useModal } from "@/components/ui/overlay";
import Link from "next/link";
import { useClientPagination } from "@/hooks/useClientPagination";
import TablePagination from "@/components/ui/TablePagination";
import TablePaginationToolbar from "@/components/ui/TablePaginationToolbar";
import { formatCurrency } from "@/utils/formatters";
import { services as staticServices } from "@/data/services";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceDetailsPayload {
  benefits?: string[];
  eligibility?: string[];
  requiredDocuments?: string[];
  packageDeliverables?: string[];
  faqs?: FAQItem[];
}

export interface AdminServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  price: number;
  originalPrice?: number | null;
  governmentFee: number;
  professionalFee: number;
  duration: string;
  popular?: boolean;
  featured?: boolean;
  details?: ServiceDetailsPayload | null;
}

interface ComprehensiveEditorProps {
  service: AdminServiceItem;
  onBack: () => void;
  onSaveSuccess: (updated: AdminServiceItem) => void;
}
function ComprehensiveServiceEditor({ service, onBack, onSaveSuccess }: ComprehensiveEditorProps) {
  // Prepopulate details from database record or fallback to static catalogue defaults
  const staticFallback = useMemo(() => {
    return staticServices.find((s) => s.slug === service.slug)?.details || null;
  }, [service.slug]);

  // Core Service Fields
  const [title, setTitle] = useState(service.title || "");
  const [shortDescription, setShortDescription] = useState(service.shortDescription || "");
  const [description, setDescription] = useState(
    service.description || staticServices.find((s) => s.slug === service.slug)?.description || ""
  );
  const [image, setImage] = useState(service.image || `/images/services/${service.slug}.jpg`);
  const [duration, setDuration] = useState(service.duration || "7-15 working days");

  // Pricing & Badges
  const [govtFee, setGovtFee] = useState<string>(String(service.governmentFee ?? 0));
  const [profFee, setProfFee] = useState<string>(String(service.professionalFee ?? 0));
  const [origPrice, setOrigPrice] = useState<string>(service.originalPrice ? String(service.originalPrice) : "");
  const [isPopular, setIsPopular] = useState<boolean>(Boolean(service.popular));
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(service.featured));

  // Dynamic Content Tabs
  const [benefits, setBenefits] = useState<string[]>(
    Array.isArray(service.details?.benefits) && service.details!.benefits!.length > 0
      ? service.details!.benefits!
      : staticFallback?.benefits || [""]
  );

  const [eligibility, setEligibility] = useState<string[]>(
    Array.isArray(service.details?.eligibility) && service.details!.eligibility!.length > 0
      ? service.details!.eligibility!
      : staticFallback?.eligibility || [""]
  );

  const [requiredDocuments, setRequiredDocuments] = useState<string[]>(
    Array.isArray(service.details?.requiredDocuments) && service.details!.requiredDocuments!.length > 0
      ? service.details!.requiredDocuments!
      : staticFallback?.requiredDocuments || [""]
  );

  const [packageDeliverables, setPackageDeliverables] = useState<string[]>(
    Array.isArray(service.details?.packageDeliverables) && service.details!.packageDeliverables!.length > 0
      ? service.details!.packageDeliverables!
      : staticFallback?.packageDeliverables || [""]
  );

  const [faqs, setFaqs] = useState<FAQItem[]>(
    Array.isArray(service.details?.faqs) && service.details!.faqs!.length > 0
      ? service.details!.faqs!
      : staticFallback?.faqs || [{ question: "", answer: "" }]
  );

  const [activeTab, setActiveTab] = useState<"ALL" | "GENERAL" | "PRICING" | "CONTENT" | "FAQS">("ALL");
  const [isSaving, setIsSaving] = useState(false);

  // Calculations
  const numGovt = Math.max(0, parseFloat(govtFee) || 0);
  const numProf = Math.max(0, parseFloat(profFee) || 0);
  const calculatedTotal = numGovt + numProf;

  // Handlers for dynamic list items
  const handleListChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number, value: string) => {
    setter((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const handleRemoveListItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setter((prev) => {
      if (prev.length <= 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  // FAQ Handlers
  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    setFaqs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs((prev) => {
      if (prev.length <= 1) return [{ question: "", answer: "" }];
      return prev.filter((_, i) => i !== index);
    });
  };

  // Submit Handler
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      notify.error({ title: "Validation Error", description: "Service title is required." });
      return;
    }

    if (isNaN(numGovt) || numGovt < 0) {
      notify.error({ title: "Validation Error", description: "Government statutory fee must be 0 or greater." });
      return;
    }

    if (isNaN(numProf) || numProf < 0) {
      notify.error({ title: "Validation Error", description: "Professional filing fee must be 0 or greater." });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: service.id,
        title: cleanTitle,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        image: image.trim(),
        duration: duration.trim(),
        governmentFee: numGovt,
        professionalFee: numProf,
        price: calculatedTotal,
        originalPrice: origPrice && !isNaN(parseFloat(origPrice)) && parseFloat(origPrice) > 0 ? parseFloat(origPrice) : null,
        popular: isPopular,
        featured: isFeatured,
        details: {
          benefits: benefits.map((b) => b.trim()).filter(Boolean),
          eligibility: eligibility.map((e) => e.trim()).filter(Boolean),
          requiredDocuments: requiredDocuments.map((d) => d.trim()).filter(Boolean),
          packageDeliverables: packageDeliverables.map((p) => p.trim()).filter(Boolean),
          faqs: faqs
            .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
            .filter((f) => f.question.length > 0 && f.answer.length > 0),
        },
      };

      const updated = await apiFetch<AdminServiceItem>("/admin/services", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      notify.success({
        title: "Service Details Updated",
        description: `Successfully saved all parameters for "${cleanTitle}".`,
      });

      onSaveSuccess(updated);
    } catch (err: unknown) {
      console.error("[Service Editor Error]:", err);
      notify.error({
        title: "Save Failed",
        description: err instanceof Error ? err.message : "Failed to update service details.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Return to Services Catalog"
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Return to Services Catalog"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Editing: {service.title}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  /services/{service.slug}
                </span>
                {isPopular && <Badge variant="yellow" size="sm">Popular</Badge>}
                {isFeatured && <Badge variant="indigo" size="sm">Featured</Badge>}
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-normal">
                Update service specifications, statutory fee structures, checklists, and client FAQs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <Link
              href={`/services/${service.slug}`}
              target="_blank"
              aria-label={`Preview live customer page for ${service.title} in new tab`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg border border-slate-200 text-slate-700 hover:text-primary hover:bg-slate-50 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Eye size={13} className="text-slate-500" />
              <span>Preview Live Page</span>
              <SquareArrowOutUpRight size={11} className="text-slate-500 ml-0.5" />
            </Link>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={isSaving}
              aria-label="Cancel editing and return to services list"
              className="text-xs font-semibold min-h-[36px] px-3 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              aria-label="Save all changes to service"
              className="text-xs font-bold flex items-center gap-1.5 min-h-[36px] px-3.5 shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save All Changes</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 pt-4 mt-4 border-t border-slate-100 overflow-x-auto scrollbar-none">
          {[
            { id: "ALL", label: "All Sections", icon: Layers },
            { id: "GENERAL", label: "General & Copy", icon: FileText },
            { id: "PRICING", label: "Pricing & Badges", icon: DollarSign },
            { id: "CONTENT", label: "Checklists & Deliverables", icon: ListChecks },
            { id: "FAQS", label: "FAQs Management", icon: FaqIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                aria-label={`View ${tab.label} section`}
                aria-pressed={isActive}
                className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* ============================================================ */}
        {/* SECTION 1: GENERAL & DESCRIPTIONS */}
        {/* ============================================================ */}
        {(activeTab === "ALL" || activeTab === "GENERAL") && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  General Information & Copy
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-normal">Basic metadata and overview copy</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="service-title-input" className="block text-xs font-semibold text-slate-700">
                  Service Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="service-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="e.g. GST Registration & Filing Service"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="service-duration-input" className="block text-xs font-semibold text-slate-700">
                  Processing SLA / Duration
                </label>
                <div className="relative">
                  <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    id="service-duration-input"
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="e.g. 7-15 working days"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label htmlFor="service-image-input" className="block text-xs font-semibold text-slate-700">
                  Banner Image URL / Asset Path
                </label>
                <input
                  id="service-image-input"
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="/images/services/gst.jpg"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="service-slug-input" className="block text-xs font-semibold text-slate-700">
                  Permanent Identifier (Slug)
                </label>
                <input
                  id="service-slug-input"
                  type="text"
                  value={service.slug}
                  disabled
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="service-short-desc-input" className="block text-xs font-semibold text-slate-700">
                Short Description (Listing cards, meta preview)
              </label>
              <textarea
                id="service-short-desc-input"
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-normal text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Concise 1-2 sentence description for search results and catalogue cards..."
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="service-desc-input" className="block text-xs font-semibold text-slate-700">
                In-Depth Overview (Displayed on top of customer service detail page)
              </label>
              <textarea
                id="service-desc-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white font-normal text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Comprehensive statutory overview explaining legal compliance, statutory obligations, and procedure..."
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 2: PRICING & VISIBILITY */}
        {/* ============================================================ */}
        {(activeTab === "ALL" || activeTab === "PRICING") && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-700" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Fee Structure & Visibility
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-normal">Statutory fees and commercial pricing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Government Fee */}
              <div className="space-y-1">
                <label htmlFor="service-govt-fee-input" className="block text-xs font-semibold text-slate-700">
                  Government Statutory Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold pointer-events-none">₹</span>
                  <input
                    id="service-govt-fee-input"
                    type="number"
                    min="0"
                    step="1"
                    value={govtFee}
                    onChange={(e) => setGovtFee(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary tabular-nums"
                    placeholder="0"
                    required
                  />
                </div>
                <span className="text-xs text-slate-500 block leading-normal mt-1">Directly remitted to ministry portal</span>
              </div>

              {/* Professional Fee */}
              <div className="space-y-1">
                <label htmlFor="service-prof-fee-input" className="block text-xs font-semibold text-slate-700">
                  Professional Filing Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold pointer-events-none">₹</span>
                  <input
                    id="service-prof-fee-input"
                    type="number"
                    min="0"
                    step="1"
                    value={profFee}
                    onChange={(e) => setProfFee(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary tabular-nums"
                    placeholder="0"
                    required
                  />
                </div>
                <span className="text-xs text-slate-500 block leading-normal mt-1">Compliance drafting and legal margin</span>
              </div>

              {/* Original Strikethrough Price */}
              <div className="space-y-1">
                <label htmlFor="service-orig-price-input" className="block text-xs font-semibold text-slate-700">
                  Original / Strikethrough Price (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold pointer-events-none">₹</span>
                  <input
                    id="service-orig-price-input"
                    type="number"
                    min="0"
                    step="1"
                    value={origPrice}
                    onChange={(e) => setOrigPrice(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2 rounded-lg border border-slate-200 bg-white font-mono font-medium text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary tabular-nums"
                    placeholder="Optional MRP"
                  />
                </div>
                <span className="text-xs text-slate-500 block leading-normal mt-1">Shows discount badge on client card</span>
              </div>
            </div>

            {/* Flat Integrated Total Summary Line (No nested card) */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Total Client Package Fee
                </span>
                <span className="text-xs text-slate-600 font-mono mt-0.5 block">
                  {formatCurrency(numGovt)} Govt + {formatCurrency(numProf)} Professional
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {formatCurrency(calculatedTotal)}
                </span>
              </div>
            </div>

            {/* Catalog Visibility Controls */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">Catalog Visibility Badges</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  htmlFor="service-popular-toggle"
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    isPopular
                      ? "bg-amber-50/70 border-amber-300 text-amber-950"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <input
                    id="service-popular-toggle"
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="mt-0.5 size-4 rounded accent-primary cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block">Popular Badge</span>
                    <span className="text-xs text-slate-600 block leading-normal mt-0.5">
                      Highlights this service with an amber Popular badge in search lists.
                    </span>
                  </div>
                </label>

                <label
                  htmlFor="service-featured-toggle"
                  className={`flex items-start gap-3 p-3 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                    isFeatured
                      ? "bg-indigo-50/70 border-indigo-300 text-indigo-950"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <input
                    id="service-featured-toggle"
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="mt-0.5 size-4 rounded accent-primary cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block">Homepage Featured</span>
                    <span className="text-xs text-slate-600 block leading-normal mt-0.5">
                      Promotes this service in the curated recommendation section on the homepage.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 3: CONTENT & CHECKLISTS (BENEFITS, ELIGIBILITY, DOCS) */}
        {/* ============================================================ */}
        {(activeTab === "ALL" || activeTab === "CONTENT") && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ListChecks size={16} className="text-primary" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Statutory Checklists & Deliverables
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-normal">Tabs displayed on the customer product page</span>
            </div>

            {/* 3A: Key Benefits */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>Key Benefits ({benefits.length})</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                    Key advantages displayed on customer page
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddListItem(setBenefits)}
                  aria-label="Add new benefit item"
                  className="text-xs font-bold flex items-center gap-1.5 min-h-[36px] px-3 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Plus size={12} />
                  <span>Add Benefit</span>
                </Button>
              </div>

              <div className="space-y-2">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 w-5 text-right shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      aria-label={`Benefit item ${idx + 1}`}
                      value={benefit}
                      onChange={(e) => handleListChange(setBenefits, idx, e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Legal protection for your brand name and logo across India..."
                    />
                    <button
                      type="button"
                      aria-label={`Remove benefit item ${idx + 1}`}
                      onClick={() => handleRemoveListItem(setBenefits, idx)}
                      className="p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3B: Eligibility Criteria */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-700" />
                    <span>Eligibility Criteria ({eligibility.length})</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                    Who qualifies to apply for this statutory service
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddListItem(setEligibility)}
                  aria-label="Add new eligibility criteria"
                  className="text-xs font-bold flex items-center gap-1.5 min-h-[36px] px-3 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Plus size={12} />
                  <span>Add Criteria</span>
                </Button>
              </div>

              <div className="space-y-2">
                {eligibility.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 w-5 text-right shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      aria-label={`Eligibility item ${idx + 1}`}
                      value={item}
                      onChange={(e) => handleListChange(setEligibility, idx, e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Proprietorship, Partnership, Private Limited Company, or Individual..."
                    />
                    <button
                      type="button"
                      aria-label={`Remove eligibility criteria ${idx + 1}`}
                      onClick={() => handleRemoveListItem(setEligibility, idx)}
                      className="p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3C: Required Documents */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText size={13} className="text-blue-600" />
                    <span>Required Documents Checklist ({requiredDocuments.length})</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                    Documents clients must prepare and upload
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddListItem(setRequiredDocuments)}
                  aria-label="Add new required document checklist item"
                  className="text-xs font-bold flex items-center gap-1.5 min-h-[36px] px-3 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Plus size={12} />
                  <span>Add Document</span>
                </Button>
              </div>

              <div className="space-y-2">
                {requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 w-5 text-right shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      aria-label={`Required document ${idx + 1}`}
                      value={doc}
                      onChange={(e) => handleListChange(setRequiredDocuments, idx, e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Identity Proof (PAN Card / Aadhaar Card of Directors)..."
                    />
                    <button
                      type="button"
                      aria-label={`Remove document ${idx + 1}`}
                      onClick={() => handleRemoveListItem(setRequiredDocuments, idx)}
                      className="p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D: Package Deliverables */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ListChecks size={13} className="text-emerald-700" />
                    <span>Package Deliverables ({packageDeliverables.length})</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-normal">
                    Official deliverables returned upon completion
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddListItem(setPackageDeliverables)}
                  aria-label="Add new package deliverable"
                  className="text-xs font-bold flex items-center gap-1.5 min-h-[36px] px-3 focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Plus size={12} />
                  <span>Add Deliverable</span>
                </Button>
              </div>

              <div className="space-y-2">
                {packageDeliverables.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 w-5 text-right shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      aria-label={`Package deliverable ${idx + 1}`}
                      value={item}
                      onChange={(e) => handleListChange(setPackageDeliverables, idx, e.target.value)}
                      className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      placeholder="e.g. Government Certified Registration Certificate & ARN Number..."
                    />
                    <button
                      type="button"
                      aria-label={`Remove package deliverable ${idx + 1}`}
                      onClick={() => handleRemoveListItem(setPackageDeliverables, idx)}
                      className="p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQS) */}
        {/* ============================================================ */}
        {(activeTab === "ALL" || activeTab === "FAQS") && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FaqIcon size={16} className="text-primary" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Frequently Asked Questions (FAQs) ({faqs.length})
                </h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFaq}
                aria-label="Add new frequently asked question"
                className="text-xs font-bold flex items-center gap-1.5 min-h-[36px] px-3 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Plus size={12} />
                <span>Add FAQ</span>
              </Button>
            </div>

            <p className="text-xs text-slate-600 max-w-prose leading-normal">
              Common client inquiries displayed in the service page FAQ accordion.
            </p>

            {/* Flat divided FAQ rows (Zero nested cards) */}
            <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="py-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700 tracking-wider">
                      Question {idx + 1}
                    </span>
                    <button
                      type="button"
                      aria-label={`Delete FAQ #${idx + 1}`}
                      onClick={() => handleRemoveFaq(idx)}
                      className="p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Delete this FAQ"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <input
                    type="text"
                    aria-label={`FAQ #${idx + 1} Question`}
                    value={faq.question}
                    onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white font-semibold text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Enter question, e.g. How long does the approval process take?"
                  />

                  <textarea
                    rows={2}
                    aria-label={`FAQ #${idx + 1} Answer`}
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                    className="w-full text-xs px-3 py-1.5 rounded-md border border-slate-200 bg-white font-normal text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Enter clear, comprehensive answer for the client..."
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Save & Cancel Controls */}
        <div className="sticky bottom-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3 sm:p-4 shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="hidden sm:inline">Changes take effect immediately on all new user filings.</span>
            <span className="sm:hidden font-mono font-bold text-slate-900">{formatCurrency(calculatedTotal)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={isSaving}
              aria-label="Cancel editing and return to services catalog"
              className="text-xs font-semibold min-h-[36px] px-3.5 focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSaving}
              aria-label="Save all changes to service catalog"
              className="text-xs font-bold flex items-center gap-1.5 min-h-[36px] px-4 shadow-xs focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>Save All Changes</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * Main Admin Services Page Component
 */
export default function AdminServicesPage() {
  const modal = useModal();
  const [services, setServices] = useState<AdminServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "POPULAR" | "FEATURED">("ALL");

  // In-Place Service Editing State (No Modal)
  const [editingService, setEditingService] = useState<AdminServiceItem | null>(null);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<AdminServiceItem[]>("/admin/services");
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch admin services:", err);
      notify.error({
        title: "Catalog Load Failed",
        description: "Could not load statutory services catalog.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filtered Services
  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return services.filter((s) => {
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        (s.shortDescription && s.shortDescription.toLowerCase().includes(q));

      if (categoryFilter === "POPULAR") return matchesSearch && Boolean(s.popular);
      if (categoryFilter === "FEATURED") return matchesSearch && Boolean(s.featured);

      return matchesSearch;
    });
  }, [services, searchQuery, categoryFilter]);

  const {
    pageItems: paginatedServices,
    pageIndex,
    pageSize,
    totalItems,
    totalPages,
    entryStart,
    entryEnd,
    pageSizeOptions,
    setPageIndex,
    setPageSize,
  } = useClientPagination(filteredServices, {
    initialPageSize: 10,
    resetDeps: [searchQuery, categoryFilter],
  });

  const handleServiceArchitectureGuide = () => {
    modal.open({
      title: "Statutory Catalog Provisioning",
      description: "How statutory compliance modules are registered in the codebase.",
      size: "md",
      content: (
        <div className="space-y-3 pt-1 text-left text-xs">
          <p className="text-slate-600 leading-relaxed max-w-prose">
            Statutory services are schema-driven workflows configured with validation presets, document checklists, and government processing pipelines.
          </p>
          <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Registration Steps:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-0.5">
              <li>Add schema in <code className="font-mono text-primary font-semibold">src/features/services/config/</code>.</li>
              <li>Register in <code className="font-mono text-primary font-semibold">src/features/services/registry/index.ts</code>.</li>
              <li>Sync with database via Prisma seed or migration.</li>
            </ol>
          </div>
          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => modal.closeAll()} className="text-xs font-bold">
              Close
            </Button>
          </div>
        </div>
      ),
    });
  };

  const popularCount = services.filter((s) => s.popular).length;
  const featuredCount = services.filter((s) => s.featured).length;
  const avgPrice =
    services.length > 0 ? Math.round(services.reduce((a, b) => a + (b.price || 0), 0) / services.length) : 0;

  // Handle Save Success from Comprehensive Editor
  const handleEditorSaveSuccess = (updated: AdminServiceItem) => {
    setServices((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
    setEditingService(updated);
  };

  // -------------------------------------------------------------
  // If an admin is currently editing a service, render the in-place editor!
  // -------------------------------------------------------------
  if (editingService) {
    return (
      <ComprehensiveServiceEditor
        service={editingService}
        onBack={() => setEditingService(null)}
        onSaveSuccess={handleEditorSaveSuccess}
      />
    );
  }

  // -------------------------------------------------------------
  // Otherwise, render the main Services Catalog List Table
  // -------------------------------------------------------------
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Inline Status Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Services Catalog & Pricing
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-prose leading-normal">
            Configure statutory government fees, descriptions, required documents, and catalog visibility.
          </p>
        </div>

        {/* Action Controls & Metrics */}
        <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
            <span className="text-xs font-semibold text-emerald-800">Average Client Fee:</span>
            <span className="font-bold text-emerald-900 font-mono tabular-nums">{formatCurrency(avgPrice)}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleServiceArchitectureGuide}
            aria-label="Open statutory service provisioning architecture guide"
            className="text-xs font-semibold text-slate-700 hover:text-primary flex items-center gap-1.5 min-h-[36px] px-3 focus-visible:ring-2 focus-visible:ring-primary"
          >
            <HelpCircle size={13} className="text-slate-500" />
            <span>Architecture Guide</span>
          </Button>
        </div>
      </div>

      {/* Toolbar: Search + Category Filter Tabs + Pagination */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
        {/* Left: Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoryFilter("ALL")}
            aria-pressed={categoryFilter === "ALL"}
            aria-label={`Show all ${services.length} services`}
            className={`px-3 py-1.5 min-h-[36px] rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              categoryFilter === "ALL" ? "bg-white text-primary shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("POPULAR")}
            aria-pressed={categoryFilter === "POPULAR"}
            aria-label={`Show popular services only (${popularCount})`}
            className={`px-3 py-1.5 min-h-[36px] rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              categoryFilter === "POPULAR" ? "bg-white text-primary shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Popular ({popularCount})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("FEATURED")}
            aria-pressed={categoryFilter === "FEATURED"}
            aria-label={`Show featured services only (${featuredCount})`}
            className={`px-3 py-1.5 min-h-[36px] rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              categoryFilter === "FEATURED" ? "bg-white text-primary shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Featured ({featuredCount})
          </button>
        </div>

        {/* Right: Search Box + Pagination Controls */}
        <div className="flex items-center gap-2.5 sm:ml-auto">
          <div className="relative w-full sm:w-64">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              aria-label="Filter services by title or slug"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or slug..."
              className="w-full pl-8 pr-7 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs outline-none focus:bg-white focus:border-primary text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 cursor-pointer p-0.5"
                title="Clear filter"
                aria-label="Clear filter query"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <TablePaginationToolbar
            pageSize={pageSize}
            pageIndex={pageIndex}
            totalPages={totalPages}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={setPageSize}
            onPageChange={setPageIndex}
          />
        </div>
      </div>

      {/* Services Table Container */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        {/* Desktop View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4 text-right font-mono">Govt. Fee</th>
                <th className="py-3 px-4 text-right font-mono">Professional Fee</th>
                <th className="py-3 px-4 text-right font-mono">Total Client Price</th>
                <th className="py-3 px-4 text-center">Turnaround</th>
                <th className="py-3 px-4 text-center">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading services catalog...
                  </td>
                </tr>
              ) : filteredServices.length > 0 ? (
                paginatedServices.map((service) => (
                  <tr
                    key={service.id}
                    onClick={() => setEditingService(service)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Title & Slug */}
                    <td className="py-3 px-4">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">
                          {service.title}
                        </p>
                        <span className="text-xs text-slate-500 font-mono mt-0.5 block">
                          /services/{service.slug}
                        </span>
                      </div>
                    </td>

                    {/* Govt Fee */}
                    <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                      {formatCurrency(service.governmentFee)}
                    </td>

                    {/* Professional Fee */}
                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 tabular-nums">
                      {formatCurrency(service.professionalFee)}
                    </td>

                    {/* Total Client Price */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                      {formatCurrency(service.price)}
                    </td>

                    {/* SLA */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <Clock size={11} className="text-slate-500" />
                        {service.duration || "5-7 Days"}
                      </span>
                    </td>

                    {/* Visibility */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {service.popular && <Badge variant="yellow" size="sm">Popular</Badge>}
                        {service.featured && <Badge variant="indigo" size="sm">Featured</Badge>}
                        {!service.popular && !service.featured && (
                          <span className="text-slate-500 text-xs font-normal">Standard</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/services/${service.slug}`} target="_blank">
                          <button
                            type="button"
                            className="p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-slate-500 hover:text-primary hover:bg-slate-100 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            title={`Open live customer page for ${service.title}`}
                            aria-label={`Open live customer page for ${service.title}`}
                          >
                            <SquareArrowOutUpRight size={14} />
                          </button>
                        </Link>

                        <button
                          type="button"
                          onClick={() => setEditingService(service)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[36px] text-slate-700 hover:text-primary hover:bg-primary-light border border-slate-200 hover:border-primary-border rounded-md transition-colors cursor-pointer font-bold text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          title={`Edit all details for ${service.title}`}
                          aria-label={`Edit all details for ${service.title}`}
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-600">
                    <Layers size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-800 text-xs">No services match your filter</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {searchQuery
                        ? `No results for "${searchQuery}".`
                        : "No services active under this category."}
                    </p>
                    {(searchQuery || categoryFilter !== "ALL") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setCategoryFilter("ALL");
                        }}
                        className="mt-2.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading services...
            </div>
          ) : filteredServices.length > 0 ? (
            paginatedServices.map((service) => (
              <div
                key={service.id}
                onClick={() => setEditingService(service)}
                className="p-3.5 space-y-2.5 active:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 leading-snug truncate">{service.title}</h4>
                    <p className="text-xs text-slate-500 font-mono">/services/{service.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {service.popular && <Badge variant="yellow" size="sm">Popular</Badge>}
                    {service.featured && <Badge variant="indigo" size="sm">Featured</Badge>}
                    {!service.popular && !service.featured && (
                      <span className="text-slate-500 text-xs">Standard</span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-md p-2.5 grid grid-cols-3 gap-1.5 text-center text-xs border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Govt.</span>
                    <span className="font-mono font-medium text-slate-700 tabular-nums">{formatCurrency(service.governmentFee)}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Prof.</span>
                    <span className="font-mono font-medium text-slate-700 tabular-nums">{formatCurrency(service.professionalFee)}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Total</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">{formatCurrency(service.price)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1 text-slate-600 text-xs">
                    <Clock size={11} className="text-slate-500" />
                    <span>{service.duration || "5-7 Days"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/services/${service.slug}`} target="_blank">
                      <button
                        type="button"
                        className="p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-slate-500 hover:text-primary bg-slate-100 rounded-md transition-colors cursor-pointer"
                        title="View live page"
                        aria-label={`View live page for ${service.title}`}
                      >
                        <SquareArrowOutUpRight size={13} />
                      </button>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditingService(service)}
                      aria-label={`Edit ${service.title}`}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 min-h-[36px] text-primary bg-primary-light hover:bg-primary-light/80 border border-primary-border rounded-md font-bold text-xs cursor-pointer"
                    >
                      <Edit3 size={11} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">No services found.</div>
          )}
        </div>

        {filteredServices.length > 0 && (
          <TablePagination
            entryStart={entryStart}
            entryEnd={entryEnd}
            totalItems={totalItems}
          />
        )}
      </div>

      {/* Footer Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
          Statutory fee and content changes take effect immediately on all new user filings and product pages.
        </span>
        <button
          type="button"
          onClick={handleServiceArchitectureGuide}
          className="text-slate-600 hover:text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
        >
          <HelpCircle size={12} />
          <span>Provisioning Architecture</span>
        </button>
      </div>
    </div>
  );
}
