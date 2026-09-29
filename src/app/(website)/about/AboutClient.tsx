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
    // {
    //   label: "Established",
    //   value: "2021",
    //   desc: "Founded by CA & CS Practice Leaders",
    // },
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
      desc: "Clear and upfront pricing with no hidden charges, so you always know exactly what you'repaying for. We believe transparency builds trust and ensures a straightforward experience from start to finish.",
      icon: Scale,
    },
    {
      title: "Expert-Led Support",
      desc: "Get professional guidance from experienced specialists who understand your compliance equirements. We simplify complex processes and help you make informed decisions at every step.",
      icon: Zap,
    },
    {
      title: "Hassle-Free Process",
      desc: "From documentation to submission, we make your compliance journey simple, organised, and convenient. Spend less time navigating paperwork and more time focusing on your business.",
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
      title: "Zero Bureaucracy & Office Visits",
      desc: "Initiate registrations and compliance services online from wherever you are, saving time and eliminating unnecessary visits.",
      icon: MousePointerClick,
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "Smart & Secure Document Handling",
      desc: "Upload your documents through a streamlined process with clear format and documentation requirements to minimise errors and delays.",
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      title: "Expert-Led Compliance Support",
      desc: "Get professional assistance from experienced compliance specialists who help you navigate documentation, filings, and regulatory requirements.",
      icon: Eye,
      color: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "Transparent Process & Timely Updates",
      desc: "Stay informed at every stage with clear communication, process visibility, and updates on your compliance request.",
      icon: Scale,
      color: "bg-primary-border/10 text-primary-border border-primary-border/20",
    },
  ];

  const faqs = [
    {
      id: "faq-1",
      q: "What services does Compliance Portal India provide? ",
      a: "Compliance Portal India offers a wide range of services, including Startup India (DPIIT) recognition, GST registration, ITR filing, PAN services, MCA company/LLP registration, MSME/Udyam registration, ISO certifications, and other regulatory compliance solutions. "
    },
    {
      id: "faq-2",
      q: "Can Compliance Portal India help startups with registrations and government compliances?",
      a: "Yes. We assist startups with essential registrations such as Startup India (DPIIT), GST, MSME/Udyam, PAN, and company/LLP registration, helping them establish their business with the right documentation and compliance support. "
    },
    {
      id: "faq-3",
      q: "Why should I choose Compliance Portal India for compliance services? ",
      a: "We bring multiple business compliance requirements together under one platform, offering professional guidance, a simplified process, transparent support, and assistance from registration to ongoing regulatory requirements. ",
    },
    {
      id: "faq-4",
      q: "Can I manage multiple business compliance requirements through one platform? ",
      a: "bsolutely. Compliance Portal India is designed as a one-stop compliance platform where businesses can access multiple registration, tax, certification, and regulatory services without having to manage each requirement separately.",
    },
  ];

  return (
    <div className="space-y-0 selection:bg-primary selection:text-white">
      {/* Genuine ABOUT US Hero Section - Corporate Story & Foundation */}
      <Section className="relative bg-primary-light text-slate-900 py-16 lg:py-20 border-b border-primary-border/20 overflow-hidden">
        {/* Decorative Light Background Elements */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Dedicated About Page Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider shadow-2xs backdrop-blur-md">
              <History className="size-4 text-primary" />
              <span>About Compliance Portal India</span>
            </div>

            {/* About-Focused Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Simplifying Compliance{" "}
              <span className="text-primary">
                Empowering Businesses
              </span>
            </h1>

            {/* Corporate Origin & Mission Narrative */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl mx-auto font-medium">
                Compliance Portal India is a comprehensive compliance solutions platform designed to make
                business registrations, certifications, tax services, licences, and regulatory requirements simpler
                and more accessible.
                
                <br />
                From entrepreneurs taking their first step to established businesses managing ongoing regulatory
                requirements, we help businesses navigate compliance with greater clarity, confidence, and
                convenience.  
            </p>
          </div>

          {/* About Corporate Story & Milestones Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-12 pt-10 border-t border-slate-200/80">
            {companyMilestones.map((ms, i) => (
              <div
                key={i}
                className="bg-white/90 border border-slate-200/80 p-5 rounded-lg text-center space-y-1 shadow-2xs backdrop-blur-md hover:border-primary/30 transition-all"
              >
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
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
            badge="Our Vision"
            title="Building a Simpler, Smarter & "
            highlight="More Compliant Business Ecosystem"
            description="To become a trusted compliance partner for businesses across India by making registrations,
                    certifications, tax services, and regulatory compliance simple, accessible, transparent, and
                    technology-driven.
                    We envision a future where businesses can navigate compliance with confidence, minimize
                  complexity, and focus on what truly matters - building, growing, and creating lasting impact."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreValues.map((val, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-3 hover:border-primary/30 transition-all shadow-2xs"
              >
                <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
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
      {/* <Section className="py-16 md:py-24 bg-slate-50/50">
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
            {/* <div className="bg-linear-to-br from-primary-light/90 to-primary-light/60 border border-primary-border p-8 md:p-10 rounded-lg space-y-6 shadow-2xs">
              <div className="size-12 rounded-lg bg-white border border-primary-border text-primary flex items-center justify-center shadow-2xs">
                <Target className="size-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                To empower over 100,000 Indian businesses by 2030 with a
                completely automated, paperless, and stress-free statutory
                compliance infrastructure.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-primary">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>100% Digital & Paperless Corporate Lifecycle</span>
              </div>
            </div>

            {/* Purpose Card */}
            {/* <div className="bg-white border border-slate-200/80 p-8 md:p-10 rounded-lg space-y-6 shadow-2xs">
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
          </div> */} */
        {/* </Container>
      </Section>  */}

      {/* HOW THIS APP MAKES USER WORK EASY */}
      <Section className="py-16 md:py-24 bg-white border-y border-slate-200/80">
        <Container className="space-y-12">
          <SectionHeading
            badge="User Experience"
            title="How Compliance Portal India"
            highlight="Makes Compliance Easier"
            description="We simplify complex compliance processes by replacing paperwork, unnecessary office visits,
              and endless follow-ups with a seamless, structured, and convenient digital experience"
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {howItMakesWorkEasy.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50/70 border border-slate-200/80 p-7 rounded-lg space-y-3 shadow-2xs hover:border-primary/30 transition-all"
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
      {/* <Section className="py-16 md:py-24 bg-slate-50/50">
        <Container className="space-y-12 max-w-5xl">
          <SectionHeading
            badge="Direct Comparison"
            title="Traditional Consultants vs."
            highlight="FirstLease"
            description="See how our technology cuts turnaround times, eliminates stress, and saves your business money."
            align="center"
          />

          <div className="border border-slate-200/90 rounded-lg overflow-hidden shadow-2xs bg-white">
            <div className="hidden md:grid grid-cols-3 bg-slate-100 border-b border-slate-200 p-4 text-xs font-black uppercase tracking-wider text-slate-700">
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
                  className="p-4 space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:items-center hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <div className="font-bold text-slate-900">{row.feature}</div>
                  <div className="text-slate-500 flex items-start gap-2 md:pr-4 font-medium">
                    <XCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="md:hidden block text-[10px] font-black uppercase tracking-wider text-rose-600 mb-1">
                        Traditional Way
                      </span>
                      <span>{row.traditional}</span>
                    </div>
                  </div>
                  <div className="text-slate-900 font-bold flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="md:hidden block text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1">
                        FirstLease Easy Way
                      </span>
                      <span>{row.firstLease}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section> */}

      {/* FAQ SECTION USING REUSABLE ACCORDION COMPONENT */}
      {/* <Section className="py-16 md:py-24 bg-white border-t border-slate-200/80">
        <Container className="space-y-8 max-w-3xl">
          <SectionHeading
            badge="FAQ"
            title="Frequently Asked "
            highlight="Questions"
            description="Find quick answers to common questions about our compliance services, processes, registrations, 
              and certifications. "
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
                  <AccordionTrigger className="text-xs sm:text-sm font-black text-slate-900 hover:text-primary">
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
      </Section> */}

      {/* FINAL LIGHT CTA BANNER */}
      {/* <Section className="py-16 bg-white border-slate-200/80">
        <Container>
          <div className="bg-linear-to-r from-primary via-primary to-primary text-white p-8 md:p-12 rounded-lg text-center space-y-6 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Experience the Genuine, Easy Way to Comply
            </h2>
            <p className="text-primary text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-medium">
              Join 12,500+ Indian companies using FirstLease for GST, PAN,
              Trademarks, FSSAI, and MCA filings.
            </p>
            <div className="pt-2 flex justify-center">
              <Link href="/services">
                <Button
                  variant="primary"
                  size="lg"
                  className="font-bold text-xs px-8 py-3.5 bg-white text-primary hover:bg-slate-100 rounded-lg shadow-md border-0 cursor-pointer"
                >
                  Get Started with FirstLease
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section> */}
    </div>
  );
}
