"use client";

import { useEffect, useState } from "react";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
// import Breadcrumb from "@/components/common/Breadcrumb";

/* ---------------------------------------------------
   CONTENT MODEL
--------------------------------------------------- */

type Block =
  | { type: "p"; text: string }
  | { type: "subhead"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; text: string };

type Section = {
  id: string;
  title: string;
  navLabel: string;
  blocks: Block[];
};

const HERO = {
  title: "Privacy Policy",
  meta: "Compliance Portal India · Last reviewed 2026",
};

const SECTIONS: Section[] = [
  {
    id: "s1",
    title: "Personal information we collect",
    navLabel: "Personal information we collect",
    blocks: [
      {
        type: "p",
        text: "We may collect personal information when you voluntarily provide it while interacting with our website or using our Services. Depending on the nature of the Service requested, this may include:",
      },
      {
        type: "list",
        items: [
          "Full name, email address, mobile or telephone number",
          "Residential or business address, and date of birth where required",
          "PAN, Aadhaar, or other identification details, where applicable",
          "Business registration and incorporation details",
          "GST, MCA, MSME/Udyam and other registration information",
          "Banking and payment-related information, where required",
          "Details of directors, partners, proprietors, authorised representatives or other stakeholders",
          "Documents required for registrations, filings, licences, certifications and compliance services",
          "Any other information voluntarily provided in connection with your enquiry, account, transaction or requested Service",
        ],
      },
      {
        type: "p",
        text: "We collect information that is reasonably necessary to provide, process, administer, and improve our Services. You may choose not to provide certain information — however, doing so may prevent us from processing your request.",
      },
    ],
  },
  {
    id: "s2",
    title: "Non-personal information",
    navLabel: "Non-personal information",
    blocks: [
      {
        type: "p",
        text: "When you interact with our website, we may automatically collect certain technical and non-personal information, including browser type and version, device type, operating system, IP address, internet service provider, pages visited and time spent on our website, referral sources, usage patterns, and technical logs.",
      },
      {
        type: "p",
        text: "This information helps us understand how visitors use our website, maintain functionality, improve performance, and enhance the overall user experience.",
      },
    ],
  },
  {
    id: "s3",
    title: "Cookies and similar technologies",
    navLabel: "Cookies & technologies",
    blocks: [
      {
        type: "p",
        text: "Our website may use cookies and similar technologies to improve functionality, understand usage, remember preferences, and enhance your browsing experience. Cookies may help us maintain functionality, remember preferences, analyse traffic, improve performance, and support relevant communications where applicable.",
      },
      {
        type: "p",
        text: "You may configure your browser to reject cookies or notify you when they are used. Disabling certain cookies may affect the availability of some features.",
      },
    ],
  },
  {
    id: "s4",
    title: "How we use your information",
    navLabel: "How we use your information",
    blocks: [
      { type: "subhead", text: "Providing and processing Services" },
      {
        type: "p",
        text: "To process registrations, applications, filings, certifications, licences, tax-related services, compliance requirements, payments, enquiries, and other requested Services.",
      },
      { type: "subhead", text: "Customer support" },
      {
        type: "p",
        text: "To respond to enquiries, provide assistance, and address customer-service requirements.",
      },
      { type: "subhead", text: "Improving our Services" },
      {
        type: "p",
        text: "To understand user requirements, analyse feedback, and develop better customer experiences.",
      },
      { type: "subhead", text: "Communication and updates" },
      {
        type: "p",
        text: "To send service-related notifications, application updates, reminders, transaction confirmations, and important announcements.",
      },
      { type: "subhead", text: "Payments and transactions" },
      {
        type: "p",
        text: "To process payments and maintain transaction-related records through appropriate financial service providers.",
      },
      { type: "subhead", text: "Compliance and legal requirements" },
      {
        type: "p",
        text: "To meet applicable legal, regulatory, governmental, tax, accounting, audit, and statutory obligations.",
      },
      { type: "subhead", text: "Security and fraud prevention" },
      {
        type: "p",
        text: "To protect our website, systems, users, and business operations against unauthorised access, fraud, and misuse.",
      },
      { type: "subhead", text: "Marketing and promotional communication" },
      {
        type: "p",
        text: "Where permitted, we may share information about our Services, updates, or offers. You may opt out at any time via the unsubscribe instructions in such communications or by contacting us directly.",
      },
    ],
  },
  {
    id: "s5",
    title: "How we protect your information",
    navLabel: "How we protect your information",
    blocks: [
      {
        type: "p",
        text: "CPI takes reasonable and appropriate measures to protect personal and business information against unauthorised access, misuse, alteration, disclosure, loss, or destruction, including:",
      },
      {
        type: "list",
        items: [
          "Controlled access to information and restrictions for authorised personnel",
          "Secure data storage practices",
          "Encryption or secure transmission mechanisms where appropriate",
          "Monitoring and security procedures",
        ],
      },
      {
        type: "callout",
        text: "No method of transmission over the internet or electronic storage can be guaranteed to be completely secure, though we take reasonable measures to safeguard your information.",
      },
    ],
  },
  {
    id: "s6",
    title: "Sharing and disclosure of information",
    navLabel: "Sharing & disclosure",
    blocks: [
      {
        type: "p",
        text: "We do not sell or rent your personal information for monetary consideration. We may share information where reasonably necessary to provide our Services, operate our business, comply with legal obligations, or protect our legitimate interests — including with:",
      },
      { type: "subhead", text: "Service providers" },
      {
        type: "p",
        text: "Third-party vendors, consultants, technology providers, payment processors, and professional advisors who assist us in delivering our Services, and are expected to maintain appropriate confidentiality and security.",
      },
      { type: "subhead", text: "Government and regulatory authorities" },
      {
        type: "p",
        text: "Where required for registrations, filings, licences, or statutory compliance, we may submit relevant information to government departments, statutory authorities, or regulators.",
      },
      { type: "subhead", text: "Professional advisors" },
      {
        type: "p",
        text: "Legal, accounting, tax, compliance, or audit advisors, where necessary for providing Services or meeting legal obligations.",
      },
      { type: "subhead", text: "Business transfers" },
      {
        type: "p",
        text: "If CPI undergoes a merger, acquisition, restructuring, or sale of assets, information may be transferred as part of that transaction, subject to applicable confidentiality requirements.",
      },
    ],
  },
  {
    id: "s7",
    title: "Links to third-party websites",
    navLabel: "Third-party websites",
    blocks: [
      {
        type: "p",
        text: "Our website may contain links to third-party websites, platforms, payment gateways, or government portals. These operate independently and may have their own privacy policies. CPI does not control or assume responsibility for the privacy practices of third-party websites, and recommends reviewing their policies before providing personal information.",
      },
    ],
  },
  {
    id: "s8",
    title: "Third-party services, analytics and advertising",
    navLabel: "Analytics & advertising",
    blocks: [
      {
        type: "p",
        text: "We may use third-party technology providers for website analytics, performance monitoring, communications, advertising, and payment processing. These parties may collect or process certain information in accordance with their own privacy policies and applicable laws. You may manage certain preferences through your browser, device settings, or the relevant third-party platform.",
      },
    ],
  },
  {
    id: "s9",
    title: "Children's privacy",
    navLabel: "Children's privacy",
    blocks: [
      {
        type: "p",
        text: "Our Services are intended for businesses, professionals, entrepreneurs, and individuals who are legally capable of entering into applicable transactions. We do not knowingly collect personal information from children where prohibited by applicable law. If you believe a child has provided personal information without appropriate consent, please contact us so we can take reasonable steps to address it.",
      },
    ],
  },
  {
    id: "s10",
    title: "Data retention",
    navLabel: "Data retention",
    blocks: [
      {
        type: "p",
        text: "We retain personal and business information only for as long as reasonably necessary to fulfil the purposes for which it was collected, provide our Services, maintain records, resolve disputes, and comply with legal requirements. Retention periods vary depending on the nature of the information and applicable statutory requirements.",
      },
    ],
  },
  {
    id: "s11",
    title: "Your rights and choices",
    navLabel: "Your rights & choices",
    blocks: [
      {
        type: "p",
        text: "Subject to applicable laws, you may have rights regarding your personal information, including the ability to:",
      },
      {
        type: "list",
        items: [
          "Request information about the personal data we hold about you",
          "Request correction of inaccurate or incomplete information",
          "Request deletion of information where legally permissible",
          "Withdraw consent where processing is based on consent",
          "Opt out of promotional communications",
          "Raise concerns regarding the handling of your personal information",
        ],
      },
      {
        type: "p",
        text: "Certain requests may be subject to applicable legal, regulatory, contractual, or operational limitations. To exercise these rights, please contact us using the details below.",
      },
    ],
  },
  {
    id: "s12",
    title: "Data accuracy",
    navLabel: "Data accuracy",
    blocks: [
      {
        type: "p",
        text: "We rely on the information provided by users and clients to deliver our Services. You are responsible for ensuring that information and documents submitted to CPI are accurate, complete, current, and legally valid. If you identify inaccurate or outdated information, please contact us so appropriate corrections can be considered.",
      },
    ],
  },
  {
    id: "s13",
    title: "Changes to this Privacy Policy",
    navLabel: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "CPI may update or modify this Privacy Policy from time to time to reflect changes in our Services, business practices, technology, or applicable legal and regulatory requirements.",
      },
      {
        type: "p",
        text: "When material changes are made, we may provide appropriate notice through our website, email, or other reasonable means, where required.",
      },
      {
        type: "p",
        text: "We encourage you to periodically review this Privacy Policy to remain informed about how we collect, use, and protect your information.",
      },
      {
        type: "p",
        text: "Your continued use of our website or Services following the posting of changes constitutes acknowledgement of the updated Privacy Policy, subject to applicable law.",
      },
    ],
  },
  {
    id: "s14",
    title: "Contact us",
    navLabel: "Contact us",
    blocks: [
      {
        type: "p",
        text: "If you have questions, concerns, requests, or complaints regarding this Privacy Policy or the handling of your personal information, please contact us:",
      },
      {
        type: "list",
        items: [
          "Company: Compliance Portal India",
          "Website: https://complianceportalindia.com/",
          "Email: info@complianceportalindia.com",
          "Phone: +91-9773880555",
          "Registered Office: 6th floor, Sauch Tower, Plot No.72, Udyog Vihar phase-IV, Gurugram-122015 (HR) India",
        ],
      },
      {
        type: "p",
        text: "We will make reasonable efforts to review and respond to privacy-related enquiries in accordance with applicable laws and our internal procedures.",
      },
    ],
  },
];

