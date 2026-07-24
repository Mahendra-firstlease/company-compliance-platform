import React from "react";
import ProductGrid from "./ProductGrid";
import FilterControls from "./FilterControls";
import SearchBox from "./SearchBox";
import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import { Service } from "@/types/services";

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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
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

        <div className="lg:col-span-3 space-y-6">
          {services.length > 0 ? (
            <>
              <ProductGrid services={services} />
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800">
                No Services Found
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                Try adjusting your search query or option filters to see results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
