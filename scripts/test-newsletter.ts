import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as dotenv from "dotenv";

dotenv.config();

const url = process.env.DATABASE_URL!;
console.log("Connecting with URL:", url);

const adapter = new PrismaMariaDb(url);
const prisma = new PrismaClient({ adapter, log: ["query", "error"] });

async function main() {
  console.log("Testing connection...");
  const result = await prisma.$queryRaw`SELECT 1+1 AS result`;
  console.log("Connection OK:", result);

  console.log("Testing newsletterSubscriber upsert...");
  const sub = await prisma.newsletterSubscriber.upsert({
    where: { email: "test@example.com" },
    update: { isActive: true },
    create: { email: "test@example.com" },
  });
  console.log("Upsert OK:", sub);

  await prisma.newsletterSubscriber.delete({ where: { email: "test@example.com" } });
  console.log("Cleanup done. All good!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
