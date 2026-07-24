import { PrismaClient } from "@prisma/client";
import { services } from "../src/data/services";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  // 1. Seed Admin User Account
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@firstlease.com" },
    update: {
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      id: "usr_admin_master",
      name: "Master Admin Specialist",
      email: "admin@firstlease.com",
      phone: "+91 9999988888",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log("Admin account provisioned:", adminUser.email, "(Role: ADMIN)");

  // 2. Seed Services Catalog
  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        price: s.price,
      },
      create: {
        id: s.id,
        slug: s.slug,
        title: s.title,
        shortDescription: s.shortDescription,
        description: s.description || s.shortDescription,
        image: s.image,
        price: s.price,
        originalPrice: s.originalPrice,
        governmentFee: s.governmentFee || 0,
        professionalFee: s.professionalFee || s.price,
        duration: s.duration,
        featured: s.featured || false,
        popular: s.popular || false,
        details: {
          create: {
            benefits: s.benefits || [],
            eligibility: s.eligibility || [],
            requiredDocuments: s.requiredDocuments || [],
            faqs: s.faqs || [],
          },
        },
      },
    });
  }

  console.log("Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
