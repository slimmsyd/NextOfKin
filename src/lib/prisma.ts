import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { createSoftDeleteExtension } from "prisma-extension-soft-delete";

declare global {
  var __prismaClient: PrismaClient | undefined;
}

function makeClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });
}

const basePrisma = global.__prismaClient ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  global.__prismaClient = basePrisma;
}

export const prisma = basePrisma.$extends(
  createSoftDeleteExtension({
    models: {
      Asset: true,
      Debt: true,
      Beneficiary: true,
      EstateIntent: true,
      TrustedContact: true,
      Document: true,
      CheckIn: true,
      DeathSignal: true,
      DisseminationAction: true,
      LifeEvent: true,
    },
    defaultConfig: {
      field: "deletedAt",
      createValue: (deleted) => (deleted ? new Date() : null),
    },
  }),
);

export type Prisma = typeof prisma;
