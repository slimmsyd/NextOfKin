import "server-only";

import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const DeferChapterSchema = z.object({
  chapter: z.enum(["real_estate", "financial_accounts"]),
  reason: z.string().max(500).optional(),
});

export type DeferChapterInput = z.infer<typeof DeferChapterSchema>;

export async function applyDeferChapter(
  prisma: PrismaClient,
  userId: string,
  args: DeferChapterInput,
) {
  const now = new Date();
  await prisma.chapterProgress.upsert({
    where: { userId_chapter: { userId, chapter: args.chapter } },
    create: {
      userId,
      chapter: args.chapter,
      status: "deferred",
      startedAt: now,
      deferReason: args.reason ?? null,
    },
    update: { status: "deferred", deferReason: args.reason ?? null },
  });
  return {
    chapter: args.chapter,
    status: "deferred" as const,
    reason: args.reason,
  };
}
