"use client";

import React, { useState } from "react";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import Button from "@/components/common/Button";
import Image from "next/image";
import { toast } from "sonner";

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
    <>
      <Section
      id="home"
      className="w-full bg-cover bg-center bg-no-repeat bg-primary-light border-b border-primary-border/30 px-4 pb-10 heroSection-bg"
      >
        <Container className="container flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          {/* Left */}
          <div className="flex flex-col items-start" 
          >
            <a
              href="#"
              className="flex items-center gap-2 bg-primary-light border border-primary-border rounded-full p-1 pr-3 text-sm mx-auto md:mx-0 mt-8 sm:mt-12 md:mt-20"
            >
              <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">
                New
              </span>
              <p className="flex items-center gap-2 text-primary">
                <span className="text-sm">Trusted by 1,000+ companies </span>
                <svg
                  className="mt-px"
                  width="6"
                  height="9"
                  viewBox="0 0 6 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m1 1 4 3.5L1 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </p>
            </a>

            <h1 className="text-center lg:text-left text-neutral-900 text-4xl md:text-5xl lg:text-[52px]/16 leading-tight font-semibold max-w-156.5 mt-4">
              Compliance Made Simple{" "}
              <span className="text-primary"> Business Made </span> Strong
            </h1>
            <p className="text-center lg:text-left text-base/7 text-neutral-600 max-w-md mt-4 mx-auto md:mx-0">
             Your trusted partner for regulatory, statutory, ISO, and government compliance solutions - all
              under one platform.
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-center border border-neutral-300 gap-2 max-w-110 w-full rounded-lg sm:rounded-full p-1.5 mt-6 mx-auto md:mx-0"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 pl-4 sm:pl-5 outline-none text-sm bg-transparent text-neutral-600"
                required
                disabled={loading}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full sm:w-auto px-6 h-10 rounded-lg sm:rounded-full text-xs font-bold text-slate-50 cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Subscribing..." : "Subscribe now"}
              </Button>
            </form>
            {/* <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-center lg:text-left text-sm text-neutral-600 mt-4 mx-auto md:mx-0">
              <span className="font-semibold text-xs text-neutral-500 uppercase tracking-wide">Popular:</span>
              <span className="font-normal text-xs px-3 py-1 bg-gray-200/80 rounded-lg">
                GST
              </span>
              <span className="font-normal text-xs px-3 py-1 bg-gray-200/80 rounded-lg">
                FSSI
              </span>
              <span className="font-normal text-xs px-3 py-1 bg-gray-200/80 rounded-lg">
                MSME
              </span>
              <span className="font-normal text-xs px-3 py-1 bg-gray-200/80 rounded-lg">
                IEC
              </span>
            </div> */}

            {/* Avatars + Stars */}
            <div className="flex items-center mt-10 mx-auto lg:mx-0">
              <div className="flex -space-x-3 pr-3">
                <Image

                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
                  alt="user avatar 1"
                  width={36}
                  height={36}
                  className="size-9 object-cover rounded-full border border-slate-50 hover:-translate-y-0.5 transition"
                />
                <Image
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                  alt="user avatar 2"
                  width={36}
                  height={36}
                  className="size-9 object-cover rounded-full border border-slate-50 hover:-translate-y-0.5 transition"
                />
                <Image
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                  alt="user avatar 3"
                  width={36}
                  height={36}
                  className="size-9 object-cover rounded-full border border-slate-50 hover:-translate-y-0.5 transition"
                />
              </div>

              <div>
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-star text-transparent fill-[#FF8F20]"
                        aria-hidden="true"
                      >
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                      </svg>
                    ))}
                </div>
                <p className="text-xs text-neutral-600">
                  Used by 10,000+ users
                </p>
              </div>
            </div>
          </div>

          {/* Right — LCP Element with Priority Preload & Aspect Ratio Placeholder */}
          <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl aspect-square">
            <Image
              className="w-full h-auto object-contain"
              src={"/images/home/hero-section/heroImage.png"}
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 42rem, 48rem"
              alt="FirstLease Dashboard and Compliance Platform Preview"
            />
          </div>
        </Container>
      </Section>
    </>
  );
}

export default HeroSection;
