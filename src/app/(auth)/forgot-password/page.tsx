import ForgotPasswordForm from "@/features/auth/ForgotPasswordForm";
import CompanyLogo from "@/components/common/CompanyLogo";
import Link from "next/link";
import { ArrowLeft, KeyRound, CheckCircle2, Award, Lock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | FirstLease Statutory Compliance",
  description: "Reset your FirstLease corporate compliance account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-12 bg-slate-50/60 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Column: Form Container */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white relative z-10 border-r border-slate-200/80 shadow-2xl shadow-slate-200/50">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <CompanyLogo priority />
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="size-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Center Auth Form Card */}
        <div className="my-auto py-8 max-w-sm w-full mx-auto">
          <ForgotPasswordForm />
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

      {/* Right Column: Corporate Feature Showcase Panel */}
      <div className="lg:col-span-7 relative hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-indigo-50/80 via-slate-50 to-blue-50/60 text-slate-900 border-l border-slate-200/80 overflow-hidden">
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 border border-indigo-200/80 text-indigo-800 text-xs font-bold shadow-2xs backdrop-blur-md">
            <Award className="size-4 text-indigo-600" />
            <span>Secure Password Recovery Desk</span>
          </span>
        </div>

        <div className="relative z-10 space-y-8 max-w-xl my-auto">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900">
              Recover Access to Your Compliance Vault
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Self-service password recovery with single-use encrypted verification tokens sent directly to your authorized corporate inbox.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { title: "Encrypted Links", desc: "Single-Use Security Tokens" },
              { title: "60-Min Expiry", desc: "Automated Token Expiration" },
              { title: "Vault Protection", desc: "Statutory Files Remain Encrypted" },
              { title: "24/7 Desk", desc: "Support Verification Assistance" },
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
        </div>

        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-slate-200/80 text-xs text-slate-500 font-semibold">
          <span>FirstLease Statutory Security Protocols</span>
          <span>Help: support@firstlease.in</span>
        </div>
      </div>
    </div>
  );
}
