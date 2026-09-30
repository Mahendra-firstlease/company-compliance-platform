import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  const connectionUrl = process.env.DATABASE_URL;
  if (!connectionUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Add it to your .env file: DATABASE_URL=\"mysql://root:@localhost:3306/compliance_db\""
    );
  }
  const adapter = new PrismaMariaDb(connectionUrl);

  return new PrismaClient({
    adapter,
    log: ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

