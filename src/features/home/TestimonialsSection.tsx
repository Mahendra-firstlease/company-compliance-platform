import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/Heading";
import TestimonialsCarousel from "@/components/common/TestimonialCarousel";

export default function TestimonialsSection() {
  return (
    <Section className="flex-col items-center justify-center bg-white border-b border-slate-200/80">
      <Container className="flex w-full flex-col items-center">
        {/* Section Heading without kicker */}
        <SectionHeading
          title="Client Experiences"
          highlight="That Speak for Us"
          description="Hear from businesses that have trusted CPI to simplify their compliance journey with professional guidance, transparent processes, and dependable support."
          align="center"
        />

        {/* Testimonials Grid component */}
        <TestimonialsCarousel />
      </Container>
    </Section>
  );
}
