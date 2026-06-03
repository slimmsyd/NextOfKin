import "server-only";

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

// UI-internal tool. Inline edits on the right pane flow through this so the
// agent's tool calls and the user's edits compete through the same gate.
export const UpdateAssetFieldSchema = z.object({
  asset_id: z.string().uuid(),
  field: z.enum([
    "label",
    "location",
    "acquisition_source",
    "title_status",
    "deed_recorded",
    "estimated_value",
  ]),
  value: z.union([z.string(), z.number(), z.boolean()]).nullable(),
});

export type UpdateAssetFieldInput = z.infer<typeof UpdateAssetFieldSchema>;

const FIELD_TO_COLUMN: Record<UpdateAssetFieldInput["field"], string> = {
  label: "institution",
  location: "identifier",
  acquisition_source: "acquisitionSource",
  title_status: "titleStatus",
  deed_recorded: "deedRecorded",
  estimated_value: "estimatedValue",
};

export async function applyUpdateAssetField(
  prisma: PrismaClient,
  userId: string,
  args: UpdateAssetFieldInput,
) {
  const column = FIELD_TO_COLUMN[args.field];
  const data: Record<string, unknown> = { [column]: args.value };

  const updated = await prisma.asset.update({
    where: { id: args.asset_id, userId },
    data,
  });

  return updated;
}
