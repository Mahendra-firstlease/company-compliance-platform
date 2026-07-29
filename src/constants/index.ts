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
  supportEmail: "support@firstlease.com",
  supportPhone: "+91 98765 43210",
  address: "Compliance Towers, Connaught Place, New Delhi, India",
} as const;
