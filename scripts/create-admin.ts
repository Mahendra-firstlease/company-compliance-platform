import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const args = process.argv.slice(2);
  const emailInput = args[0] || process.env.ADMIN_EMAIL || "admin@firstlease.com";
  const passwordInput = args[1] || process.env.ADMIN_PASSWORD || "Admin@12345";
  const nameInput = args[2] || "Platform Admin";
  const phoneInput = args[3] || "+91 9999988888";

  const email = emailInput.toLowerCase().trim();

  console.log(`\n🔐 Provisioning Admin User in Database...`);
  console.log(`   Email: ${email}`);
  console.log(`   Name:  ${nameInput}`);

  try {
    const passwordHash = await bcrypt.hash(passwordInput, 10);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        role: "ADMIN",
        passwordHash,
        name: nameInput,
        phone: phoneInput,
      },
      create: {
        name: nameInput,
        email,
        phone: phoneInput,
        passwordHash,
        role: "ADMIN",
      },
    });

    console.log(`\n✅ Admin account successfully provisioned!`);
    console.log(`   User ID:  ${admin.id}`);
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Role:     ${admin.role}`);
    console.log(`   Password: ${passwordInput}`);
    console.log(`\n👉 You can now log in at: http://localhost:3000/login\n`);
  } catch (error: any) {
    console.error(`\n❌ Failed to provision admin user:`, error.message || error);
    if (error.code === "P1001") {
      console.error(`\n💡 Tip: Could not reach the MySQL database. Ensure your MySQL server (e.g. XAMPP, MySQL Service) is running and DATABASE_URL in .env is correct.\n`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

