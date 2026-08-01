import LoginForm from "@/features/auth/LoginForm";
import CompanyLogo from "@/components/common/CompanyLogo";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, Award, Building2 } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-12 bg-slate-50/60 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Column: Login Form Container (5 Cols on LG) */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white relative z-10 border-r border-slate-200/80 shadow-2xl shadow-slate-200/50">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <CompanyLogo priority />
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Center Auth Form Card */}
        <div className="my-auto py-8 max-w-sm w-full mx-auto space-y-6">
          <LoginForm />
        </div>

        {/* Footer Security Badges */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Lock className="size-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>Official MCA & GST Portal</span>
        </div>
      </div>

      {/* Right Column: Premium Corporate Feature Showcase Panel - LIGHT THEME (7 Cols on LG) */}
      <div className="lg:col-span-7 relative hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-indigo-50/80 via-slate-50 to-blue-50/60 text-slate-900 border-l border-slate-200/80 overflow-hidden">
        {/* Decorative Light Background Blobs */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Top Feature Pill */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 border border-indigo-200/80 text-indigo-800 text-xs font-bold shadow-2xs backdrop-blur-md">
            <Award className="size-4 text-indigo-600" />
            <span>India&apos;s #1 Statutory Compliance Platform</span>
          </span>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 space-y-8 max-w-xl my-auto">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900">
              Fast-Track Statutory Filings for Growing Businesses
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Automate company incorporation, GST registrations, trademark applications, and annual compliance with dedicated CA & CS executive management.
            </p>
          </div>

          {/* Key Value Prop List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { title: "10,000+ Filings", desc: "Verified Corporate Cases" },
              { title: "99.8% Accuracy", desc: "Zero Ministry Rejections" },
              { title: "Instant Vault", desc: "Cloud Document Storage" },
              { title: "Dedicated CA/CS", desc: "Assigned Executive Officer" },
            ].map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-md space-y-1 hover:border-indigo-200 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-1.5 text-indigo-700 font-black text-base">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Floating Customer Proof Quote */}
          <div className="p-5 rounded-lg bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md space-y-3">
            <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
              &quot;FirstLease handled our Private Limited Incorporation and GST registration seamlessly in just 4 days. The real-time status tracker was exceptional.&quot;
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <div className="size-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                AK
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Ananya Kapoor</h4>
                <p className="text-[10px] text-slate-500 font-medium">Founder & CEO, TechMatrix Pvt Ltd</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Partner Trust Strip */}
        <div className="relative z-10 pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-bold">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-indigo-600" />
            <span>Ministry of Corporate Affairs & GST Compliant</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>Encrypted Vault Storage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
