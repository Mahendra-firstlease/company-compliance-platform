import type { NavLink, NavItem } from "@/types";
export type { NavLink, NavItem };

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Services",
    href: "/services",
    mega: true,
    links: [
      { label: "Company Registration", href: "/services/company-registration" },
      { label: "GST Registration", href: "/services/gst-registration" },
      { label: "MSME Registration", href: "/services/msme-registration" },
      { label: "Startup India", href: "/services/startup-india-registration" },
      { label: "FSSAI License", href: "/services/fssai-license" },
      { label: "Trade License", href: "/services/trade-license" },
      { label: "Shop & Establishment", href: "/services/shop-establishment-license" },
      { label: "Factory License", href: "/services/factory-license" },
      { label: "Pollution NOC", href: "/services/pollution-noc" },
      { label: "Fire NOC", href: "/services/fire-noc" },
      { label: "ISO Certification", href: "/services/iso-certifications" },
      { label: "Trademark Registration", href: "/services/trademark-registration" },
      { label: "IEC Registration", href: "/services/iec-registration" },
      { label: "Labour Registrations", href: "/services/labour-registrations" },
      { label: "Professional Tax", href: "/services/professional-tax-registration" },
    ],
  },
  {
    label: "FAQs",
    href: "/faq",
  },
  {
    label: "Components Sandbox",
    href: "/component-customization",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];
