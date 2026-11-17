import siteConfig from "@/config/site";
import { services as staticServices } from "@/data/services";
import { prisma } from "@/lib/prisma";

export async function generateLlmsText(): Promise<string> {
  const baseUrl = siteConfig.url;

  // Attempt to fetch service list from DB, or fallback to static catalog
  let services = staticServices;
  try {
    const dbServices = await prisma.service.findMany({
      select: {
        slug: true,
        title: true,
        shortDescription: true,
        description: true,
        price: true,
        duration: true,
      },
    });
    if (dbServices.length > 0) {
      services = dbServices as any;
    }
  } catch {
    // Retain staticServices fallback
  }

  const serviceListMarkdown = services
    .map((s) => {
      const summary = s.shortDescription || s.description?.slice(0, 160) || "Statutory compliance assistance.";
      const priceText = s.price ? ` | Package: ₹${s.price.toLocaleString("en-IN")}` : "";
      const durationText = s.duration ? ` | Timeline: ${s.duration}` : "";
      return `- [${s.title}](${baseUrl}/services/${s.slug}): ${summary.trim()}${priceText}${durationText}`;
    })
    .join("\n");

  return `# ${siteConfig.name}

> Comprehensive statutory corporate filings, corporate governance, Ministry of Corporate Affairs (MCA) incorporation, taxation, and business compliance platform in India.

${siteConfig.name} (${siteConfig.company}) is a digital legal and corporate compliance advisory platform. We assist startups, micro, small & medium enterprises (MSMEs), and corporate entities across India in fulfilling their statutory registration, licensing, taxation, and annual ROC filing obligations. Our network includes practicing Chartered Accountants (CAs), Company Secretaries (CSs), and corporate advocates.

## Core Statutory Services & Registrations

${serviceListMarkdown}

## Key Informational & Legal Resources

- [Services Catalog](${baseUrl}/services): Comprehensive directory of all MCA, taxation, and licensing workflows.
- [About Us](${baseUrl}/about): Details regarding our legal advisory team, mission, and professional network.
- [Contact & Support](${baseUrl}/contact): Official support channels, help desk, and compliance escalation team. Email: ${siteConfig.supportEmail}.
- [Frequently Asked Questions (FAQ)](${baseUrl}/faq): Answers regarding government portals, filing timelines, eligibility criteria, and required documents.
- [Privacy Policy](${baseUrl}/privacy-policy): Information security, document encryption, and privacy protections.
- [Terms of Service](${baseUrl}/terms-of-service): Terms of engagement, professional advisory guidelines, and platform policies.

## Compliance Architecture & Filing Lifecycle

1. **Service Selection & Application Intake**: Structured digital forms tailored to MCA SPICe+, GST, or Trademark requirements.
2. **Document Verification**: Specialist review of identity, business constitution, and address proofs before government portal lodgment.
3. **Government Portal Processing**: Lodgment on official ministry portals (MCA V3, GSTN, IP India, Income Tax) with ARN tracking.
4. **License & Certificate Issuance**: Direct delivery of official government registration certificates, incorporation orders, and tax IDs to the client workspace vault.
`;
}
