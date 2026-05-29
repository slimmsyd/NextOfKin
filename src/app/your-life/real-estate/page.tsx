import { redirect } from "next/navigation";

import { ChapterShell } from "@/components/yourLife/ChapterShell";
import { loadChapterState } from "@/lib/yourLife/loadChapterState";
import { prisma } from "@/lib/prisma";
import { REAL_ESTATE_OPENING } from "@/lib/yourLife/scripts/realEstateScript";
import type {
  AssetView,
  ChatTurnView,
  FamilyView,
  IdentityView,
} from "@/components/yourLife/types";

const CHAPTER = "real_estate";

export default async function Page() {
  const result = await loadChapterState(CHAPTER);
  if (!result.ok) redirect("/signin");

  const { user, assets, turns } = result.state;

  // First visit to this chapter — seed the opening agent turn.
  if (user && turns.length === 0) {
    await prisma.conversationTurn.create({
      data: {
        userId: user.id,
        chapter: CHAPTER,
        role: "agent",
        text: REAL_ESTATE_OPENING,
        bucket: "answer",
      },
    });
  }

  const turnRows =
    user && turns.length === 0
      ? await prisma.conversationTurn.findMany({
          where: { userId: user.id, chapter: CHAPTER },
          orderBy: { createdAt: "asc" },
        })
      : turns;

  const turnViews: ChatTurnView[] = turnRows.map((t) => ({
    id: t.id,
    role: t.role === "agent" ? "agent" : "user",
    text: t.text,
    bucket: t.bucket,
  }));

  return (
    <ChapterShell
      identity={toIdentity(user)}
      family={toFamily(user?.aboutYouDetails)}
      initialAssets={assets.map(toAssetView)}
      initialTurns={turnViews}
      chapter={CHAPTER}
    />
  );
}

type UserSummary = {
  id: string;
  firstName: string;
  lastName: string;
  stateCode: string;
  dateOfBirth: Date | null;
  legalName: string | null;
  maritalStatus: string | null;
  aboutYouDetails: unknown;
} | null;

function toIdentity(user: UserSummary): IdentityView {
  if (!user) return null;
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    stateCode: user.stateCode,
    legalName: user.legalName,
    dob: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
    maritalStatus: user.maritalStatus,
  };
}

function toFamily(details: unknown): FamilyView {
  if (!details || typeof details !== "object") return null;
  const d = details as {
    spouse?: { legalName?: string } | null;
    dependents?: Array<{ name?: string }>;
    household?: string;
  };
  const spouseName = d.spouse?.legalName?.trim() || null;
  const dependentNames = (d.dependents ?? [])
    .map((x) => x.name?.trim())
    .filter((n): n is string => Boolean(n));
  const household = d.household?.trim() || null;
  if (!spouseName && dependentNames.length === 0 && !household) return null;
  return { spouseName, dependentNames, household };
}

function toAssetView(a: {
  id: string;
  type: string;
  label: string | null;
  location: string | null;
  estimatedValue: string | null;
  acquisitionSource: string | null;
  titleStatus: string | null;
  deedRecorded: boolean | null;
  createdAt: Date;
}): AssetView {
  return {
    id: a.id,
    type: a.type,
    label: a.label,
    location: a.location,
    estimatedValue: a.estimatedValue,
    acquisitionSource: a.acquisitionSource,
    titleStatus: a.titleStatus,
    deedRecorded: a.deedRecorded,
    createdAt: a.createdAt.toISOString(),
  };
}
