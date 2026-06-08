import "server-only";

import { z } from "zod";
import type { AssetType, PrismaClient } from "@prisma/client";

const ACCOUNT_TYPES = [
  "account_401k",
  "account_ira",
  "account_brokerage",
  "account_checking",
  "account_savings",
] as const;

export const AddFinancialAccountSchema = z.object({
  // Entity resolution, mirrors upsert_asset: pass `id` (from the record) to
  // UPDATE an existing account, e.g. to add its balance on a later turn; omit
  // `id` to add a new one. Without this, recording a value created a duplicate.
  id: z.string().uuid().optional(),
  institution: z.string().min(1).max(120),
  account_type: z.enum(ACCOUNT_TYPES),
  estimated_value: z.number().nullable().optional(),
  beneficiary_named: z.boolean().nullable().optional(),
});

export type AddFinancialAccountInput = z.infer<typeof AddFinancialAccountSchema>;

const ACCOUNT_LABEL: Record<(typeof ACCOUNT_TYPES)[number], string> = {
  account_401k: "401(k)",
  account_ira: "IRA",
  account_brokerage: "Brokerage",
  account_checking: "Checking",
  account_savings: "Savings",
};

export async function applyAddFinancialAccount(
  prisma: PrismaClient,
  userId: string,
  stateCode: string,
  args: AddFinancialAccountInput,
) {
  if (args.id) {
    // Update — owner-scoped so a stray id can't touch another user's row.
    // Only writes the fields provided, so adding a balance later doesn't wipe
    // the rest (and never creates a second row).
    const existing = await prisma.asset.findFirst({
      where: { id: args.id, userId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) throw new Error("Account not found for this user");
    return prisma.asset.update({
      where: { id: args.id },
      data: {
        institution: args.institution,
        type: args.account_type as AssetType,
        identifier: ACCOUNT_LABEL[args.account_type],
        ...(args.estimated_value !== undefined
          ? { estimatedValue: args.estimated_value }
          : {}),
      },
    });
  }

  const created = await prisma.asset.create({
    data: {
      userId,
      type: args.account_type as AssetType,
      // Generic Asset fields reused for accounts (V1, no account-specific
      // columns): institution = provider, identifier = account kind.
      institution: args.institution,
      identifier: ACCOUNT_LABEL[args.account_type],
      estimatedValue: args.estimated_value ?? null,
      // Accounts transfer by beneficiary designation, not probate.
      transferPath: "non_probate_designation",
      stateCode,
    },
  });

  return created;
}
