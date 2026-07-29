import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us | FirstLease Enterprise Statutory Compliance",
  description:
    "Learn about FirstLease — India's leading technology-driven business compliance and statutory licensing platform trusted by 12,500+ companies.",
  openGraph: {
    title: "About Us | FirstLease Statutory Compliance Platform",
    description:
      "Automating statutory licensing, GST, PAN, Trademark, and corporate filings with dedicated CA/CS expert oversight.",
    url: "https://firstlease.com/about",
    type: "website",
  },
  alternates: {
    canonical: "https://firstlease.com/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}