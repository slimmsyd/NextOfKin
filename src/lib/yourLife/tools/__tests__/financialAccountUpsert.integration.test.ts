import { describe, it, expect } from "vitest";

// Regression for the duplicate-on-value bug: add_financial_account was
// create-only, so recording an account's balance on a later turn created a
// SECOND row instead of updating the first (two "Navy Federal" rows, one null
// value, one $8,000). The fix gives it an id-based update path like upsert_asset.
//
// DB-gated: skips without DATABASE_URL (pnpm test stays green). Run with
// `pnpm test:db`. Everything runs inside a transaction that is rolled back, so
// no data is mutated.

const DB = process.env.DATABASE_URL;
const SENTINEL = "ZZ Upsert Test Bank";

describe.skipIf(!DB)("add_financial_account upsert (integration)", () => {
  it("updates by id instead of creating a duplicate when a value is added", async () => {
    const { prisma } = await import("@/lib/prisma");
    const { applyAddFinancialAccount } = await import(
      "@/lib/yourLife/tools/addFinancialAccount"
    );

    const u = await prisma.user.findFirst({ select: { id: true, stateCode: true } });
    if (!u) return; // empty DB, nothing to anchor the FK

    await prisma
      .$transaction(async (tx) => {
        const client = tx as unknown as typeof prisma;
        // 1) account named, no value yet
        const created = await applyAddFinancialAccount(client, u.id, u.stateCode, {
          institution: SENTINEL,
          account_type: "account_savings",
        });
        // 2) value given a turn later -> should UPDATE the same row, not create
        const updated = await applyAddFinancialAccount(client, u.id, u.stateCode, {
          id: created.id,
          institution: SENTINEL,
          account_type: "account_savings",
          estimated_value: 8000,
        });

        expect(updated.id).toBe(created.id);
        expect(Number(updated.estimatedValue)).toBe(8000);

        const count = await client.asset.count({
          where: { userId: u.id, institution: SENTINEL, deletedAt: null },
        });
        expect(count).toBe(1);

        throw new Error("ROLLBACK"); // undo everything
      })
      .catch((e) => {
        if ((e as Error).message !== "ROLLBACK") throw e;
      });
  });
});
