import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ServicesPage from "@/features/services/ServicesPage";
import { Service } from "@/types/services";
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
      // Do not use mock fallback services if DB returns empty
      allServices = [];
    }
  } catch (error) {
    console.error("Database query failed:", error);
    allServices = [];
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
        if (d === "1-2") return s.duration.includes("24") || s.duration.includes("1-2");
        if (d === "3-7") return s.duration.includes("3") || s.duration.includes("5-7") || s.duration.includes("7");
        if (d === "7+") return s.duration.includes("10") || s.duration.includes("15") || s.duration.includes("30");
        return false;
      })
    );
  }

  if (sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "popular") {
    filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
  }

  const totalResults = filtered.length;
  const totalPages = Math.ceil(totalResults / pageSize) || 1;
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const paginatedServices = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <ServicesPage
      services={paginatedServices}
      totalResults={totalResults}
      currentPage={currentPage}
      totalPages={totalPages}
      search={search}
    />
  );
}