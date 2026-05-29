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
