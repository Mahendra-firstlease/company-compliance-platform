"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Service } from "@/types/services";
import OverviewTab from "./OverviewTab";
import BenefitsTab from "./BenefitsTab";
import DocumentsTab from "./DocumentsTab";
import FaqsTab from "./FaqsTab";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "benefits", label: "Benefits" },
  { id: "documents", label: "Documents & Eligibility" },
  { id: "faqs", label: "FAQs" },
] as const;

export default function ServiceDetailTabs({ service }: { service: Service }) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "benefits" | "documents" | "faqs"
  >("overview");

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 shadow-xs">
      {/* Clean Simple Underline Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap py-3 px-1 border-b-2 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "overview" && <OverviewTab service={service} />}
        {activeTab === "benefits" && <BenefitsTab service={service} />}
        {activeTab === "documents" && <DocumentsTab service={service} />}
        {activeTab === "faqs" && <FaqsTab service={service} />}
      </div>
    </div>
  );
}
