import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/Heading";
import Image from "next/image";
export default function FeaturesSection() {
  return (
    <Section className="flex-col items-center justify-center bg-gray-50">
      <Container className="flex w-full flex-col items-center">
        {/* Section Heading */}
        <SectionHeading 
          badge="Features"
          title="Smart Compliance "
          highlight="Assistants"
          description="We provide a range of smart compliance assistants to help you stay compliant with the latest regulations and industry best practices."
          align="center"
        />
        <div className="flex flex-col gap-5">
          {/* Row 1 */}
          <div className="flex flex-col md:flex-row gap-5">
            <div className="md:w-[60%] md:h-60 bg-primary-light border border-primary-border/60 rounded-lg hover:shadow-sm transition-all duration-300 p-5 flex flex-col md:flex-row gap-5">
              <Image
                src="/images/home/hero-section/hero-rightsocial-image.png"
                alt="Feature workspace"
                className="w-full h-48 md:h-full md:w-[45%] object-cover rounded-lg"
                width={300}
                height={200}
              />
              <div className="flex flex-col mt-2">
                <div className="size-11 bg-primary rounded-lg flex items-center justify-center mb-5">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 3H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1m11 0h-5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1m0 11h-5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1M9 14H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1"
                      stroke="#fafafa"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-primary">
                  Flexible Components
                </h3>
                <p className="text-sm/6 text-zinc-800 mt-2.5">
                  Build layouts faster using modular, responsive and
                  well-structured UI components that adapt to any use case.
                </p>
              </div>
            </div>

            <div className="md:w-[40%] bg-primary-light border border-primary-border/60 rounded-lg hover:shadow-sm transition-all duration-300 px-6 py-6 md:pt-7">
              <div className="size-11 bg-primary rounded-lg flex items-center justify-center mb-5">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
                    stroke="#fafafa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="m9 12 2 2 4-4"
                    stroke="#fafafa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-primary">
                Production-Ready Design
              </h3>
              <p className="text-sm text-zinc-800 mt-2.5">
                Designed for real-world products, following best practices in
                accessibility and consistency. Seamlessly integrates into
                production workflows.
              </p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col md:flex-row gap-5">
            <div className="md:w-[40%] bg-primary-light border border-primary-border/60 rounded-lg hover:shadow-sm transition-all duration-300 px-6 py-6 md:pt-7">
              <div className="size-11 bg-primary rounded-lg flex items-center justify-center mb-5">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.671 4.134a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.83A2.34 2.34 0 0 1 6.35 6.048a2.34 2.34 0 0 0 3.319-1.915"
                    stroke="#f4f4f5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
                    stroke="#f4f4f5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-primary">
                Easy Customization
              </h3>
              <p className="text-sm text-zinc-800 mt-2.5">
                Tokens, spacing and styles are easy to customization stays
                simple without breaking layouts. Quickly tailor components to
                match brand and design system.
              </p>
            </div>

            <div className="md:w-[60%] md:h-60 bg-primary-light border border-primary-border/60 rounded-lg hover:shadow-sm transition-all duration-300 p-5 flex flex-col md:flex-row gap-5">
              <Image
                src="https://assets.prebuiltui.com/images/components/feature-sections/feature-minimal-office-img.png"
                alt="Feature office"
                width={300}
                height={200}
                className="w-full h-48 md:h-full md:w-[45%] object-cover rounded-lg"
              />

              <div className="flex flex-col mt-2">
                <div className="size-11 bg-primary rounded-lg flex items-center justify-center mb-5">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 3H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-2 8v4a2 2 0 0 0 2 2h4m6-4h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2"
                      stroke="#fafafa"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-primary">
                  Built for Modern Teams
                </h3>
                <p className="text-sm/6 text-zinc-800 mt-2.5">
                  Ideal for startups, agencies and developers building modern
                  web apps. Supports collaboration and scalability.
                </p>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </Section>
  );
}
