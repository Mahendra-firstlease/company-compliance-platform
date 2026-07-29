"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import Button from "@/components/common/Button";
import ServiceCard from "@/components/cards/ServicesCard";
import BusinessProfileForm from "@/components/forms/BusinessProfileForm";
import MultiServiceCheckoutModal from "@/features/services/detail/MultiServiceCheckoutModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { servicesService } from "@/services/services";
import { services as fallbackServices } from "@/data/services";
import { Service } from "@/types/services";
import { getUserProfileWithBusinessAction } from "@/lib/actions/profile";
import { useModal } from "@/components/ui/overlay";
import { ProfileSkeleton } from "@/components/ui/skeletons";
import {
  Building2,
  Mail,
  ShieldCheck,
  Sparkles,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Layers,
  MapPin,
  Users,
  IndianRupee,
  Briefcase,
  ShoppingBag,
  Check,
} from "lucide-react";

export default function BusinessProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const modal = useModal();
  const queryClient = useQueryClient();
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Multi-service selection state
  const [selectedServiceSlugs, setSelectedServiceSlugs] = useState<string[]>(
    [],
  );

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/business-profile");
    }
  }, [status, router]);

  // 1. Fetch User Profile & Business Profile from MySQL via Server Action
  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["userBusinessProfile"],
    queryFn: async () => {
      const res = await getUserProfileWithBusinessAction();
      if (!res.success) {
        throw new Error(res.error || "Failed to load business profile");
      }
      return res.data;
    },
    enabled: status === "authenticated",
  });

  // 2. Fetch Catalog Services dynamically
  const { data: catalogServices } = useQuery({
    queryKey: ["servicesCatalog"],
    queryFn: async () => {
      try {
        const res = await servicesService.getServices();
        return res || [];
      } catch (err) {
        return [];
      }
    },
  });

  const user = profileData?.user;
  const businessProfile = profileData?.businessProfile;

  // 3. Dynamic Service Suggestions Algorithm based on Business Profile
  const suggestedServices = useMemo(() => {
    const list = catalogServices || [];
    if (!businessProfile) {
      return list.slice(0, 4);
    }

    const { industry, businessType, annualTurnover, employeeCount } =
      businessProfile;

    return list
      .map((service) => {
        let score = 0;
        const titleLower = service.title.toLowerCase();
        const industryLower = (industry || "").toLowerCase();
        const typeLower = (businessType || "").toLowerCase();

        if (
          industryLower.includes("food") &&
          (titleLower.includes("fssai") || titleLower.includes("food"))
        ) {
          score += 10;
        }
        if (
          industryLower.includes("it") &&
          (titleLower.includes("startup") ||
            titleLower.includes("trademark") ||
            titleLower.includes("gst"))
        ) {
          score += 8;
        }
        if (
          industryLower.includes("manufacturing") &&
          (titleLower.includes("factory") ||
            titleLower.includes("pollution") ||
            titleLower.includes("gst"))
        ) {
          score += 10;
        }

        if (
          typeLower.includes("private limited") &&
          (titleLower.includes("company") ||
            titleLower.includes("pvt") ||
            titleLower.includes("roc"))
        ) {
          score += 9;
        }
        if (
          typeLower.includes("llp") &&
          (titleLower.includes("llp") || titleLower.includes("partnership"))
        ) {
          score += 9;
        }
        if (
          typeLower.includes("proprietorship") &&
          (titleLower.includes("gst") ||
            titleLower.includes("msme") ||
            titleLower.includes("udyam"))
        ) {
          score += 8;
        }

        if (
          (annualTurnover.includes("40L") ||
            annualTurnover.includes("1Cr") ||
            annualTurnover.includes("5Cr")) &&
          titleLower.includes("gst")
        ) {
          score += 9;
        }
        if (
          (employeeCount.includes("10-19") ||
            employeeCount.includes("20-49") ||
            employeeCount.includes("50+")) &&
          (titleLower.includes("pf") || titleLower.includes("esi"))
        ) {
          score += 8;
        }

        if (service.popular || service.featured) {
          score += 3;
        }

        return { service, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.service)
      .slice(0, 4);
  }, [catalogServices, businessProfile]);

  // Pre-select first 2 suggested services by default
  useEffect(() => {
    if (suggestedServices.length > 0 && selectedServiceSlugs.length === 0) {
      setSelectedServiceSlugs(
        suggestedServices.slice(0, 2).map((s) => s.slug),
      );
    }
  }, [suggestedServices]);

  // Toggle Selection
  const toggleSelectService = (slug: string) => {
    setSelectedServiceSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((item) => item !== slug)
        : [...prev, slug],
    );
  };

  const selectedServices = useMemo(() => {
    const list = catalogServices || [];
    return list.filter((s) => selectedServiceSlugs.includes(s.slug));
  }, [catalogServices, selectedServiceSlugs]);

  const totalSelectedPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const handleOpenMultiCheckout = () => {
    if (selectedServices.length === 0) return;

    modal.open({
      title: "Batch Compliance Checkout",
      description: "Pay and initiate filings for selected services at once.",
      size: "md",
      content: (
        <MultiServiceCheckoutModal
          selectedServices={selectedServices}
          onRemoveService={(idOrSlug) =>
            setSelectedServiceSlugs((prev) =>
              prev.filter((s) => s !== idOrSlug),
            )
          }
          onSuccess={() => {
            setSelectedServiceSlugs([]);
          }}
          onCancel={() => modal.closeAll()}
        />
      ),
    });
  };

  const handleFormSuccess = () => {
    setIsEditingBusiness(false);
    refetchProfile();
    queryClient.invalidateQueries({ queryKey: ["userBusinessProfile"] });
  };

  if (status === "loading" || isProfileLoading) {
    return (
      <Section className="py-12 bg-slate-50 min-h-screen">
        <Container>
          <div className="max-w-5xl mx-auto">
            <ProfileSkeleton />
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="py-12 bg-slate-50/70 min-h-screen pb-28">
      <Container>
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Top Banner */}
          <div className="relative overflow-hidden rounded-lg bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
            <div className="absolute -right-10 -bottom-10 size-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
                  🏢 Business Regulatory Hub
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-2">
                  {businessProfile
                    ? businessProfile.businessName
                    : "Setup Your Business Profile"}
                </h1>
                <p className="text-xs md:text-sm text-slate-300 mt-1">
                  Complete your 2-step business setup to view tailored statutory
                  compliance packages and recommended filings.
                </p>
              </div>

              {businessProfile && (
                <div className="flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-lg p-3 shrink-0">
                  <ShieldCheck className="size-5 text-indigo-400" />
                  <div className="text-xs">
                    <p className="font-bold text-white">
                      {businessProfile.businessType}
                    </p>
                    <p className="text-[11px] text-indigo-300">
                      {businessProfile.state}, India
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 1: 2-Step Business Profile Setup OR Business Profile Details View */}
          {isEditingBusiness || !businessProfile ? (
            <div className="space-y-4">
              {!businessProfile && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 font-medium flex items-center gap-3">
                  <AlertCircle className="size-5 text-indigo-600 shrink-0" />
                  <span>
                    👋 Welcome! Complete the 2-step business details below to
                    unlock personalized statutory compliance packages.
                  </span>
                </div>
              )}
              <BusinessProfileForm
                initialValues={businessProfile || undefined}
                onSuccess={handleFormSuccess}
                onCancel={
                  businessProfile
                    ? () => setIsEditingBusiness(false)
                    : undefined
                }
              />
            </div>
          ) : (
            /* Business Profile Summary Card */
            <div className="bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold sm:text-base  sm:font-bold text-slate-900">
                      Business Profile
                    </h2>
                    <p className="text-xs text-slate-400">
                      Current business profile details
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingBusiness(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="size-4" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Building2 className="size-4 text-slate-400" />
                    <span>Business Name</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {businessProfile.businessName}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Briefcase className="size-4 text-slate-400" />
                    <span>Entity Structure</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {businessProfile.businessType}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Layers className="size-4 text-slate-400" />
                    <span>Industry Sector</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {businessProfile.industry}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <MapPin className="size-4 text-slate-400" />
                    <span>State Location</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {businessProfile.state}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Users className="size-4 text-slate-400" />
                    <span>Team Size</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {businessProfile.employeeCount}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <IndianRupee className="size-4 text-slate-400" />
                    <span>Annual Turnover</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {businessProfile.annualTurnover}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Dynamic Suggested Services with Checkbox Multi-Selection */}
          {businessProfile && (
            <div className="space-y-6 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {/* <Sparkles className="size-5 text-indigo-600" /> */}
                    <h2 className="text-lg font-bold text-slate-900">
                      Suggested Statutory Services for{" "}
                      {businessProfile.businessName}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Select multiple services below to build your custom
                    compliance package and pay at once.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/services")}
                  className="hidden sm:flex text-xs font-bold"
                >
                  View Full Catalog →
                </Button>
              </div>

              {/* Suggested Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestedServices.map((service) => {
                  const isSelected = selectedServiceSlugs.includes(
                    service.slug,
                  );

                  return (
                    <div
                      key={service.id || service.slug}
                      onClick={() => toggleSelectService(service.slug)}
                      className={`relative rounded-lg border transition-all duration-300 cursor-pointer overflow-hidden p-1 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-md"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      {/* Checkbox Banner */}
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 border-b border-slate-100 rounded-t-xl text-xs">
                        <div className="flex items-center gap-2 font-semibold text-slate-700">
                          <div
                            className={`size-4 rounded border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <Check className="size-3 stroke-3" />
                            )}
                          </div>
                          <span>
                            {isSelected
                              ? "Selected for Package"
                              : "Click to Add"}
                          </span>
                        </div>

                        <span className="font-bold text-indigo-700">
                          ₹{service.price}
                        </span>
                      </div>

                      {/* White Background Service Card */}
                      <div className="p-2">
                        <ServiceCard service={service} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Container>

      {/* Sticky Bottom Multi-Service Batch Payment Bar (Mobile & Desktop Optimized) */}
      {selectedServices.length > 0 && businessProfile && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 sm:p-4 animate-in slide-in-from-bottom duration-300">
          <Container>
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              {/* Selected Services Info */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="size-9 sm:size-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <ShoppingBag className="size-4 sm:size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {selectedServices.length}{" "}
                      {selectedServices.length === 1 ? "Service" : "Services"}{" "}
                      Selected
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 shrink-0">
                      Package
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                    {selectedServices.map((s) => s.title).join(" + ")}
                  </p>
                </div>
              </div>

              {/* Total Price & Pay Button Container */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-t-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block leading-none">
                    Total Amount:
                  </span>
                  <span className="text-balance sm:text-xl font-black text-indigo-700 leading-tight">
                    ₹{totalSelectedPrice}
                  </span>
                </div>

                <Button
                  onClick={handleOpenMultiCheckout}
                  variant="primary"
                  size="lg"
                  className="font-semibold text-xs py-2.5 sm:py-3 px-4 sm:px-6 shadow-md cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                >
                  <ShieldCheck className="size-4 shrink-0" />
                  <span className="truncate">
                    Pay & Apply ({selectedServices.length})
                  </span>
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}
    </Section>
  );
}
