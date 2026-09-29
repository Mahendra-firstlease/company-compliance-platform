import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/Heading";
import ClientLogoCarousel from "@/components/common/ClientLogoCarousel";
import { clientLogos } from "@/data/clientLogos";

export default function ClientLogosSection({}) {
  return (
    <Section className="bg-gray-50">
      <Container>
        <SectionHeading
          badge="Our Clients"
          title="Trusted by"
          highlight="Businesses Across India"
          align="center"
          description="From emerging startups to established enterprises, businesses trust Compliance Portal India to
            simplify their compliance journey."
        />
        <ClientLogoCarousel clientLogos={clientLogos} />
      </Container>
    </Section>
  );
}
