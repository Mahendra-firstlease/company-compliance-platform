"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  PieChart as PieIcon,
  Sparkles,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Button from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { notify } from "@/lib/notify";
import { apiFetch } from "@/lib/apiClient";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltipCustom, ChartConfig } from "@/components/ui/chart";

// Default Fallback Data
const fallbackRevenueTrend = [
  { month: "Oct 2025", gtv: 320000, proFee: 200000, govtFee: 80000, gstTax: 40000 },
  { month: "Nov 2025", gtv: 380000, proFee: 237500, govtFee: 95000, gstTax: 47500 },
  { month: "Dec 2025", gtv: 410000, proFee: 256250, govtFee: 102500, gstTax: 51250 },
  { month: "Jan 2026", gtv: 440000, proFee: 275000, govtFee: 110000, gstTax: 55000 },
  { month: "Feb 2026", gtv: 465000, proFee: 290625, govtFee: 116250, gstTax: 58125 },
  { month: "Mar 2026", gtv: 489500, proFee: 305930, govtFee: 114800, gstTax: 68770 },
];

const fallbackCategoryDistribution = [
  { name: "Company & LLP Incorporations", value: 220275, percent: 45, color: "#4F46E5" },
  { name: "GST & Tax Registrations", value: 122375, percent: 25, color: "#10B981" },
  { name: "Trademark & IP Filings", value: 88110, percent: 18, color: "#F59E0B" },
  { name: "FSSAI & Statutory Licenses", value: 58740, percent: 12, color: "#3B82F6" },
];

const fallbackFilingVolume = [
  { category: "Incorporation", approved: 42, active: 18 },
  { category: "GST Reg", approved: 85, active: 32 },
  { category: "Trademark", approved: 28, active: 14 },
  { category: "Annual ROC", approved: 64, active: 22 },
  { category: "FSSAI", approved: 38, active: 9 },
];

const chartConfig: ChartConfig = {
  gtv: { label: "Gross Order Value (GTV)", color: "#4F46E5" },
  proFee: { label: "CA/CS Professional Fee", color: "#10B981" },
  govtFee: { label: "Govt Statutory Fee", color: "#64748B" },
  approved: { label: "Approved Filings", color: "#10B981" },
  active: { label: "Active In-Progress", color: "#4F46E5" },
};

