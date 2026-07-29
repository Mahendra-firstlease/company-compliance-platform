import React from "react";
import ProductGrid from "./ProductGrid";
import FilterControls from "./FilterControls";
import SearchBox from "./SearchBox";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import { Service } from "@/types/services";
import { FileX, Sparkles, RefreshCw } from "lucide-react";
import Button from "@/components/common/Button";
import Link from "next/link";

interface ServicesPageProps {
  services: Service[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
  search?: string;
}

export default function ServicesPage({
  services,
  totalResults,
  currentPage,
  totalPages,
  search = "",
}: ServicesPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb path navigation */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Services" }]}
        />
      </div>

      {/* Header section with SearchBox */}
      <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Compliance Services
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            {totalResults} compliance services available
          </p>
        </div>

        <SearchBox defaultValue={search} />
      </div>

      {/* Grid & Sidebar Layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <FilterControls />

        <div className="lg:col-span-3 space-y-6 min-h-[640px]">
          {services.length > 0 ? (
            <>
              <ProductGrid services={services} />
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200/80 rounded-lg p-8 space-y-4 shadow-2xs">
              <div className="size-16 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <FileX className="size-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  No Services Available at the Moment
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {search
                    ? `No compliance services matched your search parameter "${search}". Try clearing search filters.`
                    : "Our statutory compliance catalog is currently empty or being updated by administrators. Please check back shortly."}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Link href="/services">
                  <Button variant="outline" size="sm" className="font-bold text-xs">
                    Clear Search Filters
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
