"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Loader2, CheckCircle2, KeyRound } from "lucide-react";

import InputField from "@/components/forms/fields/InputField";
import Button from "@/components/common/Button";
import { notify } from "@/lib/notify";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setSubmittedEmail(data.email);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      const json = await res.json();

      if (!res.ok) {
        notify.error({
          title: "Request Failed",
          description: json.error || "Could not process password reset request.",
        });
        return;
      }

      setIsSubmitted(true);
      notify.success({
        title: "Reset Link Sent",
        description: "Check your email inbox for instructions.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      notify.error({
        title: "Connection Error",
        description: "Failed to connect to authentication server.",
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="size-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Check Your Email
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            We have sent a password reset link to{" "}
            <strong className="font-mono text-indigo-600">{submittedEmail}</strong>. Please check your inbox and follow the instructions.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-left space-y-1.5 text-xs text-slate-600">
          <p className="font-bold text-slate-800">Didn't receive the email?</p>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
            <li>Check your spam or junk folder.</li>
            <li>Make sure you entered the correct email address.</li>
            <li>The reset link will expire in 60 minutes.</li>
          </ul>
        </div>

        <div className="pt-2 space-y-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setIsSubmitted(false)}
            className="rounded-lg font-bold text-xs"
          >
            Try Another Email
          </Button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Enter your corporate email to receive a password reset link.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          control={form.control}
          name="email"
          label="Registered Business Email"
          placeholder="name@company.com"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
          className="h-11 rounded-lg font-bold text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="size-4 animate-spin" />
              <span>Sending Reset Link...</span>
            </span>
          ) : (
            <span>Send Password Reset Link →</span>
          )}
        </Button>
      </form>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </div>
  );
}