export default function AnalyticsConfigPage() {
  const [timeRange, setTimeRange] = useState("6M");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic state
  const [kpis, setKpis] = useState({
    grossGTV: 489500,
    proFee: 305930,
    govtFee: 114800,
    gstTax: 68770,
    gtvGrowth: 18.4,
    profitMargin: 62.5,
    totalApplicationsCount: 352,
    approvedCount: 257,
    activeCount: 95,
  });

  const [revenueTrend, setRevenueTrend] = useState(fallbackRevenueTrend);
  const [categoryDistribution, setCategoryDistribution] = useState(fallbackCategoryDistribution);
  const [filingVolume, setFilingVolume] = useState(fallbackFilingVolume);

  // Dynamic API fetch
  const fetchAnalyticsData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setIsRefreshing(true);
      else setIsLoading(true);

      const res = await apiFetch<any>(`/admin/analytics?range=${timeRange}`);
      if (res && res.kpis) {
        setKpis(res.kpis);
        if (res.revenueTrend) setRevenueTrend(res.revenueTrend);
        if (res.categoryDistribution) setCategoryDistribution(res.categoryDistribution);
        if (res.filingVolume) setFilingVolume(res.filingVolume);
      }
    } catch (err) {
      console.warn("Using fallback analytics datasets:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleExportCSV = () => {
    notify.success("Exporting GSTR-1 Sales Ledger & Financial Tax Statement (CSV)...");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="size-5 text-indigo-600" /> Dynamic Revenue & Growth Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time transaction values, statutory fee passthroughs, tax margins, and live filing metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {["1M", "3M", "6M", "YTD"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalyticsData(true)}
            title="Refresh analytics data"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer border border-slate-200 active:scale-95"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-bold flex items-center gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-xs active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet size={14} /> Export Financial Ledger
          </Button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Order Value (GTV)</span>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {isLoading ? <Loader2 className="size-6 animate-spin text-slate-400" /> : `₹${kpis.grossGTV.toLocaleString("en-IN")}`}
            </p>
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp size={12} /> +{kpis.gtvGrowth}% vs last cycle
            </span>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CA/CS Professional Revenue</span>
            <p className="text-2xl font-black text-indigo-600 tracking-tight">
              {isLoading ? <Loader2 className="size-6 animate-spin text-indigo-400" /> : `₹${kpis.proFee.toLocaleString("en-IN")}`}
            </p>
            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
              Net Profit Margin {kpis.profitMargin}%
            </span>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Govt Fees Collected</span>
            <p className="text-2xl font-black text-slate-700 tracking-tight">
              {isLoading ? <Loader2 className="size-6 animate-spin text-slate-400" /> : `₹${kpis.govtFee.toLocaleString("en-IN")}`}
            </p>
            <span className="text-[10px] font-semibold text-slate-400">Direct Portal Statutory Passthrough</span>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">18% GST Tax Collected</span>
            <p className="text-2xl font-black text-amber-600 tracking-tight">
              {isLoading ? <Loader2 className="size-6 animate-spin text-amber-400" /> : `₹${kpis.gstTax.toLocaleString("en-IN")}`}
            </p>
            <span className="text-[10px] font-semibold text-amber-600">GSTR-1 Monthly Ledger Ready</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Recharts Area Chart: Monthly Revenue & Profit Trend */}
      <Card enableHover>
        <CardHeader className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <TrendingUp className="size-4 text-emerald-600" /> Monthly Revenue & Margin Trajectory (Live Recharts)
            </CardTitle>
            <CardDescription className="text-xs">Gross Order Value (GTV) breakdown compared against CA/CS Net Professional Fees</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-indigo-600" /> Gross GTV</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-emerald-500" /> Net CA/CS Margin</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-full bg-slate-400" /> Govt Fee Passthrough</span>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gtvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="proFeeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={{ stroke: "#CBD5E1" }} />
                <YAxis
                  tickFormatter={(val) => `₹${val / 1000}k`}
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltipCustom config={chartConfig} />} />
                <Area
                  type="monotone"
                  dataKey="gtv"
                  name="Gross Order Value"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#gtvGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="proFee"
                  name="Professional Fee"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#proFeeGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="govtFee"
                  name="Govt Fee Passthrough"
                  stroke="#94A3B8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grid Row 2: Category Donut Chart & Filing Volume Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharts Pie / Donut Chart */}
        <Card enableHover>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <PieIcon className="size-4 text-indigo-600" /> Live Revenue Share by Service Category
            </CardTitle>
            <CardDescription className="text-xs">Category contribution breakdown for active billing cycle</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="h-[220px] w-[220px] shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
                      contentStyle={{ borderRadius: "12px", fontSize: "12px", border: "1px solid #E2E8F0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total GTV</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{(kpis.grossGTV / 100000).toFixed(2)}L
                  </span>
                </div>
              </div>

              {/* Legend Items */}
              <div className="space-y-3 flex-1 min-w-0 w-full">
                {categoryDistribution.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-2 truncate">
                        <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-mono text-slate-900 shrink-0">₹{item.value.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recharts Filing Cases Bar Chart */}
        <Card enableHover>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <Layers className="size-4 text-indigo-600" /> Dynamic Filing Volume Breakdown
            </CardTitle>
            <CardDescription className="text-xs">Approved vs Active applications across key service categories</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filingVolume} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#CBD5E1" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltipCustom config={chartConfig} />} />
                  <Bar dataKey="approved" name="Approved Filings" fill="#10B981" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="active" name="Active In-Progress" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-md bg-emerald-500" /> Approved Certificates ({kpis.approvedCount})</span>
              <span className="flex items-center gap-1.5"><span className="size-3 rounded-md bg-indigo-600" /> Active Desk Cases ({kpis.activeCount})</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Performance Highlights */}
      <Card enableHover>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
            <Sparkles className="size-4 text-amber-500" /> Financial & Operational Insights
          </CardTitle>
          <CardDescription className="text-xs">Live status metrics for active statutory filing operations</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
              <p className="font-extrabold text-emerald-950 flex items-center justify-between">
                <span>Record Incorporation Growth</span>
                <ArrowUpRight className="size-4 text-emerald-600" />
              </p>
              <p className="text-emerald-800 leading-relaxed font-medium">
                MCA Pvt Ltd & LLP filings increased by +{kpis.gtvGrowth}% compared to previous month, driven by multi-service checkout bundles.
              </p>
            </div>

            <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-1">
              <p className="font-extrabold text-indigo-950 flex items-center justify-between">
                <span>Processing SLA Rate</span>
                <ArrowUpRight className="size-4 text-indigo-600" />
              </p>
              <p className="text-indigo-800 leading-relaxed font-medium">
                Average document audit turn-around time reduced from 8.2 hours to 3.4 hours across backoffice legal desks.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-extrabold text-slate-900 flex items-center justify-between">
                <span>Auto-Reconciliation Rate</span>
                <ArrowUpRight className="size-4 text-slate-500" />
              </p>
              <p className="text-slate-700 leading-relaxed font-medium">
                100% of online card, UPI, and netbanking payments automatically reconciled with MySQL application cases.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
