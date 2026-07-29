import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Service } from "@/types/services";
import Breadcrumb from "@/components/common/Breadcrumb";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import ServiceDetailHero from "@/features/services/detail/ServiceDetailHero";
import ServiceDetailQuickFeatures from "@/features/services/detail/ServiceDetailQuickFeatures";
import ServiceDetailCheckoutSidebar from "@/features/services/detail/ServiceDetailCheckoutSidebar";
import ServiceDetailTabsContainer from "@/features/services/detail/ServiceDetailTabsContainer";
import OverviewTab from "@/features/services/detail/OverviewTab";
import BenefitsTab from "@/features/services/detail/BenefitsTab";
import DocumentsTab from "@/features/services/detail/DocumentsTab";
import FaqsTab from "@/features/services/detail/FaqsTab";

interface ServiceDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const services = await prisma.service.findMany({
      select: { slug: true },
    });

    return services.map((service) => ({
      slug: service.slug,
    }));
  } catch (err) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
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
      } as any;
    }
  } catch (err) {
    console.error("Metadata fetch error:", err);
  }

  if (!service) {
    return {
      title: "Service Not Found | Government Compliance Portal",
      description: "The requested statutory compliance service could not be found.",
    };
  }

  return {
    title: `${service.title} | Registration & Licensing Compliance`,
    description: service.shortDescription,
    openGraph: {
      title: service.title,
      description: service.shortDescription,
      type: "website",
      url: `https://compliance.in/services/${service.slug}`,
    },
    alternates: {
      canonical: `https://compliance.in/services/${service.slug}`,
    },
  };
}

export default async function Page({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
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
      } as any;
    }
  } catch (error) {
    console.error("Database query failed for service detail page:", error);
  }

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-slate-50/50 min-h-screen">
      <Section className="py-8">
        <Container>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Services", href: "/services" },
              { label: service.title },
            ]}
          />

          <ServiceDetailHero service={service} />
          <ServiceDetailQuickFeatures service={service} />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ServiceDetailTabsContainer
                overviewContent={<OverviewTab service={service} />}
                benefitsContent={<BenefitsTab service={service} />}
                documentsContent={<DocumentsTab service={service} />}
                faqsContent={<FaqsTab service={service} />}
              />
            </div>

            <div>
              <ServiceDetailCheckoutSidebar service={service} />
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
