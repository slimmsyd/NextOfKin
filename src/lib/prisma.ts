import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Soft-delete (prisma-extension-soft-delete@2.0.1) is incompatible with the
// Prisma 7 client at build time. Re-introduce once the extension supports
// Prisma 7, or replace with a manual middleware. Until then: callers must
// filter deletedAt themselves and use UPDATE to soft-delete.

declare global {
  var __prismaClient: PrismaClient | undefined;
}

function makeClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}

export const prisma = global.__prismaClient ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  global.__prismaClient = prisma;
}

export type Prisma = typeof prisma;
