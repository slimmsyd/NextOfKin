import "server-only";

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const AddRealEstateSchema = z.object({
  label: z.string().min(1).max(120),
  location: z.string().min(1).max(200),
  acquisition_source: z.enum(["inherited", "purchased", "gifted", "unknown"]),
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
  size_acres: z.number().nullable().optional(),
  inherited_from: z.string().nullable().optional(),
  inherited_year: z.number().int().nullable().optional(),
  mortgage_status: z
    .enum(["paid_off", "active", "unknown"])
    .nullable()
    .optional(),
});

export type AddRealEstateInput = z.infer<typeof AddRealEstateSchema>;

export async function applyAddRealEstate(
  prisma: PrismaClient,
  userId: string,
  stateCode: string,
  args: AddRealEstateInput,
) {
  const transferPath =
    args.acquisition_source === "inherited" ? "probate" : "non_probate_designation";

  const created = await prisma.asset.create({
    data: {
      userId,
      type: "real_estate",
      institution: args.label,
      identifier: args.location,
      estimatedValue: args.estimated_value ?? null,
      transferPath,
      acquisitionSource: args.acquisition_source,
      titleStatus: args.title_status ?? null,
      deedRecorded: args.deed_recorded ?? null,
      stateCode,
    },
  });

  return created;
}
