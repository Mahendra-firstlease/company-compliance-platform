interface FooterData {
  companyInfo: {
    name: string;
    description: string;
  };
  links: {
    title: string;
    links: { title: string; url: string }[];
  }[];
  socialMedia: { name: string; url: string }[];
}

export const footerData: FooterData = {
  companyInfo: {
    name: "Filing Compliance",
    description:
      "We are a leading company in our industry, committed to providing high-quality products and services to our customers. Our mission is to innovate and deliver solutions that make a difference in people's lives. ",
  },
  links: [
    {
      title: "Our Services",
      links: [
        { title: "Service 1", url: "/services/service-1" },
        { title: "Service 2", url: "/services/service-2" },
        { title: "Service 3", url: "/services/service-3" },
        { title: "Service 4", url: "/services/service-4" },
      ],
    },
    {
      title: "About Us",
      links: [
        { title: "About Us", url: "/about" },
        { title: "Careers", url: "/careers" },
        { title: "Contact", url: "/contact" },
        { title: "Privacy Policy", url: "/privacy-policy" },
        { title: "Terms of Service", url: "/terms-of-service" },
      ],
    },
    {
      title: "Helpful Links",
      links: [
        
        { title: "FAQ", url: "/faq" },
        { title: "Support", url: "/support" },
        { title: "Blog", url: "/blog" },
      ],
    },
  ],
  socialMedia: [
    { name: "Twitter", url: "https://twitter.com/yourcompany" },
    { name: "LinkedIn", url: "https://linkedin.com/company/yourcompany" },
    { name: "Facebook", url: "https://facebook.com/yourcompany" },
  ],
};
