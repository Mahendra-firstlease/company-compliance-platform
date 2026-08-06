"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, LogIn, Loader2 } from "lucide-react";

import InputField from "@/components/forms/fields/InputField";
import PasswordField from "@/components/forms/fields/PasswordField";
import Button from "@/components/common/Button";

import { loginSchema, LoginFormValues } from "@/schemas/auth.schema";
import { notify } from "@/lib/notify";
import { useModal } from "@/components/ui/overlay";
import { getPostLoginPath } from "@/lib/auth-redirect";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const modal = useModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleGoogleLogin = async () => {
    try {
      notify.loading({
        title: "Connecting to Google...",
        description: "Redirecting to Google authentication.",
      });
      await signIn("google", {
        callbackUrl: getPostLoginPath(null, callbackUrl || "/dashboard"),
      });
    } catch (err) {
      console.error(err);
      notify.error({
        title: "Google Auth Failed",
        description: "Could not connect to Google.",
      });
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        notify.error({
          title: "Sign In Failed",
          description: res.error || "Please check your email and password.",
        });
        return;
      }

      notify.success({
        title: "Welcome Back! 👋",
        description: "Successfully signed in to FirstLease.",
      });

      modal.closeAll();
      if (onSuccess) onSuccess();

      const session = await getSession();
      const role = (session?.user as { role?: string } | undefined)?.role;
      router.push(getPostLoginPath(role, callbackUrl));
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      notify.error({
        title: "Sign In Failed",
        description: "An unexpected error occurred during login.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase tracking-wider border border-indigo-100">
          <ShieldCheck className="size-3 text-indigo-600" />
          <span>Statutory Portal Sign In</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Login
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Enter your credentials to access your company compliance dashboard.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          control={form.control}
          name="email"
          label="Email Address"
          placeholder="name@company.com"
        />

        <div className="space-y-1">
          <PasswordField
            control={form.control}
            name="password"
            label="Password"
            placeholder="••••••••••••"
          />
          <div className="flex justify-end pt-1">
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full font-bold text-xs py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <LogIn className="size-4" />
              <span>Login to Account</span>
            </>
          )}
        </Button>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            Or continue with
          </span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        <Button
          type="button"
          onClick={() => handleGoogleLogin()}
          variant="outline"
          fullWidth
          className="flex items-center justify-center gap-2.5 border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-lg shadow-2xs cursor-pointer transition-all"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>Login with Google</span>
        </Button>

        {/* Footer cross-link */}
        <p className="text-center text-xs text-slate-500 pt-2 font-medium">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            onClick={() => {
              if (onSwitchToRegister) onSwitchToRegister();
            }}
            className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Sign Up for Free
          </Link>
        </p>
      </form>
    </div>
  );
}
