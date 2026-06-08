import "server-only";

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

// Captures a person (a Beneficiary of type "person") and optionally links them
// to an asset they are designated to receive. Entity resolution mirrors
// upsert_asset: pass `id` to UPDATE an existing person, omit it to add one.
export const AddPersonSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(1).max(200),
  relationship: z.string().min(1).max(100).optional(),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "yyyy-mm-dd")
    .nullable()
    .optional(),
  /** Asset this person should receive (designate as primary beneficiary). */
  asset_id: z.string().uuid().optional(),
  /**
   * When the asset they should receive is being captured THIS SAME turn (so it
   * has no id on the record yet), the asset's label. The route resolves it to
   * the freshly-created asset_id after the asset tools run. See resolveLinks.ts.
   */
  receives_new_asset_label: z.string().min(1).max(160).optional(),
});

export type AddPersonInput = z.infer<typeof AddPersonSchema>;

export async function applyAddPerson(
  prisma: PrismaClient,
  userId: string,
  stateCode: string,
  args: AddPersonInput,
) {
  let person;
  if (args.id) {
    // Update — owner-scoped so a stray id can't touch another user's row.
    const existing = await prisma.beneficiary.findFirst({
      where: { id: args.id, userId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) throw new Error("Person not found for this user");
    person = await prisma.beneficiary.update({
      where: { id: args.id },
      data: {
        fullName: args.full_name,
        ...(args.relationship !== undefined
          ? { relationship: args.relationship }
          : {}),
        ...(args.date_of_birth !== undefined
          ? {
              dateOfBirth: args.date_of_birth
                ? new Date(args.date_of_birth)
                : null,
            }
          : {}),
      },
    });
  } else {
    person = await prisma.beneficiary.create({
      data: {
        userId,
        type: "person",
        fullName: args.full_name,
        relationship: args.relationship ?? null,
        dateOfBirth: args.date_of_birth ? new Date(args.date_of_birth) : null,
        stateCode,
      },
    });
  }

  // Optionally link to an asset as the primary beneficiary. Upsert on the
  // composite key so re-stating the recipient is idempotent (no unique crash).
  let linkedAssetId: string | null = null;
  if (args.asset_id) {
    const asset = await prisma.asset.findFirst({
      where: { id: args.asset_id, userId, deletedAt: null },
      select: { id: true },
    });
    if (asset) {
      const now = new Date();
      await prisma.assetBeneficiary.upsert({
        where: {
          assetId_beneficiaryId: {
            assetId: asset.id,
            beneficiaryId: person.id,
          },
        },
        create: {
          assetId: asset.id,
          beneficiaryId: person.id,
          sharePercentage: 100,
          designation: "primary",
          source: "user_declared",
          capturedAt: now,
        },
        update: {},
      });
      linkedAssetId = asset.id;
    }
  }

  return { ...person, linkedAssetId };
}
