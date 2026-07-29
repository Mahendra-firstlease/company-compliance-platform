import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/Heading";
import { prisma } from "@/lib/prisma";
import ServiceCard from "@/components/cards/ServicesCard";
import { Service } from "@/types/services";

export default async function ServicesSection() {
  let servicesList: Service[] = [];
  try {
    const dbServices = await prisma.service.findMany({
      take: 6,
      orderBy: { featured: "desc" },
    });

    if (dbServices && dbServices.length > 0) {
      servicesList = dbServices as any[];
    }
  } catch (error) {
    console.error("Prisma error in ServicesSection:", error);
  }

  if (servicesList.length === 0) {
    return null; // Gracefully hide homepage catalog section if database returns 0 services
  }

  return (
    <Section className="flex-col items-center justify-center bg-slate-50/50">
      <Container className="flex w-full flex-col items-center">
        <SectionHeading
          badge="Catalog"
          title="Featured Compliance "
          highlight="Services"
          description="Explore our most popular government registration and legal certification services."
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
