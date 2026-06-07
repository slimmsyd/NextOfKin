import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Standalone Prisma client for read-only scripts. The app's `@/lib/prisma` is
// `server-only` and not importable here; this mirrors its construction (same
// adapter + DATABASE_URL). Run scripts with the env loaded, e.g.
//   pnpm tsx --env-file=.env.local scripts/<name>.ts
export function makeScriptPrisma() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    log: ["error"],
  });
}