/* ---------------------------------------------------
   RENDER HELPERS
--------------------------------------------------- */

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case "p":
      return (
        <p key={i} className="text-sm leading-7 text-slate-600">
          {block.text}
        </p>
      );
    case "subhead":
      return (
        <p key={i} className="text-sm font-semibold text-slate-800 mt-5 mb-1">
          {block.text}
        </p>
      );
    case "list":
      return (
        <ul key={i} className="list-disc pl-5 space-y-1.5">
          {block.items.map((item, j) => (
            <li key={j} className="text-sm leading-6 text-slate-600">
              {item}
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div
          key={i}
          className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-6 text-slate-700"
        >
          {block.text}
        </div>
      );
    default:
      return null;
  }
}

/* ---------------------------------------------------
   PAGE
--------------------------------------------------- */

export default function PrivacyPolicy() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const sectionEls = document.querySelectorAll<HTMLElement>("[data-policy-section]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            if (id) setActiveId(id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    sectionEls.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Hero banner with curved bottom */}
      <div className="relative bg-primary pb-30 pt-12 text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
          {HERO.title}
        </h1>
        {/* Curved bottom edge — concave wave */}
        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden leading-none"
          style={{ height: "80px" }}
        >
          <svg
            viewBox="0 0 1200 80"
            preserveAspectRatio="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,0 Q600,80 1200,0 L1200,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white py-10 pb-20">
        <Container>
          {/* Intro paragraph */}
          <div className="mb-10 p-2 rounded-lg border border-slate-200 bg-slate-50/60 text-sm leading-7 text-slate-600 space-y-3">
            <p>
              Compliance Portal India (&ldquo;CPI&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) respects your privacy and is committed to protecting the personal and business information you share with us.
            </p>
            <p>
              This Privacy Policy explains how Compliance Portal India collects, uses, stores, processes, and protects information when you visit or use our website, platform, products, and services (collectively, the &ldquo;Services&rdquo;).
            </p>
            <p>
              By accessing or using our website or Services, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with any part of this Privacy Policy, please discontinue use of our website and Services.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-10">

            {/* Sidebar nav */}
            <nav className="lg:sticky lg:top-24 lg:self-start">
              <ul className="space-y-0">
                {SECTIONS.map((s) => (
                  <li key={s.id} className="border-b border-slate-100">
                    <a
                      href={`#${s.id}`}
                      onClick={() => setActiveId(s.id)}
                      className={`block w-full py-3 text-sm transition-colors ${
                        activeId === s.id
                          ? "text-primary font-semibold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {s.navLabel}
                    </a>
                    {activeId === s.id && (
                      <div className="h-0.5 bg-primary w-full" />
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content */}
            <div className="space-y-10">
              {SECTIONS.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  data-policy-section
                  className="scroll-mt-24"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.blocks.map((block, i) => renderBlock(block, i))}
                  </div>
                </section>
              ))}
            </div>

          </div>
        </Container>
      </div>
    </div>
  );
}
