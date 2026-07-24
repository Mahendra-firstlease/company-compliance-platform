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
import {
  UserCircle,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const modal = useModal();
  const queryClient = useQueryClient();
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);

  // Multi-service selection basket state
  const [selectedServiceSlugs, setSelectedServiceSlugs] = useState<string[]>([]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  // 1. Fetch User & Business Profile dynamically from DB via Server Action
  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await getUserProfileWithBusinessAction();
      if (!res.success) {
        throw new Error(res.error || "Failed to load profile");
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
        return res && res.length > 0 ? res : fallbackServices;
      } catch (err) {
        return fallbackServices;
      }
    },
  });

  const user = profileData?.user;
  const businessProfile = profileData?.businessProfile;

  // 3. Dynamic Service Suggestions Algorithm based on Business Profile
  const suggestedServices = useMemo(() => {
    const list = catalogServices || fallbackServices;
    if (!businessProfile) {
      return list.slice(0, 4);
    }

    const { industry, businessType, annualTurnover, employeeCount } = businessProfile;

    return list
      .map((service) => {
        let score = 0;
        const titleLower = service.title.toLowerCase();
        const industryLower = (industry || "").toLowerCase();
        const typeLower = (businessType || "").toLowerCase();

        if (industryLower.includes("food") && (titleLower.includes("fssai") || titleLower.includes("food"))) {
          score += 10;
        }
        if (industryLower.includes("it") && (titleLower.includes("startup") || titleLower.includes("trademark") || titleLower.includes("gst"))) {
          score += 8;
        }
        if (industryLower.includes("manufacturing") && (titleLower.includes("factory") || titleLower.includes("pollution") || titleLower.includes("gst"))) {
          score += 10;
        }

        if (typeLower.includes("private limited") && (titleLower.includes("company") || titleLower.includes("pvt") || titleLower.includes("roc"))) {
          score += 9;
        }
        if (typeLower.includes("llp") && (titleLower.includes("llp") || titleLower.includes("partnership"))) {
          score += 9;
        }
        if (typeLower.includes("proprietorship") && (titleLower.includes("gst") || titleLower.includes("msme") || titleLower.includes("udyam"))) {
          score += 8;
        }

        if ((annualTurnover.includes("40L") || annualTurnover.includes("1Cr") || annualTurnover.includes("5Cr")) && titleLower.includes("gst")) {
          score += 9;
        }
        if ((employeeCount.includes("10-19") || employeeCount.includes("20-49") || employeeCount.includes("50+")) && (titleLower.includes("pf") || titleLower.includes("esi"))) {
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
      setSelectedServiceSlugs(suggestedServices.slice(0, 2).map((s) => s.slug));
    }
  }, [suggestedServices]);

  // Toggle Service Selection
  const toggleSelectService = (slug: string) => {
    setSelectedServiceSlugs((prev) =>
      prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]
    );
  };

  // Selected Services List & Total Price calculation
  const selectedServices = useMemo(() => {
    const list = catalogServices || fallbackServices;
    return list.filter((s) => selectedServiceSlugs.includes(s.slug));
  }, [catalogServices, selectedServiceSlugs]);

  const totalSelectedPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  // Open Multi-Service Combined Checkout Modal
  const handleOpenMultiCheckout = () => {
    if (selectedServices.length === 0) {
      return;
    }

    modal.open({
      title: "Batch Compliance Checkout",
      description: "Pay and initiate filings for selected services at once.",
      size: "md",
      content: (
        <MultiServiceCheckoutModal
          selectedServices={selectedServices}
          onRemoveService={(idOrSlug) =>
            setSelectedServiceSlugs((prev) => prev.filter((s) => s !== idOrSlug))
          }
          onSuccess={() => {
            setSelectedServiceSlugs([]);
          }}
          onCancel={() => modal.closeAll()}
        />
      ),
    });
  };

  if (status === "loading" || isProfileLoading) {
    return (
      <Section className="py-16 bg-slate-50 min-h-screen">
        <Container>
          <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
            <div className="h-32 bg-white rounded-lg border border-slate-200" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-white rounded-lg border border-slate-200" />
              <div className="h-64 bg-white rounded-lg border border-slate-200" />
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  const handleEditSuccess = () => {
    setIsEditingBusiness(false);
    refetchProfile();
    queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  };

  return (
    <Section className="py-12 bg-slate-50/70 min-h-screen pb-28">
      <Container>
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-lg bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl">
            <div className="absolute -right-10 -bottom-10 size-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-white text-2xl font-black uppercase shadow-inner">
                  {session?.user?.name?.[0] || session?.user?.email?.[0] || "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                      {session?.user?.name || "User Account"}
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold uppercase tracking-wider">
                      {(session?.user as any)?.role || "CLIENT"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                    <Mail className="size-3.5 text-indigo-400 shrink-0" />
                    <span>{session?.user?.email}</span>
                  </p>
                </div>
              </div>

              {!businessProfile && (
                <div className="bg-amber-500/15 border border-amber-500/30 rounded-lg p-3 flex items-center gap-3">
                  <AlertCircle className="size-5 text-amber-400 shrink-0" />
                  <span className="text-xs text-amber-200 font-medium">
                    Complete your 2-step Business Profile to get tailored statutory service recommendations.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Info & Business Profile Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1: User Personal Info */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <UserCircle className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">User Account Information</h2>
                    <p className="text-[11px] text-slate-400">Authenticated account details</p>
                  </div>
                </div>
                <ShieldCheck className="size-5 text-emerald-500" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <UserCircle className="size-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">Full Name</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{user?.name || session?.user?.name || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">Email Address</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{user?.email || session?.user?.email}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Phone className="size-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">Phone Number</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{user?.phone || "+91 9876543210"}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">Member Since</span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "Active User"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Business Regulatory Profile (2-Step Form Wizard Integration) */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Business Regulatory Profile</h2>
                    <p className="text-[11px] text-slate-400">2-Step Entity & Location Configuration</p>
                  </div>
                </div>

                {businessProfile && !isEditingBusiness && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBusiness(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="size-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* Render 2-Step Business Profile Wizard if editing OR missing */}
              {isEditingBusiness || !businessProfile ? (
                <div className="space-y-4">
                  {!businessProfile && (
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-800 font-medium">
                      👋 Welcome! Complete the 2-step business details below to get dynamic statutory service suggestions.
                    </div>
                  )}
                  <BusinessProfileForm
                    initialValues={businessProfile || undefined}
                    onSuccess={handleEditSuccess}
                    onCancel={businessProfile ? () => setIsEditingBusiness(false) : undefined}
                  />
                </div>
              ) : (
                /* Display Registered Business Details */
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Building2 className="size-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">Business Name</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{businessProfile.businessName}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Briefcase className="size-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">Entity Structure</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{businessProfile.businessType}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Layers className="size-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">Industry Sector</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{businessProfile.industry}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <MapPin className="size-4 text-slate-400" />
                      <span className="text-xs font-medium text-slate-500">State / Location</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{businessProfile.state}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <Users className="size-3.5" />
                        <span>Team Size</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{businessProfile.employeeCount}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                        <IndianRupee className="size-3.5" />
                        <span>Turnover</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">{businessProfile.annualTurnover}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Dynamic Service Suggestions with Multi-Service Checkbox Selection */}
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Suggested Statutory Services for Your Business
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Select multiple services below to build a single combined compliance package and pay at once.
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

            {/* Suggested Services Cards Grid with Selection Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestedServices.map((service) => {
                const isSelected = selectedServiceSlugs.includes(service.slug);

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
                    {/* Multi-Selection Checkbox Banner */}
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50/80 border-b border-slate-100 rounded-t-xl text-xs">
                      <div className="flex items-center gap-2 font-semibold text-slate-700">
                        <div
                          className={`size-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="size-3 stroke-[3]" />}
                        </div>
                        <span>{isSelected ? "Selected for Bundle" : "Click to Add to Bundle"}</span>
                      </div>

                      <span className="font-extrabold text-indigo-700">₹{service.price}</span>
                    </div>

                    {/* Service Card Content */}
                    <div className="p-2">
                      <ServiceCard service={service} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </Container>

      {/* Sticky Bottom Multi-Service Batch Payment Bar (Mobile & Desktop Optimized) */}
      {selectedServices.length > 0 && (
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
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                      {selectedServices.length} {selectedServices.length === 1 ? "Service" : "Services"} Selected
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
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                    Total Amount:
                  </span>
                  <span className="text-lg sm:text-xl font-black text-indigo-700 leading-tight">
                    ₹{totalSelectedPrice}
                  </span>
                </div>

                <Button
                  onClick={handleOpenMultiCheckout}
                  variant="primary"
                  size="lg"
                  className="font-bold text-xs py-2.5 sm:py-3 px-4 sm:px-6 shadow-md cursor-pointer flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                >
                  <ShieldCheck className="size-4 shrink-0" />
                  <span className="truncate">Pay & Apply ({selectedServices.length})</span>
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}
    </Section>
  );
}
