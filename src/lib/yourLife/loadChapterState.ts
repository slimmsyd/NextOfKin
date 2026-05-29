import "server-only";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getChapter } from "@/lib/yourLife/chapters";

export type ChapterState = {
  authUserId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    stateCode: string;
    dateOfBirth: Date | null;
    legalName: string | null;
    maritalStatus: string | null;
    aboutYouDetails: unknown;
  } | null;
  assets: Array<{
    id: string;
    type: string;
    label: string | null;
    location: string | null;
    estimatedValue: string | null;
    acquisitionSource: string | null;
    titleStatus: string | null;
    deedRecorded: boolean | null;
    createdAt: Date;
  }>;
  turns: Array<{
    id: string;
    role: string;
    text: string;
    toolCalls: unknown;
    bucket: string | null;
    createdAt: Date;
  }>;
};

const TURNS_LIMIT = 40;

export async function loadChapterState(chapter: string): Promise<
  | { ok: true; state: ChapterState }
  | { ok: false; reason: "no_session" }
> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, reason: "no_session" };

  const user = await prisma.user.findUnique({
    where: { authUserId: data.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      stateCode: true,
      dateOfBirth: true,
      legalName: true,
      maritalStatus: true,
      aboutYouDetails: true,
    },
  });

  if (!user) {
    return {
      ok: true,
      state: { authUserId: data.user.id, user: null, assets: [], turns: [] },
    };
  }

  // Which asset types belong to this chapter comes from the registry, so a new
  // chapter loads the right assets without touching this query.
  const assetTypes = getChapter(chapter)?.assetTypes ?? [];
  const assetRows = await prisma.asset.findMany({
    where: { userId: user.id, type: { in: assetTypes }, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  const turnRows = await prisma.conversationTurn.findMany({
    where: { userId: user.id, chapter },
    orderBy: { createdAt: "asc" },
    take: TURNS_LIMIT,
  });

  return {
    ok: true,
    state: {
      authUserId: data.user.id,
      user,
      assets: assetRows.map((a) => ({
        id: a.id,
        type: a.type,
        label: a.institution,
        location: a.identifier,
        estimatedValue: a.estimatedValue ? a.estimatedValue.toString() : null,
        acquisitionSource: a.acquisitionSource,
        titleStatus: a.titleStatus,
        deedRecorded: a.deedRecorded,
        createdAt: a.createdAt,
      })),
      turns: turnRows.map((t) => ({
        id: t.id,
        role: t.role,
        text: t.text,
        toolCalls: t.toolCalls,
        bucket: t.bucket,
        createdAt: t.createdAt,
      })),
    },
  };
}
