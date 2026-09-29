import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/Heading";
import TestimonialsCarousel from "@/components/common/TestimonialCarousel";
export default function TestimonialsSection() {
  return (
    <Section className="flex-col items-center justify-center">
      <Container className="flex w-full flex-col items-center">
        {/* Section Heading */}
        <SectionHeading
          badge="Testimonials"
          title="Client Experiences "
          highlight="That Speak for Us"
          description="Hear from businesses that have trusted CPI to simplify their compliance journey with professional guidance, transparent processes, and dependable support."
          align="center"
        />

        {/* Testimonial Crousel component */}
        <TestimonialsCarousel />
      </Container>
    </Section>
  );
}
