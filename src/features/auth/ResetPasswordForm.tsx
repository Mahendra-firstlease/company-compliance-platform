"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, ArrowRight, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";

import PasswordField from "@/components/forms/fields/PasswordField";
import Button from "@/components/common/Button";
import { notify } from "@/lib/notify";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setErrorMessage("Password reset token is missing from URL.");
      notify.error({
        title: "Missing Token",
        description: "Invalid or missing password reset URL.",
      });
      return;
    }

    setErrorMessage("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error || "Password reset failed.");
        notify.error({
          title: "Reset Failed",
          description: json.error || "Failed to update password.",
        });
        return;
      }

      setIsSuccess(true);
      notify.success({
        title: "Password Updated!",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      notify.error({
        title: "Connection Error",
        description: "Failed to connect to authentication server.",
      });
    }
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="size-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
          <AlertCircle className="size-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Invalid Password Reset Link
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            This password reset link is incomplete or missing a valid security token.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/forgot-password">
            <Button variant="primary" fullWidth className="rounded-xl font-bold text-xs">
              Request New Reset Link →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="size-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Password Reset Complete!
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            Your corporate account password has been updated successfully. You can now log in with your new credentials.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push("/login")}
            className="rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            Log In Now →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="size-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create a strong new password for your account.
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PasswordField
          control={form.control}
          name="password"
          label="New Password"
          placeholder="Enter new password (min. 6 chars)"
        />

        <PasswordField
          control={form.control}
          name="confirmPassword"
          label="Confirm New Password"
          placeholder="Re-enter new password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
          className="h-11 rounded-xl font-bold text-xs shadow-md shadow-indigo-500/10 cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2 justify-center">
              <Loader2 className="size-4 animate-spin" />
              <span>Updating Password...</span>
            </span>
          ) : (
            <span>Update Password & Log In →</span>
          )}
        </Button>
      </form>
    </div>
  );
}
