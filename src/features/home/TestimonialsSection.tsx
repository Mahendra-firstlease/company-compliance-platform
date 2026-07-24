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
          title="What Our "
          highlight="Clients Say"
          description="We provide a range of smart compliance assistants to help you stay compliant with the latest regulations and industry best practices."
          align="center"
        />

        {/* Testimonial Crousel component */}
        <TestimonialsCarousel />
      </Container>
    </Section>
  );
}
