import type { NavLink, NavItem } from "@/types";
import { services } from "@/data/services";
export type { NavLink, NavItem };

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Services",
    href: "/services",
    mega: true,
    links: services.map((s) => ({
      label: s.title,
      href: `/services/${s.slug}`,
      description: s.shortDescription,
    })),
  },
  {
    label: "FAQs",
    href: "/faq",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

