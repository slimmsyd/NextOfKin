import "server-only";

import { z } from "zod";

export const DeferChapterSchema = z.object({
  chapter: z.enum(["real_estate", "accounts"]),
  reason: z.string().max(500).optional(),
});

export type DeferChapterInput = z.infer<typeof DeferChapterSchema>;

export async function applyDeferChapter(
  _userId: string,
  args: DeferChapterInput,
) {
  return { chapter: args.chapter, status: "deferred" as const, reason: args.reason };
}
