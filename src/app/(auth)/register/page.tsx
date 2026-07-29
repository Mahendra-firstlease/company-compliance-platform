import RegisterForm from "@/features/auth/RegisterForm";
import CompanyLogo from "@/components/common/CompanyLogo";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, Sparkles, Building2 } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-12 bg-slate-50/60 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Column: Register Form Container (6 Cols on LG for wide form) */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white relative z-10 border-r border-slate-200/80 shadow-2xl shadow-slate-200/50">
        
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
        <div className="my-auto py-8 max-w-md w-full mx-auto space-y-6">
          <RegisterForm />
        </div>

        {/* Footer Security Badges */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Lock className="size-3.5" />
            <span>256-Bit Encrypted Data</span>
          </div>
          <span>Official MCA & GST Partner</span>
        </div>
      </div>

      {/* Right Column: Premium Corporate Feature Showcase Panel - LIGHT THEME (6 Cols on LG) */}
      <div className="lg:col-span-6 relative hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-indigo-50/80 via-slate-50 to-purple-50/60 text-slate-900 border-l border-slate-200/80 overflow-hidden">
        {/* Decorative Light Background Blobs */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-purple-200/40 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e120_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e120_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

        {/* Top Feature Pill */}
        <div className="relative z-10 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 border border-indigo-200/80 text-indigo-800 text-xs font-bold shadow-2xs backdrop-blur-md">
            <Sparkles className="size-4 text-indigo-600" />
            <span>Get Started in 2 Simple Steps</span>
          </span>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 space-y-8 max-w-xl my-auto">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900">
              Join 10,000+ Verified Businesses On FirstLease
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Create your free compliance account to access dynamic statutory filing engines, automated document vaults, and dedicated CA/CS executive support.
            </p>
          </div>

          {/* Registration Perks Grid */}
          <div className="space-y-3 pt-2">
            {[
              { title: "256-Bit Encrypted Vault", desc: "Store all government licenses & tax certificates securely." },
              { title: "Live Real-Time Status Tracking", desc: "5-stage progress tracking from verification to government issuance." },
              { title: "Dedicated Backoffice CA/CS Specialist", desc: "Expert executive assigned to every case filing." },
            ].map((perk, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-white/90 border border-slate-200/80 shadow-2xs backdrop-blur-md flex items-start gap-3 hover:border-indigo-200 hover:shadow-xs transition-all"
              >
                <div className="size-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{perk.title}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Stepper Visual Box */}
          <div className="p-5 rounded-lg bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Setup Timeline</span>
              <span className="text-indigo-600">Step 1 of 2</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="w-1/2 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500 font-semibold pt-1">
              Account Registration $\rightarrow$ Business Profile Tailoring $\rightarrow$ Immediate Portal Access
            </p>
          </div>
        </div>

        {/* Bottom Partner Trust Strip */}
        <div className="relative z-10 pt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 font-bold">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-indigo-600" />
            <span>Ministry of Corporate Affairs Compliant</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span>SSL Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
