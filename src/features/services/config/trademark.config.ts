import { ServiceFormConfig } from "@/types/form-config.types";

export const trademarkConfig: ServiceFormConfig = {
  serviceSlug: "trademark-registration",
  title: "Trademark & Brand Registration",
  category: "Intellectual Property",
  sections: [
    {
      id: "brand_info",
      title: "1. Brand Identity & Class Selection",
      fields: [
        {
          id: "brandName",
          type: "text",
          label: "Brand / Wordmark Name",
          placeholder: "e.g. FirstLease",
          required: true,
        },
        {
          id: "trademarkClass",
          type: "select",
          label: "NICE Trademark Class",
          required: true,
          optionsSource: {
            type: "static",
            options: [
              { label: "Class 9 - Software & Electronics", value: "CLASS_9" },
              { label: "Class 35 - Business Management & Retail", value: "CLASS_35" },
              { label: "Class 42 - Technology & SaaS Services", value: "CLASS_42" },
              { label: "Class 45 - Legal & Security Services", value: "CLASS_45" },
            ],
          },
        },
      ],
    },
    {
      id: "trademark_files",
      title: "2. Logo & User Affidavit Attachments",
      fields: [
        {
          id: "logoImage",
          type: "file",
          label: "Brand Logo Artwork (PNG/SVG Max 300KB)",
          required: true,
          uploadRule: {
            allowedExtensions: ["png", "jpg", "svg"],
            allowedMimeTypes: ["image/png", "image/jpeg", "image/svg+xml"],
            maxSizeBytes: 300 * 1024, // 300KB
          },
        },
        {
          id: "userAffidavit",
          type: "file",
          label: "User Affidavit & Usage Proof (PDF)",
          required: true,
          uploadRule: {
            allowedExtensions: ["pdf"],
            allowedMimeTypes: ["application/pdf"],
            maxSizeBytes: 3 * 1024 * 1024,
          },
        },
      ],
    },
  ],
};
