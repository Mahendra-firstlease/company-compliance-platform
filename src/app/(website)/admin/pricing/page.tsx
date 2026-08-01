"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Tag,
  TrendingUp,
  ShieldCheck,
  Percent,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import Button from "@/components/common/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Badge from "@/components/ui/Badge/Badge";
import { notify } from "@/lib/notify";
import { useModal } from "@/components/ui/overlay";
import Select from "@/components/forms/Select";

interface CouponItem {
  code: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number;
  minOrderValue: number;
  status: "ACTIVE" | "EXPIRED";
  usageCount: number;
}

export default function PricingConfigPage() {
  const modal = useModal();
  const [coupons, setCoupons] = useState<CouponItem[]>([
    { code: "STARTUP1000", discountType: "FLAT", discountValue: 1000, minOrderValue: 2999, status: "ACTIVE", usageCount: 42 },
    { code: "COMPLIANCE20", discountType: "PERCENTAGE", discountValue: 20, minOrderValue: 4999, status: "ACTIVE", usageCount: 89 },
    { code: "FIRSTLEASE500", discountType: "FLAT", discountValue: 500, minOrderValue: 1499, status: "ACTIVE", usageCount: 124 },
    { code: "FESTIVE15", discountType: "PERCENTAGE", discountValue: 15, minOrderValue: 1999, status: "EXPIRED", usageCount: 210 },
  ]);

  const handleAddCouponModal = () => {
    let newCode = "";
    let type: "FLAT" | "PERCENTAGE" = "FLAT";
    let val = 500;
    let minOrder = 1999;

    const createCoupon = () => {
      if (!newCode.trim()) {
        notify.error("Please enter a valid coupon code.");
        return;
      }

      setCoupons((prev) => [
        { code: newCode.toUpperCase(), discountType: type, discountValue: val, minOrderValue: minOrder, status: "ACTIVE", usageCount: 0 },
        ...prev,
      ]);

      notify.success(`Created promo coupon: ${newCode.toUpperCase()}`);
      modal.closeAll();
    };

    modal.open({
      title: "Create New Promotional Coupon",
      description: "Setup discount codes for statutory filing checkouts",
      size: "md",
      content: (
        <div className="space-y-4 pt-2 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Coupon Code</label>
            <input
              type="text"
              placeholder="e.g. DIWALI500"
              onChange={(e) => (newCode = e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 uppercase font-bold text-slate-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Discount Type</label>
              <Select
                onChange={(val) => (type = val as any)}
                defaultValue="FLAT"
                options={[
                  { label: "Flat INR (₹)", value: "FLAT" },
                  { label: "Percentage (%)", value: "PERCENTAGE" },
                ]}
              />
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">Discount Value</label>
              <input
                type="number"
                defaultValue={val}
                onChange={(e) => (val = parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Minimum Order Value (₹)</label>
            <input
              type="number"
              defaultValue={minOrder}
              onChange={(e) => (minOrder = parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-slate-900 outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => modal.closeAll()} className="text-xs font-bold">
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={createCoupon} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700">
              Publish Coupon
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Pricing, Margins & Promo Coupon Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Setup statutory government fee structures, professional margins, GST calculations, and checkout promotional codes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleAddCouponModal}
          className="text-xs font-bold flex items-center gap-1.5 shrink-0 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus size={14} /> Create Promo Code
        </Button>
      </div>

      {/* Pricing Overview KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Standard GST Rate</span>
            <p className="text-2xl font-black text-slate-900">18.0% GST</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Promo Coupons</span>
            <p className="text-2xl font-black text-indigo-600">{coupons.filter((c) => c.status === "ACTIVE").length}</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Professional Margin</span>
            <p className="text-2xl font-black text-emerald-600">62.5%</p>
          </CardContent>
        </Card>

        <Card enableHover>
          <CardContent className="p-4 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Coupon Redemptions</span>
            <p className="text-2xl font-black text-amber-600">
              {coupons.reduce((a, b) => a + b.usageCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Promo Coupons Table */}
      <Card enableHover>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Promotional Discount Coupons</CardTitle>
            <CardDescription className="text-xs">Active codes available for checkout discounts</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Type</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Min Order Value</th>
                  <th className="py-3 px-4">Usage Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {coupons.map((coupon) => (
                  <tr key={coupon.code} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {coupon.code}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {coupon.discountType}
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {coupon.discountType === "FLAT" ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      ₹{coupon.minOrderValue}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {coupon.usageCount} uses
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={coupon.status === "ACTIVE" ? "green" : "gray"} rounded="full" size="sm">
                        {coupon.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setCoupons((prev) =>
                            prev.map((c) =>
                              c.code === coupon.code
                                ? { ...c, status: c.status === "ACTIVE" ? "EXPIRED" : "ACTIVE" }
                                : c
                            )
                          );
                          notify.success(`Toggled status for ${coupon.code}`);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
