import React from "react";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";

export default function GetStartedSection() {
  return (
    <Section className=" overflow-x-hidden border-t border-slate-100 bg-primary-light py-12 md:py-20">
      <Container className="flex w-full flex-col items-center gap-10">

        {/* Banner bracket */}
        <div className="flex w-[calc(100%+2rem)] -mx-4 sm:w-[calc(100%+3rem)] sm:-mx-6 flex-col items-center justify-center text-center rounded-2xl py-20 md:py-24 px-4 bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/banners/image-1.png')] bg-cover bg-center bg-no-repeat">
          <h2 className="text-2xl md:text-3xl font-medium text-white max-w-2xl">
            Ready to Get Started?
          </h2>
          <div className="h-[3px] w-32 my-2 bg-gradient-to-l from-transparent to-primary" />
          <p className="text-sm md:text-base text-white max-w-xl">
            Create an account to begin your compliance journey or manage your existing business
            requirements. Explore our services and get expert assistance - all in one place.
          </p>
          <a
            href="/register"
            className="inline-flex w-fit items-center justify-center border-0 px-8 py-2.5 mt-5 text-sm bg-primary hover:bg-primary-hover hover:scale-105 transition duration-300 text-white rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Get Started
          </a>
        </div>


      </Container>
    </Section>
  );
}
