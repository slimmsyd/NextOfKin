import "server-only";

import { z } from "zod";
import type { AssetType, PrismaClient, TransferPath } from "@prisma/client";

// Catch-all capture for assets that are neither real estate (upsert_asset) nor a
// financial account (add_financial_account): a vehicle, business interest,
// personal property / valuables, life insurance, annuity, or anything else the
// person owns (e.g. crypto -> "other"). This keeps the foundation robust as new
// kinds of assets surface: nothing the person states is dropped, and nothing is
// mistyped (a car must not become a real-estate row). The interview still leads
// with the chapter's focus; this only ensures off-focus assets land correctly.
const OTHER_ASSET_TYPES = [
  "vehicle",
  "life_insurance",
  "annuity",
  "business_interest",
  "personal_property",
  "other",
] as const;

export const AddOtherAssetSchema = z.object({
  // Entity resolution, mirrors upsert_asset: pass `id` (from the record) to
  // UPDATE an existing item (e.g. add its value later); omit `id` to add a new
  // one. Without this, recording a value created a duplicate.
  id: z.string().uuid().optional(),
  type: z.enum(OTHER_ASSET_TYPES),
  label: z.string().min(1).max(160),
  estimated_value: z.number().nullable().optional(),
  detail: z.string().max(200).nullable().optional(),
});

export type AddOtherAssetInput = z.infer<typeof AddOtherAssetSchema>;

// Insurance and annuities pay a named beneficiary (non-probate); the rest pass
// through the estate by default until titled otherwise.
const NON_PROBATE_TYPES: ReadonlySet<string> = new Set([
  "life_insurance",
  "annuity",
]);

export async function applyAddOtherAsset(
  prisma: PrismaClient,
  userId: string,
  stateCode: string,
  args: AddOtherAssetInput,
) {
  const transferPath: TransferPath = NON_PROBATE_TYPES.has(args.type)
    ? "non_probate_designation"
    : "probate";

  if (args.id) {
    // Update — owner-scoped. Writes only the fields provided so adding a value
    // later doesn't wipe the rest, and never creates a second row.
    const existing = await prisma.asset.findFirst({
      where: { id: args.id, userId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) throw new Error("Asset not found for this user");
    return prisma.asset.update({
      where: { id: args.id },
      data: {
        type: args.type as AssetType,
        institution: args.label,
        transferPath,
        ...(args.detail !== undefined ? { identifier: args.detail } : {}),
        ...(args.estimated_value !== undefined
          ? { estimatedValue: args.estimated_value }
          : {}),
      },
    });
  }

  const created = await prisma.asset.create({
    data: {
      userId,
      type: args.type as AssetType,
      // Generic Asset fields, same convention as add_financial_account:
      // institution = the human label the pane shows, identifier = free detail.
      institution: args.label,
      identifier: args.detail ?? null,
      estimatedValue: args.estimated_value ?? null,
      transferPath,
      stateCode,
    },
  });

  return created;
}
