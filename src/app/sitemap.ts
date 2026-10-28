import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import siteConfig from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/contact",
    "/faq",
    "/login",
    "/register",
  ].map((route) => ({
    url: siteConfig.getAbsoluteUrl(route),
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  let serviceRoutes: MetadataRoute.Sitemap = [];

  try {
    const services = await prisma.service.findMany({
      select: { slug: true },
    });

    serviceRoutes = services.map((service) => ({
      url: siteConfig.getAbsoluteUrl(`/services/${service.slug}`),
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch (err) {
    console.error("Error generating sitemap service routes:", err);
  }

  return [...staticRoutes, ...serviceRoutes];
}
