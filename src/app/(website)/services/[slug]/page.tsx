import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Service } from "@/types/services";
import { services as fallbackServices } from "@/data/services";
import ServiceDetailHero from "@/features/services/detail/ServiceDetailHero";
import ServiceDetailQuickFeatures from "@/features/services/detail/ServiceDetailQuickFeatures";
import ServiceDetailTabsContainer from "@/features/services/detail/ServiceDetailTabsContainer";
import OverviewTab from "@/features/services/detail/OverviewTab";
import BenefitsTab from "@/features/services/detail/BenefitsTab";
import DocumentsTab from "@/features/services/detail/DocumentsTab";
import FaqsTab from "@/features/services/detail/FaqsTab";
import ServiceDetailCheckoutSidebar from "@/features/services/detail/ServiceDetailCheckoutSidebar";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let serviceName = slug ? slug.replace(/-/g, " ").toUpperCase() : "Compliance Service";
  
  try {
    const service = await prisma.service.findUnique({
      where: { slug },
      select: { title: true, shortDescription: true },
    });
    if (service) {
      serviceName = service.title;
    }
  } catch (err) {
    // Ignore db fallback
  }

  return {
    title: `${serviceName} | Government Registration & Compliance`,
    description: `Complete ${serviceName} registration online. Fast processing, statutory fee coverage, and dedicated CA/CS expert assistance.`,
    openGraph: {
      title: `${serviceName} Registration`,
      description: `Get statutory ${serviceName} compliance assistance online.`,
      url: `https://compliance.in/services/${slug}`,
      type: "website",
    },
    alternates: {
      canonical: `https://compliance.in/services/${slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  let service: Service | null = null;

  try {
    const dbService = await prisma.service.findUnique({
      where: { slug },
      include: { details: true },
    });

    if (dbService) {
      const { details, ...base } = dbService;
      service = {
        ...base,
        originalPrice: base.originalPrice ?? undefined,
        benefits: (details?.benefits as string[]) || [],
        eligibility: (details?.eligibility as string[]) || [],
        requiredDocuments: (details?.requiredDocuments as string[]) || [],
        faqs: (details?.faqs as any[]) || [],
      };
    } else {
      service = fallbackServices.find((s) => s.slug === slug) || null;
    }
  } catch (error) {
    console.error("Database lookup error in /services/[slug] page.tsx:", error);
    service = fallbackServices.find((s) => s.slug === slug) || null;
  }

  if (!service) {
    notFound();
  }

  // JSON-LD Structural Schema for single Service
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.shortDescription,
    "provider": {
      "@type": "Organization",
      "name": "Compliance Platform India",
      "url": "https://compliance.in",
    },
    "offers": {
      "@type": "Offer",
      "price": service.price,
      "priceCurrency": "INR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Section className="bg-gray-50/50 min-h-screen pt-8 pb-20">
        <Container>
          {/* Breadcrumb Navigation (RSC Rendered) */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Services", href: "/services" },
                { label: service.title },
              ]}
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column (65%) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hero & Feature Summary (100% Server Component) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-4 shadow-xs">
                <ServiceDetailHero service={service} />
                <ServiceDetailQuickFeatures service={service} />
              </div>

              {/* Tabs Container (Isolated Client Island with RSC children) */}
              <ServiceDetailTabsContainer
                overviewContent={<OverviewTab service={service} />}
                benefitsContent={<BenefitsTab service={service} />}
                documentsContent={<DocumentsTab service={service} />}
                faqsContent={<FaqsTab service={service} />}
              />
            </div>

            {/* Right Sticky Sidebar (100% Server Component + Isolated Apply Button) */}
            <ServiceDetailCheckoutSidebar service={service} />
          </div>
        </Container>
      </Section>
    </>
  );
}
