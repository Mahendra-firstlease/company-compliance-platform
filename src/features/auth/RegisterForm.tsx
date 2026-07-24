"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import InputField from "@/components/forms/fields/InputField";
import PasswordField from "@/components/forms/fields/PasswordField";
import CheckboxField from "@/components/forms/fields/CheckboxField";
import Button from "@/components/common/Button";

import { registerSchema, RegisterFormValues } from "@/schemas/auth.schema";
import { registerUserAction } from "@/lib/actions/auth";
import { notify } from "@/lib/notify";
import { useModal } from "@/components/ui/overlay";

export default function RegisterForm() {
  const modal = useModal();
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false as any,
    },
  });

  const handleGoogleLogin = async () => {
    try {
      notify.loading({
        title: "Connecting to Google...",
        description: "Redirecting to Google authentication.",
      });
      await signIn("google", { callbackUrl: "/business-profile" });
    } catch (err) {
      console.error(err);
      notify.error({
        title: "Google Auth Failed",
        description: "Could not connect to Google.",
      });
    }
  };

  async function onSubmit(data: RegisterFormValues) {
    try {
      // 1. Call Server Action to register user in DB
      const result = await registerUserAction(data);

      if (!result.success) {
        notify.error({
          title: "Registration Failed",
          description: result.error || "Could not complete registration.",
        });
        return;
      }

      notify.success({
        title: "Account Created Successfully!",
        description: "Please complete your 2-step business profile.",
      });

      // 2. Auto sign in with credentials and redirect to /business-profile
      const signInRes = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
        return;
      }

      form.reset();
      modal.closeAll();
      router.push("/business-profile");
      router.refresh();
    } catch (err: any) {
      console.error("Register error:", err);
      notify.error({
        title: "Registration Error",
        description: "An unexpected error occurred.",
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <InputField
          control={form.control}
          name="firstName"
          label="First Name"
          placeholder="John"
        />

        <InputField
          control={form.control}
          name="lastName"
          label="Last Name"
          placeholder="Doe"
        />
      </div>

      <InputField
        control={form.control}
        name="email"
        label="Email Address"
        placeholder="john@example.com"
      />

      <InputField
        control={form.control}
        name="phone"
        label="Phone Number"
        placeholder="+91 9876543210"
      />

      <PasswordField
        control={form.control}
        name="password"
        label="Password"
        placeholder="Create password"
      />

      <PasswordField
        control={form.control}
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm password"
      />

      <CheckboxField
        control={form.control}
        name="acceptTerms"
        label="I agree to the Terms & Conditions"
      />

      <Button type="submit" fullWidth disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating Account..." : "Create Account"}
      </Button>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase font-medium">
          Or continue with
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <Button
        type="button"
        onClick={() => handleGoogleLogin()}
        variant="outline"
        fullWidth
        className="flex items-center justify-center gap-2 border-gray-200 hover:bg-slate-50"
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
        Sign Up with Google
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-orange-600 hover:underline"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
