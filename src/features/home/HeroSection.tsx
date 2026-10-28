"use client";

import React, { useState } from "react";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import Button from "@/components/common/Button";
import Image from "next/image";
import { toast } from "sonner";
import { Star } from "lucide-react";

type Props = {
  children?: React.ReactNode;
};

function HeroSection({}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Something went wrong.");
      } else {
        toast.success(data.message ?? "Successfully subscribed!");
        setEmail("");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section
      id="home"
      className="relative w-full bg-primary-light text-slate-900 border-b border-primary-border/20 overflow-hidden px-4 pt-8 pb-12 sm:pb-16"
    >
      {/* Decorative Light Background Elements */}
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <Container className="container relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
        {/* Left Column */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl">
          {/* Main Hero Heading with High Contrast — no eyebrow kicker */}
          <h1 className="text-slate-900 text-3xl sm:text-4xl md:text-5xl lg:text-[50px] leading-[1.15] font-extrabold tracking-tight">
            Compliance Made Simple,{" "}
            <span className="text-primary">Business Made</span> Strong
          </h1>

          {/* Supporting Copy - optimal line length */}
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
            Your single unified partner for corporate registration, GST, statutory filings,
            ISO licensing, and government portal compliance.
          </p>

          {/* Clean Flat Subscription Form (No nested card-in-card) */}
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-md w-full mt-6"
          >
            <input
              type="email"
              placeholder="Enter your business email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-2xs"
              required
              disabled={loading}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="h-11 px-6 rounded-lg text-xs font-bold text-white shrink-0 cursor-pointer shadow-2xs disabled:opacity-60"
            >
              {loading ? "Subscribing..." : "Subscribe Now"}
            </Button>
          </form>

          {/* Social Proof: Avatars + Stars */}
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-primary-border/25 w-full justify-center md:justify-start">
            <div className="flex -space-x-2.5">
              <Image
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
                alt="Client avatar"
                width={36}
                height={36}
                className="size-9 object-cover rounded-full ring-2 ring-white"
              />
              <Image
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                alt="Client avatar"
                width={36}
                height={36}
                className="size-9 object-cover rounded-full ring-2 ring-white"
              />
              <Image
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                alt="Client avatar"
                width={36}
                height={36}
                className="size-9 object-cover rounded-full ring-2 ring-white"
              />
            </div>

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1 text-amber-500">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Rated 4.9/5 by 10,000+ businesses across India
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — Hero Visual */}
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl aspect-square relative flex items-center justify-center">
          <Image
            className="w-full h-auto object-contain drop-shadow-sm"
            src={"/images/home/hero-section/heroImage.png"}
            priority={true}
            width={800}
            height={800}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 36rem"
            alt="Compliance Platform Preview"
          />
        </div>
      </Container>
    </Section>
  );
}

export default HeroSection;
