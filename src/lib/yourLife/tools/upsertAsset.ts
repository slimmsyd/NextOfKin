import "server-only";

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

// Idempotent asset write: with `id` it UPDATES (only the provided fields);
// without `id` it CREATES. This is the entity-resolution primitive — the model
// references existing assets by the IDs we serialize into context, so "my house"
// mentioned twice updates one row instead of creating two. V1 covers real estate.
export const UpsertAssetSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(120),
  location: z.string().min(1).max(200).optional(),
  acquisition_source: z
    .enum(["inherited", "purchased", "gifted", "unknown"])
    .optional(),
  title_status: z
    .enum([
      "sole",
      "jtwros",
      "tenancy_in_common",
      "undivided_fractional",
      "no_recorded_deed",
      "unclear",
    ])
    .optional(),
  deed_recorded: z.boolean().optional(),
  estimated_value: z.number().nullable().optional(),
});

export type UpsertAssetInput = z.infer<typeof UpsertAssetSchema>;

export async function applyUpsertAsset(
  prisma: PrismaClient,
  userId: string,
  stateCode: string,
  args: UpsertAssetInput,
) {
  const transferPath =
    args.acquisition_source === "inherited"
      ? "probate"
      : "non_probate_designation";

  if (args.id) {
    // Update — scope to the owner so a stray id can't touch another user's row.
    const existing = await prisma.asset.findFirst({
      where: { id: args.id, userId, deletedAt: null },
      select: { id: true },
    });
    if (!existing) {
      throw new Error("Asset not found for this user");
    }
    return prisma.asset.update({
      where: { id: args.id },
      data: {
        ...(args.label !== undefined ? { institution: args.label } : {}),
        ...(args.location !== undefined ? { identifier: args.location } : {}),
        ...(args.estimated_value !== undefined
          ? { estimatedValue: args.estimated_value }
          : {}),
        ...(args.acquisition_source !== undefined
          ? { acquisitionSource: args.acquisition_source, transferPath }
          : {}),
        ...(args.title_status !== undefined
          ? { titleStatus: args.title_status }
          : {}),
        ...(args.deed_recorded !== undefined
          ? { deedRecorded: args.deed_recorded }
          : {}),
      },
    });
  }

  return prisma.asset.create({
    data: {
      userId,
      type: "real_estate",
      institution: args.label,
      identifier: args.location ?? null,
      estimatedValue: args.estimated_value ?? null,
      transferPath,
      acquisitionSource: args.acquisition_source ?? null,
      titleStatus: args.title_status ?? null,
      deedRecorded: args.deed_recorded ?? null,
      stateCode,
    },
  });
}
