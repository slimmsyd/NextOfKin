import "server-only";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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
  beneficiaries: Array<{
    id: string;
    fullName: string | null;
    relationship: string | null;
    type: string;
    /** Asset this person is designated to receive (first designation), if any. */
    receivesAssetId: string | null;
    receivesAssetLabel: string | null;
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
      state: {
        authUserId: data.user.id,
        user: null,
        assets: [],
        turns: [],
        beneficiaries: [],
      },
    };
  }

  // Load ALL of the user's assets, not just this chapter's type. The agent can
  // capture any asset in any chapter (a 401k mentioned during real estate, a
  // car, etc. -> add_financial_account / add_other_asset), so the record the
  // model sees MUST include them all. Otherwise cross-type assets are invisible
  // to entity resolution and get re-created every turn (the duplicate-rows bug),
  // and the right pane wouldn't show them either. Chapter-specific logic (the
  // real-estate probe) filters by type itself; see interviewFlow.ts.
  const assetRows = await prisma.asset.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });

  const turnRows = await prisma.conversationTurn.findMany({
    where: { userId: user.id, chapter },
    orderBy: { createdAt: "asc" },
    take: TURNS_LIMIT,
  });

  // Beneficiaries are user-level (not chapter-scoped); "Who you protect" spans
  // the whole profile. Include the asset each is designated to receive.
  const beneficiaryRows = await prisma.beneficiary.findMany({
    where: { userId: user.id, deletedAt: null },
    include: { assetDesignations: { include: { asset: true } } },
    orderBy: { createdAt: "asc" },
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
      beneficiaries: beneficiaryRows.map((b) => {
        const link = b.assetDesignations[0];
        return {
          id: b.id,
          fullName: b.fullName,
          relationship: b.relationship,
          type: b.type,
          receivesAssetId: link?.assetId ?? null,
          receivesAssetLabel: link?.asset?.institution ?? null,
          createdAt: b.createdAt,
        };
      }),
    },
  };
}
