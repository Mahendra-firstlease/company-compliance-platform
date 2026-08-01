import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetUserTable() {
  console.log("🔄 Resetting User Table in MySQL database...");

  try {
    await prisma.$connect();

    console.log("  └─ Cleaning dependent user records...");
    await prisma.notification.deleteMany({});
    await prisma.complianceSchedule.deleteMany({});
    await prisma.issuedCertificate.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.businessProfile.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.crmLead.deleteMany({});

    // Delete all users
    const deleteResult = await prisma.user.deleteMany({});
    console.log(`  └─ Deleted ${deleteResult.count} existing user records.`);

    // Re-seed Master Admin Specialist Account
    const adminEmail = process.env.ADMIN_EMAIL || "admin@firstlease.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    const masterAdmin = await prisma.user.create({
      data: {
        id: "usr_admin_master",
        name: "Master Admin",
        email: adminEmail,
        phone: "+91 9999988888",
        passwordHash: adminPasswordHash,
        role: "ADMIN",
      },
    });

    console.log("\n🎉 User table reset complete!");
    console.log(`✅ Master Admin Account Provisioned: ${masterAdmin.email} (Role: ${masterAdmin.role})`);
  } catch (error) {
    console.error("❌ Error resetting User table:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetUserTable();
