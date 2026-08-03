"use client";

import React from "react";
import dynamic from "next/dynamic";
import Button from "@/components/common/Button";
import { useModal } from "@/components/ui/overlay";
import { notify } from "@/lib/notify";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Service } from "@/types/services";

import { ShieldAlert, ExternalLink } from "lucide-react";
import Link from "next/link";

// Lazy load checkout modal only when triggered (improves First Load JS & INP)
const MultiServiceCheckoutModal = dynamic(
  () => import("./MultiServiceCheckoutModal"),
  { ssr: false }
);

export default function ApplyNowButton({ service }: { service: Service }) {
  const modal = useModal();
  const router = useRouter();
  const { data: session, status } = useSession();

  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN";

  const handleApplyClick = () => {
    // 1. Check if user is logged in
    if (status !== "authenticated" || !session) {
      notify.info({
        title: "Authentication Required",
        description: "Please login to initiate your compliance application.",
      });
      router.push(`/login?callbackUrl=${encodeURIComponent(`/services/${service.slug}`)}`);
      return;
    }

    // 2. Prevent Admin users from purchasing services
    if (isAdmin) {
      notify.warning({
        title: "Admin Account Restriction",
        description: "Admin accounts cannot purchase client service packages. Please log in with a customer account or manage filings in the Admin Console.",
      });
      return;
    }

    // 3. Open unified checkout modal with single service array
    modal.open({
      title: `Checkout - ${service.title}`,
      description: `Complete statutory application and Razorpay payment.`,
      size: "md",
      content: (
        <MultiServiceCheckoutModal
          selectedServices={[service]}
          onCancel={() => modal.closeAll()}
          onSuccess={() => modal.closeAll()}
        />
      ),
    });
  };

  if (isAdmin) {
    return (
      <div className="space-y-2">
        <Button
          onClick={handleApplyClick}
          fullWidth
          size="lg"
          variant="outline"
          className="font-bold text-xs py-3 text-amber-800 bg-amber-50/90 border-amber-300 hover:bg-amber-100 cursor-pointer flex items-center justify-center gap-2"
        >
          <ShieldAlert className="size-4 text-amber-600 shrink-0" />
          Admin Access - Cannot Purchase Services
        </Button>
        <div className="text-center">
          <Link
            href="/admin/applications"
            className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            Manage Filings in Admin Console <ExternalLink size={11} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={handleApplyClick}
      fullWidth
      size="lg"
      variant="primary"
      className="font-semibold text-sm py-3 cursor-pointer"
    >
      Apply Now
    </Button>
  );
}
