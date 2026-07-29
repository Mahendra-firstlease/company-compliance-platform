"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileCheck2,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  Edit3,
  Star,
  Sparkles,
  IndianRupee,
  Clock,
  Tag,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { ServicesGridSkeleton } from "@/components/ui/skeletons";
import Button from "@/components/common/Button";
import SearchBar from "@/components/common/SearchBar";
import Badge from "@/components/ui/Badge/Badge";
import { notify } from "@/lib/notify";
import { Service } from "@/types/services";

export default function AdminServicesManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      } else {
        notify.error("Failed to fetch services catalog.");
      }
    } catch (err) {
      console.error("Admin services fetch error:", err);
      notify.error("Network error fetching services.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());

      if (categoryFilter === "ALL") return matchesSearch;
      if (categoryFilter === "POPULAR") return matchesSearch && (s.popular || s.featured);
      if (categoryFilter === "EXPRESS")
        return matchesSearch && (s.duration.toLowerCase().includes("24") || s.duration.toLowerCase().includes("1-2"));

      return matchesSearch;
    });
  }, [services, searchTerm, categoryFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-6 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
            Catalog & Pricing Operations
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Statutory Services Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage 15+ statutory compliance services, fees, turnaround durations, and catalog availability in MySQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            className="p-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold"
            title="Refresh services catalog"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Services</span>
          </button>

          <Link href="/services">
            <Button variant="primary" size="sm" className="font-bold text-xs py-2.5 px-4 cursor-pointer flex items-center gap-1.5">
              <ExternalLink className="size-4" />
              <span>Preview Public Catalog</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Metrics Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Catalog Services</span>
          <p className="text-2xl font-black text-slate-900">{services.length}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Featured & Popular</span>
          <p className="text-2xl font-black text-indigo-600">
            {services.filter((s) => s.popular || s.featured).length}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Average Govt Fee</span>
          <p className="text-2xl font-black text-emerald-600">
            ₹
            {services.length > 0
              ? Math.round(services.reduce((acc, s) => acc + (s.governmentFee || 0), 0) / services.length)
              : 0}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Express Processing (≤48h)</span>
          <p className="text-2xl font-black text-amber-600">
            {services.filter((s) => s.duration.includes("24") || s.duration.includes("1-2")).length}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar using Reusable SearchBar Component */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Reusable SearchBar Component */}
        <div className="w-full sm:w-80">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search service title, slug, or details..."
            size="sm"
            fullWidth={true}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
          {[
            { label: "All Services", value: "ALL" },
            { label: "Popular & Featured", value: "POPULAR" },
            { label: "Express Processing", value: "EXPRESS" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === tab.value
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <ServicesGridSkeleton count={6} />
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id || service.slug}
              className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="size-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    <FileCheck2 className="size-5" />
                  </div>

                  <div className="flex items-center gap-1">
                    {service.popular && (
                      <Badge variant="indigo" rounded="full" size="sm">
                        Popular
                      </Badge>
                    )}
                    {service.featured && (
                      <Badge variant="green" rounded="full" size="sm">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-black text-sm text-slate-900 line-clamp-1">{service.title}</h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">/{service.slug}</p>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-2">
                    {service.shortDescription}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                {/* Fee Breakdown */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Govt Fee</span>
                    <span className="font-bold text-slate-800">₹{service.governmentFee || 0}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Prof Fee</span>
                    <span className="font-bold text-slate-800">₹{service.professionalFee || service.price}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Total</span>
                    <span className="font-black text-indigo-700">₹{service.price}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="size-3.5 text-indigo-500" />
                    <span>{service.duration}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedService(service)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="size-3.5" />
                      <span>Inspect</span>
                    </button>

                    <Link href={`/services/${service.slug}`} target="_blank">
                      <button
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="View landing page"
                      >
                        <ExternalLink className="size-3.5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-4">
          <div className="size-12 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <FileCheck2 className="size-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Services Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? "No statutory services match your search terms."
              : "No services are configured in MySQL."}
          </p>
        </div>
      )}

      {/* Service Details Inspection Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileCheck2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{selectedService.title}</h3>
                  <p className="text-[11px] font-mono text-slate-400">/{selectedService.slug}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                className="size-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Description</span>
                <p className="font-medium text-slate-700 leading-relaxed mt-0.5">{selectedService.description || selectedService.shortDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Government Statutory Fee</span>
                  <span className="font-bold text-slate-900">₹{selectedService.governmentFee || 0}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Professional Processing Fee</span>
                  <span className="font-bold text-slate-900">₹{selectedService.professionalFee || selectedService.price}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Package Fee</span>
                  <span className="font-black text-indigo-700 text-sm">₹{selectedService.price}</span>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Turnaround Time</span>
                  <span className="font-bold text-slate-800">{selectedService.duration}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link href={`/services/${selectedService.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="text-xs font-bold flex items-center gap-1.5">
                  <span>Open Public Page</span>
                  <ExternalLink className="size-3.5" />
                </Button>
              </Link>

              <Button
                onClick={() => setSelectedService(null)}
                variant="primary"
                size="sm"
                className="text-xs font-bold"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
