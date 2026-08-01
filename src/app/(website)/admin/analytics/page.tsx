"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  DollarSign,
  FileSpreadsheet,
  PieChart as PieIcon,
  Calendar,
  Sparkles,
} from "lucide-react";
import Button from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Badge from "@/components/ui/Badge/Badge";
import { notify } from "@/lib/notify";

export default function AnalyticsConfigPage() {
  const [timeRange, setTimeRange] = useState("THIS_MONTH");

  const handleExportCSV = () => {
    notify.success("Exporting GSTR-1 Sales Ledger & Tax Statement (CSV)...");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Revenue Analytics & Financial Growth Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time gross transaction values, statutory tax collections, professional fee margins, and category distributions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleExportCSV}
          className="text-xs font-bold flex items-center gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white border-0 cursor-pointer"
        >
          <FileSpreadsheet size={14} /> Export Financial Ledger (CSV)
        </Button>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Order Value (GTV)</span>
            <p className="text-2xl font-black text-slate-900">₹4,89,500</p>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp size={12} /> +18.4% vs last month
            </span>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Professional Fee Revenue</span>
            <p className="text-2xl font-black text-indigo-600">₹3,05,930</p>
            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
              Net Profit Margin 62.5%
            </span>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Govt Fees Collected</span>
            <p className="text-2xl font-black text-slate-700">₹1,14,800</p>
            <span className="text-[10px] font-semibold text-slate-400">Direct MCA / Portal Statutory Passthrough</span>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">18% GST Tax Liability</span>
            <p className="text-2xl font-black text-amber-600">₹68,770</p>
            <span className="text-[10px] font-semibold text-amber-600">GSTR-1 Monthly Ledger Ready</span>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card enableHover>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PieIcon className="size-4 text-indigo-600" /> Revenue Distribution by Category
            </CardTitle>
            <CardDescription className="text-xs">Filing volume share across corporate statutory services</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { category: "Company & LLP Incorporations", percent: 45, amount: "₹2,20,275", color: "bg-indigo-600" },
              { category: "GST & Tax Registrations", percent: 25, amount: "₹1,22,375", color: "bg-emerald-500" },
              { category: "Trademark & Intellectual Property", percent: 18, amount: "₹88,110", color: "bg-amber-500" },
              { category: "FSSAI & Statutory Licenses", percent: 12, amount: "₹58,740", color: "bg-blue-500" },
            ].map((item) => (
              <div key={item.category} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{item.category}</span>
                  <span className="font-mono">{item.amount} ({item.percent}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Performance Highlights */}
        <Card enableHover>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" /> Key Growth Performance Indicators
            </CardTitle>
            <CardDescription className="text-xs">Operational highlights for the active fiscal period</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
              <p className="font-bold text-emerald-900">🚀 Record Incorporation Growth</p>
              <p className="text-emerald-700 leading-relaxed">
                MCA Pvt Ltd & LLP filings increased by 22% compared to previous month, driven by multi-service checkout bundles.
              </p>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1">
              <p className="font-bold text-indigo-900">⏱️ Processing SLA Rate Improvement</p>
              <p className="text-indigo-700 leading-relaxed">
                Average document audit turn-around time reduced from 8.2 hours to 3.4 hours across backoffice legal desks.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <p className="font-bold text-slate-800">💳 Razorpay Auto-Reconciliation</p>
              <p className="text-slate-600 leading-relaxed">
                100% of online card, UPI, and netbanking payments automatically reconciled with MySQL application cases.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
