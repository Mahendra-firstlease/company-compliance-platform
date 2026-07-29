import React from "react";
import Section from "@/components/common/Section";
import Container from "@/components/common/Container";
import ContactForm from "@/features/contact/ContactForm";
function ContactUs() {
  return (
    <Section className="">
      <Container className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
        {/* Left Side */}
        <div className="flex flex-col justify-start pt-1">
            <div className="flex items-center gap-2.5 mb-6">
                <div className="size-2 rounded-full bg-primary"></div>
                <span className="text-zinc-500 font-medium text-sm tracking-wide">CONTACT</span>
            </div>
            <h1 className="text-4xl font-medium text-zinc-900 mb-3 sm:mb-5">Let’s Start a Conversation</h1>
            <p className="text-base text-zinc-400 leading-relaxed max-w-105">
                Have a question or need help? Reach out and our team will get back to you as soon as possible.
            </p>

            <div className="flex flex-col space-y-5 mt-3">
                <div className="flex items-center gap-2">
                    <div className="size-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m18.333 5.836-7.492 4.772a1.67 1.67 0 0 1-1.674 0l-7.5-4.772" stroke="#71717b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.667 3.336H3.333c-.92 0-1.666.746-1.666 1.667v10c0 .92.746 1.666 1.666 1.666h13.334c.92 0 1.666-.746 1.666-1.666v-10c0-.92-.746-1.667-1.666-1.667" stroke="#71717b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-sm text-zinc-600">hello@prebuiltUI.com</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="size-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#a)"><path d="M11.527 13.804a.83.83 0 0 0 1.01-.252l.296-.388a1.67 1.67 0 0 1 1.334-.667h2.5a1.667 1.667 0 0 1 1.666 1.667v2.5a1.667 1.667 0 0 1-1.666 1.667 15 15 0 0 1-15-15 1.667 1.667 0 0 1 1.666-1.667h2.5A1.667 1.667 0 0 1 7.5 3.331v2.5a1.67 1.67 0 0 1-.667 1.333l-.39.293A.83.83 0 0 0 6.2 8.484a11.67 11.67 0 0 0 5.327 5.32" stroke="#71717b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h20v20H0z"/></clipPath></defs></svg>
                    </div>
                    <span className="text-sm text-zinc-600">+91-9341555-010</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="size-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.667 8.33c0 4.162-4.616 8.495-6.166 9.833a.83.83 0 0 1-1.002 0c-1.55-1.338-6.166-5.671-6.166-9.832a6.667 6.667 0 0 1 13.334 0" stroke="#71717b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 10.836a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" stroke="#71717b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-sm text-zinc-600">2425 HSR Layout, Bangalore, TX73301</span>
                </div>
            </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full border border-zinc-300 rounded-lg p-8">
          <h2 className="text-base font-medium text-zinc-800 mb-5.5">
            Send Message
          </h2>
          <ContactForm />
        </div>
      </Container>
    </Section>
  );
}

export default ContactUs;
