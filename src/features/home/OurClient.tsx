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
          badge="our clints"
          title="Built for"
          highlight="Modern Businesses"
          align="center"
          description="Trusted by startups, MSMEs, and enterprises for registrations, certifications, and compliance services."
        />
        <ClientLogoCarousel clientLogos={clientLogos} />
      </Container>
    </Section>
  );
}
