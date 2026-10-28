import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/Heading";
import { prisma } from "@/lib/prisma";
import ServiceCard from "@/components/cards/ServicesCard";
import { Service } from "@/types/services";
import { services as fallbackServices } from "@/data/services";

export default async function ServicesSection() {
  let servicesList: Service[] = [];
  try {
    const dbServices = await Promise.race([
      prisma.service.findMany({
        take: 6,
        orderBy: { featured: "desc" },
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("Database connection timeout")), 2000)
      ),
    ]);

    if (dbServices && dbServices.length > 0) {
      servicesList = dbServices as any[];
    }
  } catch (error) {
    console.warn(
      "[Prisma Service Notice]: Database connection pool unavailable in ServicesSection, utilizing static services catalogue fallback.",
      error instanceof Error ? error.message : error
    );
  }

  // Gracefully fallback to static services catalogue if database is unreachable or empty
  if (servicesList.length === 0) {
    servicesList = fallbackServices.slice(0, 6);
  }

  return (
    <Section className="flex-col items-center justify-center bg-slate-50/50 border-b border-slate-200/80">
      <Container className="flex w-full flex-col items-center">
        <SectionHeading
          title="Comprehensive Compliance Solutions"
          highlight="Services"
          description="From business registrations to certifications and regulatory requirements, explore solutions tailored to your business needs."
          align="center"
        />

        <div className="grid w-full max-w-6xl grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-2">
          {servicesList.map((service) => (
            <ServiceCard key={service.id || service.slug} service={service} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
