/**
 * Centralized Site & Environment Configuration
 * Provides type-safe access to application URLs, brand metadata, and email asset paths
 * across both Development and Production environments.
 */

const normalizeUrl = (url?: string, fallback: string = "https://complianceportalindia.com"): string => {
  const target = (url || fallback).trim();
  return target.replace(/\/+$/, "");
};

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Compliance Portal India",
  company: process.env.NEXT_PUBLIC_COMPANY || "Compliance Portal India Pvt Ltd",

  // Base web domain (http://localhost:3000 in dev, https://complianceportalindia.com in prod)
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://complianceportalindia.com"),

  // Public asset host for emails (guarantees images load in Gmail/Outlook even when sending from dev)
  emailAssetUrl: normalizeUrl(
    process.env.NEXT_PUBLIC_EMAIL_ASSET_URL || process.env.NEXT_PUBLIC_SITE_URL,
    "https://complianceportalindia.com"
  ),

  supportEmail: "support@complianceportalindia.com",
  officialEmail: "info@complianceportalindia.com",

  // Helper to construct absolute site URLs
  getAbsoluteUrl(path: string = ""): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.url}${cleanPath}`;
  },

  // Helper to construct absolute email asset URLs
  getEmailAssetUrl(path: string = ""): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.emailAssetUrl}${cleanPath}`;
  },
} as const;

export default siteConfig;

