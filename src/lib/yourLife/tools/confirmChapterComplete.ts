import "server-only";

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const ConfirmChapterCompleteSchema = z.object({
  chapter: z.enum(["real_estate", "financial_accounts"]),
});

export type ConfirmChapterCompleteInput = z.infer<
  typeof ConfirmChapterCompleteSchema
>;

// Persists chapter completion so the sidebar reflects it and the entry route
// can resume to the next incomplete chapter.
export async function applyConfirmChapterComplete(
  prisma: PrismaClient,
  userId: string,
  args: ConfirmChapterCompleteInput,
) {
  const now = new Date();
  await prisma.chapterProgress.upsert({
    where: { userId_chapter: { userId, chapter: args.chapter } },
    create: {
      userId,
      chapter: args.chapter,
      status: "complete",
      startedAt: now,
      completedAt: now,
    },
    update: { status: "complete", completedAt: now },
  });
  return { chapter: args.chapter, status: "complete" as const };
}
