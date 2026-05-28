import "server-only";

import { z } from "zod";

export const ConfirmChapterCompleteSchema = z.object({
  chapter: z.enum(["real_estate", "accounts"]),
});

export type ConfirmChapterCompleteInput = z.infer<
  typeof ConfirmChapterCompleteSchema
>;

// Navigation only. No DB write today — the front end advances on this.
// Later this may write a row to a `chapter_progress` table.
export async function applyConfirmChapterComplete(
  _userId: string,
  args: ConfirmChapterCompleteInput,
) {
  return { chapter: args.chapter, status: "complete" as const };
}
