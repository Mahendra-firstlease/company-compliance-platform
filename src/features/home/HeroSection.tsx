import React from "react";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import Button from "@/components/common/Button";
import Image from "next/image";

type Props = {
  children?: React.ReactNode;
};

function HeroSection({}: Props) {
  return (
    <>
      <Section className="w-full bg-linear-to from-indigo-50/80 via-slate-50 to-blue-50/60 border-b border-slate-200/80 px-4 pb-10">
        <Container className="container flex flex-col-reverse md:flex-row items-center justify-between gap-8">
          {/* Left */}
          <div className="flex flex-col items-start">
            <a
              href="#"
              className="flex items-center gap-2 bg-primary-light border border-primary-border rounded-full p-1 pr-3 text-sm mx-auto md:mx-0 mt-20"
            >
              <span className="bg-primary text-white text-xs px-3 py-1 rounded-full">
                New
              </span>
              <p className="flex items-center gap-2 text-primary">
                <span className="text-sm">Trusted by 1,000+ companies </span>
                <svg
                  className="mt-px"
                  width="6"
                  height="9"
                  viewBox="0 0 6 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m1 1 4 3.5L1 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </p>
            </a>

            <h1 className="text-center lg:text-left text-neutral-900 text-4xl md:text-5xl lg:text-[52px]/16 leading-tight font-semibold max-w-156.5 mt-4">
              Get Licenses &{" "}
              <span className="text-primary"> Certifications </span> Easily
            </h1>
            <p className="text-center lg:text-left text-base/7 text-neutral-600 max-w-md mt-4 mx-auto md:mx-0">
              The Most comprehensive B2B portal for government registration.
              Fast, secure, expert-led and hassle free.
            </p>

            <div className="flex items-center border gap-2 border-neutral-300 h-13 max-w-[440px] w-full rounded-full overflow-hidden mt-6 mx-auto md:mx-0">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full h-full pl-6 outline-none text-sm bg-transparent text-neutral-600"
                required
              />
              <Button
                type="submit"
                variant="primary"
                className="w-56 h-10 rounded-full text-xs font-bold text-slate-50 cursor-pointer mr-1.5 shrink-0"
              >
                Subscribe now
              </Button>
            </div>
            <p className="inline-flex gap-2 text-center lg:text-left text-sm text-neutral-600 mt-4">
              Popular:{" "}
              <span className="font-normal text-sm px-4 bg-gray-200 rounded-lg">
                GST
              </span>{" "}
              <span className="font-normal text-sm px-4 bg-gray-200 rounded-lg">
                FSSI
              </span>
              <span className="font-normal text-sm px-4 bg-gray-200 rounded-lg">
                MSME
              </span>
              <span className="font-normal text-sm px-4 bg-gray-200 rounded-lg">
                IEC
              </span>
            </p>

            {/* Avatars + Stars */}
            <div className="flex items-center mt-10 mx-auto lg:mx-0">
              <div className="flex -space-x-3 pr-3">
                <Image

                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200"
                  alt="user avatar 1"
                  width={36}
                  height={36}
                  className="size-9 object-cover rounded-full border border-slate-50 hover:-translate-y-0.5 transition"
                />
                <Image
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                  alt="user avatar 2"
                  width={36}
                  height={36}
                  className="size-9 object-cover rounded-full border border-slate-50 hover:-translate-y-0.5 transition"
                />
                <Image
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                  alt="user avatar 3"
                  width={36}
                  height={36}
                  className="size-9 object-cover rounded-full border border-slate-50 hover:-translate-y-0.5 transition"
                />
              </div>

              <div>
                <div className="flex">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-star text-transparent fill-[#FF8F20]"
                        aria-hidden="true"
                      >
                        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                      </svg>
                    ))}
                </div>
                <p className="text-xs text-neutral-600">
                  Used by 10,000+ users
                </p>
              </div>
            </div>
          </div>

          {/* Right — LCP Element with Priority Preload & Aspect Ratio Placeholder */}
          <div className="w-full max-w-md md:max-w-lg aspect-square">
            <Image
              className="w-full h-auto object-contain"
              src={"/images/home/hero-section/hero-rightsocial-image.png"}
              width={500}
              height={500}
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 500px"
              alt="FirstLease Dashboard and Compliance Platform Preview"
            />
          </div>
        </Container>
      </Section>
    </>
  );
}

export default HeroSection;
