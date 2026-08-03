import { PrismaClient } from "@prisma/client";

// temporary logging
if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);

  console.log("Database Host:", url.host);
  console.log("Database Port:", url.port);
  console.log("Database Params:", url.search);
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
