"use client";

import React from "react";
import Container from "@/components/common/Container";
import Section from "@/components/common/Section";
import Button from "@/components/common/Button";
import SectionHeading from "@/components/common/Heading";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Users,
  Zap,
  Building2,
  Lock,
  ArrowRight,
  FileCheck2,
  Scale,
  Sparkles,
  CheckCircle2,
  MousePointerClick,
  Target,
  Compass,
  Eye,
  XCircle,
  History,
  Briefcase,
  HeartHandshake,
} from "lucide-react";

export default function AboutClient() {
  const companyMilestones = [
    {
      label: "Established",
      value: "2021",
      desc: "Founded by CA & CS Practice Leaders",
    },
    {
      label: "Enterprises Served",
      value: "12,500+",
      desc: "Across 28+ Indian States & UTs",
    },
    {
      label: "Approved Filings",
      value: "48,000+",
      desc: "GST, MCA, MSME & Trademarks",
    },
    {
      label: "In-House Experts",
      value: "85+",
      desc: "Dedicated CA/CS Filing Officers",
    },
  ];

  const coreValues = [
    {
      title: "Absolute Fee Transparency",
      desc: "We split government fees and professional charges upfront. No hidden surcharges, unexpected bills, or vague invoices.",
      icon: Scale,
    },
    {
      title: "Zero Bureaucratic Delays",
      desc: "Our automated verification engine checks file signatures and document formats in seconds to eliminate ministry rejections.",
      icon: Zap,
    },
    {
      title: "Bank-Grade Security",
      desc: "Your statutory licenses, identity documents, and filings are protected in 256-bit encrypted cloud storage vaults.",
      icon: ShieldCheck,
    },
  ];

  const comparisons = [
    {
      feature: "Filing Process",
      traditional: "Multiple physical office visits & paper prints",
      firstLease: "100% Online Digital Workspace in 3 Clicks",
    },
    {
      feature: "Fee Transparency",
      traditional: "Hidden consultant surcharges & vague invoices",
      firstLease: "Exact Govt Fee + Professional Fee split upfront",
    },
    {
      feature: "Document Verification",
      traditional: "Manual inspection leads to government rejections",
      firstLease: "Automated Magic-Byte signature & pattern validation",
    },
    {
      feature: "Filing Visibility",
      traditional: "No updates; client must repeatedly call consultants",
      firstLease: "Real-time 4-step live progress tracking dashboard",
    },
    {
      feature: "Document Vault",
      traditional: "Risk of lost physical certificates & paper files",
      firstLease: "256-bit encrypted permanent cloud vault access",
    },
  ];

  const howItMakesWorkEasy = [
    {
      title: "1. Zero Bureaucracy or Office Visits",
      desc: "Apply for GST, PAN, Trademarks, or Company Registration directly from your phone or laptop in under 3 minutes.",
      icon: MousePointerClick,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
      title: "2. Error-Free Smart Document Upload",
      desc: "Our engine checks file sizes, JPEG/PDF headers, and PAN/Aadhaar card formats instantly to ensure zero rejection by government portals.",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      title: "3. Real-Time Workspace Tracking",
      desc: "Watch your application progress through Payment Clear ➔ Document Verification ➔ Legal Audit ➔ Govt Approval in real time.",
      icon: Eye,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      title: "4. Dedicated In-House CA/CS Oversight",
      desc: "You get a dedicated legal specialist assigned to your case who audits filings and resolves government queries proactively.",
      icon: Scale,
      color: "bg-amber-50 text-amber-600 border-amber-200",
    },
  ];

  const faqs = [
    {
      id: "faq-1",
      q: "How does FirstLease make compliance easier than a traditional CA?",
      a: "FirstLease eliminates paper filing, physical visits, and hidden costs. You get a transparent online workspace, automated document validation, real-time status tracking, and direct access to senior CAs and CSs.",
    },
    {
      id: "faq-2",
      q: "What is FirstLease's core vision and purpose?",
      a: "Our vision is to transform complex Indian regulatory compliance into a seamless, 1-click digital experience for 100,000+ business owners by combining schema-driven software with legal expertise.",
    },
    {
      id: "faq-3",
      q: "How do I know my business documents are secure?",
      a: "All files uploaded to FirstLease are validated using magic-byte header inspection and stored in isolated, 256-bit encrypted AWS S3 storage vaults accessible only via short-lived signed URLs.",
    },
    {
      id: "faq-4",
      q: "What happens if the government department raises a query?",
      a: "Our backoffice legal team receives government notices instantly, prepares resolution documentation, and updates your dashboard workspace so your filing proceeds without delay.",
    },
  ];

  return (
    <div className="space-y-0 selection:bg-indigo-500 selection:text-white">
      {/* Genuine ABOUT US Hero Section - Corporate Story & Foundation */}
      <Section className="relative bg-gradient-to-br from-indigo-50/80 via-slate-50 to-blue-50/60 text-slate-900 py-16 lg:py-20 border-b border-slate-200/80 overflow-hidden">
        {/* Decorative Light Background Elements */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-blue-200/40 blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Dedicated About Page Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/90 border border-indigo-200/80 text-indigo-800 text-xs font-bold uppercase tracking-wider shadow-2xs backdrop-blur-md">
              <History className="size-4 text-indigo-600" />
              <span>Our Story & Leadership Heritage</span>
            </div>

            {/* About-Focused Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Architecting India&apos;s Digital{" "}
              <span className="text-indigo-600">
                Statutory Compliance Infrastructure
              </span>
            </h1>

            {/* Corporate Origin & Mission Narrative */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-medium">
              Founded in 2021 by practicing Chartered Accountants and Senior
              Company Secretaries, FirstLease was built out of a singular
              mission: to replace bureaucratic confusion, hidden consultant
              fees, and physical paper delays with transparent digital filing
              technology.
            </p>
          </div>

          {/* About Corporate Story & Milestones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-10 border-t border-slate-200/80">
            {companyMilestones.map((ms, i) => (
              <div
                key={i}
                className="bg-white/90 border border-slate-200/80 p-5 rounded-lg text-center space-y-1 shadow-2xs backdrop-blur-md hover:border-indigo-200 transition-all"
              >
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  {ms.label}
                </span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {ms.value}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">
                  {ms.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Corporate Values & Ethos Section */}
      <Section className="py-14 bg-white border-b border-slate-200/80">
        <Container className="max-w-5xl space-y-8">
          <SectionHeading
            badge="Founding Principles"
            title="The Principles That Guide"
            highlight="Our Legal Operations"
            description="At FirstLease, we believe in a culture of transparency, innovation, and collaboration, driven by a shared commitment to excellence and customer-centricity."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreValues.map((val, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-3 hover:border-indigo-200 transition-all shadow-2xs"
              >
                <div className="size-10 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center border border-indigo-200/60">
                  <val.icon className="size-5" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {val.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {val.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Vision & Core Purpose Section */}
      <Section className="py-16 md:py-24 bg-slate-50/50">
        <Container className="space-y-12">
          <SectionHeading
            badge="Company Purpose"
            title="Why We Built"
            highlight="FirstLease"
            description="Transforming traditional offline bureaucratic filing into a transparent 1-click digital compliance experience."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Vision Card */}
            <div className="bg-linear-to-br from-indigo-50/90 to-blue-50/60 border border-indigo-100 p-8 md:p-10 rounded-lg space-y-6 shadow-2xs">
              <div className="size-12 rounded-lg bg-white border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-2xs">
                <Target className="size-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                To empower over 100,000 Indian businesses by 2030 with a
                completely automated, paperless, and stress-free statutory
                compliance infrastructure.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-700">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>100% Digital & Paperless Corporate Lifecycle</span>
              </div>
            </div>

            {/* Purpose Card */}
            <div className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-lg space-y-6 shadow-2xs">
              <div className="size-12 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-2xs">
                <Compass className="size-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Our Core Purpose
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                To protect business owners from government penalties, hidden
                consultant markups, and delayed licenses by delivering automated
                filing technology paired with certified CA & CS legal oversight.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Guaranteed Accuracy & Fixed Transparent Fees</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* HOW THIS APP MAKES USER WORK EASY */}
      <Section className="py-16 md:py-24 bg-white border-y border-slate-200/80">
        <Container className="space-y-12">
          <SectionHeading
            badge="User Experience"
            title="How FirstLease Makes Your"
            highlight="Work Easy"
            description="We replaced offline chaos, physical document prints, and endless follow-up calls with an intuitive digital workflow."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howItMakesWorkEasy.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200/80 p-7 rounded-lg space-y-3 shadow-2xs hover:border-indigo-200 transition-all"
              >
                <div
                  className={`size-11 rounded-lg flex items-center justify-center border ${item.color}`}
                >
                  <item.icon className="size-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* BEFORE vs AFTER COMPARISON TABLE */}
      <Section className="py-16 md:py-24 bg-slate-50/50">
        <Container className="space-y-12 max-w-5xl">
          <SectionHeading
            badge="Direct Comparison"
            title="Traditional Consultants vs."
            highlight="FirstLease"
            description="See how our technology cuts turnaround times, eliminates stress, and saves your business money."
            align="center"
          />

          <div className="border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs bg-white">
            <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 p-4 text-xs font-black uppercase tracking-wider text-slate-700">
              <div>Feature</div>
              <div className="text-rose-600 flex items-center gap-1.5 font-black">
                <XCircle className="size-4 text-rose-500" /> Traditional Way
              </div>
              <div className="text-emerald-700 flex items-center gap-1.5 font-black">
                <CheckCircle2 className="size-4 text-emerald-600" /> FirstLease
                Easy Way
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {comparisons.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 p-4 text-xs font-medium items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="font-bold text-slate-900">{row.feature}</div>
                  <div className="text-slate-500 flex items-center gap-2 pr-4 font-medium">
                    <XCircle className="size-4 text-rose-400 shrink-0" />
                    <span>{row.traditional}</span>
                  </div>
                  <div className="text-slate-900 font-bold flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>{row.firstLease}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQ SECTION USING REUSABLE ACCORDION COMPONENT */}
      <Section className="py-16 md:py-24 bg-white border-t border-slate-200/80">
        <Container className="space-y-8 max-w-3xl">
          <SectionHeading
            badge="FAQ"
            title="Frequently Asked"
            highlight="Questions"
            description="Clear answers to common questions about our corporate compliance services."
            align="center"
          />

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-6 shadow-2xs">
            <Accordion
              type="single"
              defaultValue="faq-1"
              className="divide-y divide-slate-100"
            >
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="py-4">
                  <AccordionTrigger className="text-xs sm:text-sm font-black text-slate-900 hover:text-indigo-600">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-2 font-medium">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </Section>

      {/* FINAL LIGHT CTA BANNER */}
      <Section className="py-16 bg-white border-slate-200/80">
        <Container>
          <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white p-8 md:p-12 rounded-xl text-center space-y-6 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Experience the Genuine, Easy Way to Comply
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
              Join 12,500+ Indian companies using FirstLease for GST, PAN,
              Trademarks, FSSAI, and MCA filings.
            </p>
            <div className="pt-2 flex justify-center">
              <Link href="/services">
                <Button
                  variant="primary"
                  size="lg"
                  className="font-bold text-xs px-8 py-3.5 bg-white text-indigo-700 hover:bg-slate-100 rounded-lg shadow-md border-0 cursor-pointer"
                >
                  Get Started with FirstLease
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
