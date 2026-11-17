import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import siteConfig from "@/config/site";
import { services as staticServices } from "@/data/services";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/contact",
    "/faq",
    "/privacy-policy",
    "/terms-of-service",
    "/login",
    "/register",
  ].map((route) => ({
    url: siteConfig.getAbsoluteUrl(route),
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let serviceSlugs: string[] = [];

  try {
    const dbServices = await prisma.service.findMany({
      select: { slug: true },
    });
    if (dbServices.length > 0) {
      serviceSlugs = dbServices.map((s) => s.slug);
    }
  } catch (err) {
    console.warn("[Sitemap] Database lookup failed, falling back to static services catalog:", err);
  }

  // Fallback to static catalog if DB is empty or unreachable
  if (serviceSlugs.length === 0) {
    serviceSlugs = staticServices.map((s) => s.slug);
  }

  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: siteConfig.getAbsoluteUrl(`/services/${slug}`),
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
