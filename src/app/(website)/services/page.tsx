import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ServicesPage from "@/features/services/ServicesPage";
import { Service } from "@/types/services";
import { services as fallbackServices } from "@/data/services";
import { ServiceFilterSchema } from "@/schemas/service.schema";

interface ServicesPageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
    price?: string;
    delivery?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ServicesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const search = params.search || "";

  return {
    title: search
      ? `Search results for "${search}" | Government Compliance Services`
      : "Government Compliance Services & Registrations Catalog",
    description:
      "Browse 15+ government compliance services including Company Registration, GST Registration, MSME, FSSAI License, and Trademark Filing.",
    openGraph: {
      title: "Government Compliance Services Catalog",
      description: "Fast-track statutory registration and compliance services.",
      type: "website",
      url: "https://compliance.in/services",
    },
    alternates: {
      canonical: "https://compliance.in/services",
    },
  };
}

export default async function Page({ searchParams }: ServicesPageProps) {
  const rawParams = await searchParams;
  const validated = ServiceFilterSchema.parse(rawParams);

  const search = validated.search;
  const sort = validated.sort;
  const page = validated.page;
  const pageSize = 6;

  let allServices: Service[] = [];

  try {
    const dbServices = await prisma.service.findMany({
      include: { details: true },
      orderBy: { title: "asc" },
    });

    if (dbServices && dbServices.length > 0) {
      allServices = dbServices.map((s) => {
        const { details, ...base } = s;
        return {
          ...base,
          originalPrice: base.originalPrice ?? undefined,
          benefits: (details?.benefits as string[]) || [],
          eligibility: (details?.eligibility as string[]) || [],
          requiredDocuments: (details?.requiredDocuments as string[]) || [],
          faqs: (details?.faqs as any[]) || [],
        };
      }) as any[];
    } else {
      allServices = fallbackServices;
    }
  } catch (error) {
    console.error("Database query failed, using fallback catalog:", error);
    allServices = fallbackServices;
  }

  // Server-side filtering
  let filtered = [...allServices];

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.shortDescription.toLowerCase().includes(query)
    );
  }

  const selectedPrice = validated.price ? validated.price.split(",") : [];
  if (selectedPrice.length > 0) {
    filtered = filtered.filter((s) =>
      selectedPrice.some((p) => {
        if (p === "999") return s.price < 1000;
        if (p === "1000-5000") return s.price >= 1000 && s.price <= 5000;
        if (p === "5000+") return s.price > 5000;
        return false;
      })
    );
  }

  const selectedDelivery = validated.delivery ? validated.delivery.split(",") : [];
  if (selectedDelivery.length > 0) {
    filtered = filtered.filter((s) =>
      selectedDelivery.some((d) => {
        const dur = s.duration.toLowerCase();
        if (d === "24") return dur.includes("24") || dur.includes("1 day");
        if (d === "3days") return dur.includes("3") || dur.includes("2") || dur.includes("4");
        if (d === "7days") return dur.includes("7") || dur.includes("5") || dur.includes("10");
        return false;
      })
    );
  }

  if (sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "popular") {
    filtered = filtered.filter((s) => s.popular);
  }

  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const paginatedServices = filtered.slice((page - 1) * pageSize, page * pageSize);

  // JSON-LD Structural Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Compliance Services Catalog",
    "numberOfItems": totalResults,
    "itemListElement": paginatedServices.map((s, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": s.title,
      "url": `https://compliance.in/services/${s.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicesPage
        services={paginatedServices}
        totalResults={totalResults}
        currentPage={page}
        totalPages={totalPages}
        search={search}
      />
    </>
  );
}