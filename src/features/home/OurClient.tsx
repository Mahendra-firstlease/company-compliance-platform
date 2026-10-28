import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/Heading";
import ClientLogoCarousel from "@/components/common/ClientLogoCarousel";
import { clientLogos } from "@/data/clientLogos";

export default function ClientLogosSection({}) {
  return (
    <Section className="bg-slate-50/60 border-b border-slate-200/80">
      <Container>
        <SectionHeading
          title="Trusted by"
          highlight="Businesses Across India"
          align="center"
          description="From emerging startups to established enterprises, businesses trust Compliance Portal India to simplify their compliance journey."
        />
        <ClientLogoCarousel clientLogos={clientLogos} />
      </Container>
    </Section>
  );
}
