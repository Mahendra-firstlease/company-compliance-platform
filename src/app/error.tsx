"use client";

import React, { useEffect } from "react";
import Button from "@/components/common/Button";
import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime error to monitoring server (Sentry/Datadog)
    console.error("[PRODUCTION RUNTIME ERROR]:", error);
  }, [error]);

  return (
    <Section className="min-h-[70vh] flex items-center justify-center bg-slate-50 py-20">
      <Container className="max-w-xl text-center">
        <div className="bg-white border border-slate-200 rounded-lg p-8 md:p-12 shadow-sm space-y-6">
          <div className="size-16 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="size-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Something Went Wrong
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              An unexpected error occurred while processing your request. Our legal & technical team has been notified.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={reset}
              variant="primary"
              className="w-full sm:w-auto font-bold text-xs py-3 px-6 cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className="size-4" />
              <span>Try Again</span>
            </Button>

            <Link href="/" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto font-bold text-xs py-3 px-6 text-slate-700 border-slate-300 flex items-center justify-center gap-2"
              >
                <Home className="size-4" />
                <span>Return to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
