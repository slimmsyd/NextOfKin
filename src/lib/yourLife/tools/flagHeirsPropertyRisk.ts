import "server-only";

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

// Heirs property is not its own column. It's a derived state of the asset
// row. This tool nudges the relevant columns (title status + deed recorded)
// so the derived heuristic in lib/yourLife/heuristics.ts returns true.
export const FlagHeirsPropertyRiskSchema = z.object({
  asset_id: z.string().uuid(),
  reason: z
    .enum(["unclear_title", "no_recorded_deed", "undivided_fractional"])
    .optional(),
});

export type FlagHeirsPropertyRiskInput = z.infer<
  typeof FlagHeirsPropertyRiskSchema
>;

export async function applyFlagHeirsPropertyRisk(
  prisma: PrismaClient,
  userId: string,
  args: FlagHeirsPropertyRiskInput,
) {
  const titleStatus =
    args.reason === "no_recorded_deed"
      ? "no_recorded_deed"
      : args.reason === "undivided_fractional"
        ? "undivided_fractional"
        : "unclear";

  const updated = await prisma.asset.update({
    where: {
      id: args.asset_id,
      userId,
    },
    data: {
      titleStatus,
      deedRecorded: false,
    },
  });

  return updated;
}
