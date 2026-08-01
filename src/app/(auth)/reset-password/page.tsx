import { Suspense } from "react";
import ResetPasswordForm from "@/features/auth/ResetPasswordForm";
import CompanyLogo from "@/components/common/CompanyLogo";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2, Award, Lock, Loader2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | FirstLease Statutory Compliance",
  description: "Set a new password for your FirstLease corporate compliance account.",
};

export default function ResetPasswordPage() {
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

        {/* Center Auth Form Card with Suspense */}
        <div className="my-auto py-8 max-w-sm w-full mx-auto">
          <Suspense
            fallback={
              <div className="text-center py-12 space-y-3">
                <Loader2 className="size-8 animate-spin text-indigo-600 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Verifying reset token...</p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
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
            <span>Security & Access Control Desk</span>
          </span>
        </div>

        <div className="relative z-10 space-y-8 max-w-xl my-auto">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900">
              Set Your New Account Credentials
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">
              Update your corporate password to restore access to your statutory applications, document vault, and executive compliance dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              { title: "Bcrypt Hashed", desc: "Industry Standard Password Security" },
              { title: "Vault Isolation", desc: "Enterprise Data Access Security" },
              { title: "Instant Access", desc: "Immediate Login Activation" },
              { title: "Zero Lockouts", desc: "24/7 Self-Service Reset" },
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
