import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // Fallback to .env

import { PrismaClient } from "@prisma/client";
import { services } from "../src/data/services";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed with updated services catalog...");

  // 1. Seed Master Admin User Account
  const adminEmail = process.env.ADMIN_EMAIL || "admin@firstlease.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      id: "usr_admin_master",
      name: "Master Admin Specialist",
      email: adminEmail,
      phone: "+91 9999988888",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin account provisioned:", adminUser.email, "(Role: ADMIN)");

  // 2. Seed Services Catalog & Detailed Statutory Metadata
  let seededCount = 0;
  for (const s of services) {
    const benefits = s.details?.benefits || s.benefits || [];
    const eligibility = s.details?.eligibility || s.eligibility || [];
    const requiredDocuments = s.details?.requiredDocuments || s.requiredDocuments || [];
    const faqs = s.details?.faqs || s.faqs || [];

    const existingService = await prisma.service.findUnique({
      where: { slug: s.slug },
      include: { details: true },
    });

    if (existingService) {
      // Update main service record
      await prisma.service.update({
        where: { id: existingService.id },
        data: {
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
        },
      });

      // Upsert ServiceDetail relation
      if (existingService.details) {
        await prisma.serviceDetail.update({
          where: { serviceId: existingService.id },
          data: {
            benefits,
            eligibility,
            requiredDocuments,
            faqs,
          },
        });
      } else {
        await prisma.serviceDetail.create({
          data: {
            serviceId: existingService.id,
            benefits,
            eligibility,
            requiredDocuments,
            faqs,
          },
        });
      }
    } else {
      // Create new service record
      await prisma.service.create({
        data: {
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
              benefits,
              eligibility,
              requiredDocuments,
              faqs,
            },
          },
        },
      });
    }

    seededCount++;
    console.log(`  └─ Synced service [${seededCount}/${services.length}]: ${s.title} (${s.slug})`);
  }

  console.log(`\n🎉 Database seed completed successfully! Total services synced: ${seededCount}`);
}

main()
  .catch((e) => {
    console.error("❌ Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
