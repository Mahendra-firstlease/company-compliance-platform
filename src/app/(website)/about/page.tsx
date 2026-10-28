import { Metadata } from "next";
import AboutClient from "./AboutClient";
import siteConfig from "@/config/site";

export const metadata: Metadata = {
  title: "About Us | Compliance Portal India",
  description:
    "Learn about Compliance Portal India — India's leading technology-driven business compliance and statutory licensing platform trusted by 12,500+ companies.",
  openGraph: {
    title: "About Us | Compliance Portal India",
    description:
      "Automating statutory licensing, GST, PAN, Trademark, and corporate filings with dedicated CA/CS expert oversight.",
    url: siteConfig.getAbsoluteUrl("/about"),
    type: "website",
  },
  alternates: {
    canonical: siteConfig.getAbsoluteUrl("/about"),
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
