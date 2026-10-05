/**
 * Central Barrel Export for All Project Constants
 */

export * from "./routes";
export * from "./status";
export * from "./file";
export * from "./finance";
export * from "./storage";
export * from "./filters";
export * from "./notification";
export * from "./seo";

export const APP_METADATA = {
  name: "FirstLease Compliance Platform",
  description: "Enterprise B2B compliance management and statutory filing portal.",
  supportEmail: "info@complianceportalindia.com",
  supportPhone: "+91 9773880555",
  address: "Sauch Tower 72, Phase IV, Udyog Vihar, Sector 18, Gurugram, Haryana 122015",
} as const;
