"use client";

import React from "react";
import dynamic from "next/dynamic";
import Button from "@/components/common/Button";
import { useModal } from "@/components/ui/overlay";
import { notify } from "@/lib/notify";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Service } from "@/types/services";

// Lazy load checkout modal only when triggered (improves First Load JS & INP)
const MultiServiceCheckoutModal = dynamic(
  () => import("./MultiServiceCheckoutModal"),
  { ssr: false }
);

export default function ApplyNowButton({ service }: { service: Service }) {
  const modal = useModal();
  const router = useRouter();
  const { data: session, status } = useSession();

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

    // 2. Open unified checkout modal with single service array
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
