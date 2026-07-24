import FeaturesSection from "@/features/home/FeaturesSection";
import HeroSection from "@/features/home/HeroSection";
import OurClient from "@/features/home/OurClient";
import ServicesSection from "@/features/home/ServicesSection";
import FaqSection from "@/features/home/FaqSection";
import TestimonialsSection from "@/features/home/TestimonialsSection";
export default function Home() {
  return (
    <>
      <HeroSection />
      <OurClient />
      <ServicesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
