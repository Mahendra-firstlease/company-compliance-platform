import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://firstlease.com";

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/contact",
    "/faq",
    "/login",
    "/register",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
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
      url: `${baseUrl}/services/${service.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));
  } catch (err) {
    console.error("Error generating sitemap service routes:", err);
  }

  return [...staticRoutes, ...serviceRoutes];
}
