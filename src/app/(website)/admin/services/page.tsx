"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Search,
  Edit3,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Tag,
  DollarSign,
  Plus,
  ArrowRight,
  ShieldCheck,
  SquareArrowOutUpRight,
} from "lucide-react";
import Button from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Badge from "@/components/ui/Badge/Badge";
import apiFetch from "@/lib/apiClient";
import { notify } from "@/lib/notify";
import { useModal } from "@/components/ui/overlay";
import Link from "next/link";

interface AdminServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  price: number;
  governmentFee: number;
  professionalFee: number;
  duration: string;
  popular?: boolean;
  featured?: boolean;
}

export default function AdminServicesPage() {
  const modal = useModal();
  const [services, setServices] = useState<AdminServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await apiFetch<AdminServiceItem[]>("/admin/services");
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch admin services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filtered Services Computation
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.slug.toLowerCase().includes(searchQuery.toLowerCase());

      if (categoryFilter === "POPULAR") return matchesSearch && s.popular;
      if (categoryFilter === "FEATURED") return matchesSearch && s.featured;

      return matchesSearch;
    });
  }, [services, searchQuery, categoryFilter]);

  // Edit Service Pricing Modal Handler
  const handleEditPricing = (service: AdminServiceItem) => {
    let govtFee = service.governmentFee;
    let profFee = service.professionalFee;
    let isPopular = service.popular || false;
    let isFeatured = service.featured || false;

    const saveChanges = async () => {
      const totalPrice = Number(govtFee) + Number(profFee);
      try {
        await apiFetch("/admin/services", {
          method: "PATCH",
          body: JSON.stringify({
            id: service.id,
            price: totalPrice,
            governmentFee: Number(govtFee),
            professionalFee: Number(profFee),
            popular: isPopular,
            featured: isFeatured,
          }),
        });

        notify.success(`Pricing updated for ${service.title}`);
        fetchServices();
        modal.closeAll();
      } catch (err) {
        console.error("Failed to update pricing:", err);
        notify.error("Failed to update service pricing.");
      }
    };

    modal.open({
      title: `Edit Service Pricing: ${service.title}`,
      description: `Ref Slug: /${service.slug}`,
      size: "md",
      content: (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Government Fee (₹)</label>
              <input
                type="number"
                defaultValue={govtFee}
                onChange={(e) => (govtFee = parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Professional Fee (₹)</label>
              <input
                type="number"
                defaultValue={profFee}
                onChange={(e) => (profFee = parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Calculated Total Package Fee:</span>
            <span className="font-black text-indigo-700 text-sm">₹{Number(govtFee) + Number(profFee)}</span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">Catalog Badges</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={isPopular}
                  onChange={(e) => (isPopular = e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 size-4"
                />
                <span>Popular Tag</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={isFeatured}
                  onChange={(e) => (isFeatured = e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 size-4"
                />
                <span>Featured Homepage Tag</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => modal.closeAll()} className="text-xs font-bold">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={saveChanges} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700">
              Save Pricing
            </Button>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Statutory Services & Pricing Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure government fees, professional margins, catalog tags, and SLAs across all 15 compliance products.
          </p>
        </div>

        <Button variant="primary" size="sm" className="text-xs font-bold flex items-center gap-1.5 shrink-0">
          <Plus size={14} /> Add New Service
        </Button>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Catalog</span>
            <p className="text-2xl font-black text-slate-900">{services.length} Services</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Popular Products</span>
            <p className="text-2xl font-black text-amber-600">{services.filter((s) => s.popular).length}</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Featured Products</span>
            <p className="text-2xl font-black text-indigo-600">{services.filter((s) => s.featured).length}</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Package Price</span>
            <p className="text-2xl font-black text-emerald-600">
              ₹{services.length > 0 ? Math.round(services.reduce((a, b) => a + b.price, 0) / services.length) : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar: Search Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setCategoryFilter("ALL")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === "ALL" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600"
            }`}
          >
            All Products ({services.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("POPULAR")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === "POPULAR" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600"
            }`}
          >
            Popular ({services.filter((s) => s.popular).length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("FEATURED")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === "FEATURED" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600"
            }`}
          >
            Featured ({services.filter((s) => s.featured).length})
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service title or slug..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 text-slate-700"
          />
        </div>
      </div>

      {/* Services Datatable */}
      <Card enableHover>
        <CardContent className="p-0">
          <>
            {/* Desktop Table View (sm+) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Service Product</th>
                    <th className="py-3 px-4">Govt Fee</th>
                    <th className="py-3 px-4">Professional Fee</th>
                    <th className="py-3 px-4">Total Price</th>
                    <th className="py-3 px-4">Filing SLA</th>
                    <th className="py-3 px-4 text-center">Tags</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Loading services catalog...
                      </td>
                    </tr>
                  ) : filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                      <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-slate-900">{service.title}</p>
                            <span className="text-[10px] text-slate-400 font-mono">/{service.slug}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          ₹{service.governmentFee}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          ₹{service.professionalFee}
                        </td>

                        <td className="py-3.5 px-4 font-black text-indigo-700 text-sm">
                          ₹{service.price}
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-600">
                          {service.duration || "5-7 Days"}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {service.popular && <Badge variant="yellow" size="sm">Popular</Badge>}
                            {service.featured && <Badge variant="indigo" size="sm">Featured</Badge>}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/services/${service.slug}`} target="_blank">
                              <button
                                type="button"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                                title="View Public Catalog Page"
                              >
                                <SquareArrowOutUpRight size={15} />
                              </button>
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleEditPricing(service)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                              title="Edit Service Pricing"
                            >
                              <Edit3 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">
                        No services found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List View (< sm) */}
            <div className="sm:hidden divide-y divide-slate-100 p-2">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs">Loading services catalog...</div>
              ) : filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <div key={service.id} className="p-3.5 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{service.title}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">/{service.slug}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {service.popular && <Badge variant="yellow" size="sm">Popular</Badge>}
                        {service.featured && <Badge variant="indigo" size="sm">Featured</Badge>}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-2.5 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Govt Fee</span>
                        <p className="font-semibold text-slate-700">₹{service.governmentFee}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Prof. Fee</span>
                        <p className="font-semibold text-slate-700">₹{service.professionalFee}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total</span>
                        <p className="font-black text-indigo-700">₹{service.price}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/services/${service.slug}`} target="_blank">
                          <button
                            type="button"
                            className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center min-h-[36px] min-w-[36px]"
                            title="View Public Catalog Page"
                          >
                            <SquareArrowOutUpRight size={15} />
                          </button>
                        </Link>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          SLA: {service.duration || "5-7 Days"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleEditPricing(service)}
                        className="p-2 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center font-bold text-xs min-h-[36px] min-w-[36px]"
                        title="Edit Service Pricing"
                      >
                        <Edit3 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">No services found matching query.</div>
              )}
            </div>
          </>
        </CardContent>
      </Card>
    </div>
  );
}
