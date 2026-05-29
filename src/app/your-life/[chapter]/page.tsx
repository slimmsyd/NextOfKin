import { notFound, redirect } from "next/navigation";

import { ChapterShell } from "@/components/yourLife/ChapterShell";
import { loadChapterState } from "@/lib/yourLife/loadChapterState";
import { prisma } from "@/lib/prisma";
import { CHAPTERS, getChapterBySlug } from "@/lib/yourLife/chapters";
import type {
  AssetView,
  ChatTurnView,
  FamilyView,
  IdentityView,
  SidebarSection,
} from "@/components/yourLife/types";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: slug } = await params;
  const def = getChapterBySlug(slug);
  if (!def) notFound();

  const result = await loadChapterState(def.id);
  if (!result.ok) redirect("/signin");

  const { user, assets, turns } = result.state;
  if (!user) redirect("/signup");

  // First visit — seed the chapter's opening turn and mark it active.
  if (turns.length === 0) {
    await prisma.conversationTurn.create({
      data: {
        userId: user.id,
        chapter: def.id,
        role: "agent",
        text: def.opening,
        bucket: "answer",
      },
    });
    await prisma.chapterProgress.upsert({
      where: { userId_chapter: { userId: user.id, chapter: def.id } },
      create: {
        userId: user.id,
        chapter: def.id,
        status: "active",
        startedAt: new Date(),
      },
      update: {},
    });
  }

  // Reload turns if we just seeded, otherwise use what we loaded.
  const turnRows =
    turns.length === 0
      ? await prisma.conversationTurn.findMany({
          where: { userId: user.id, chapter: def.id },
          orderBy: { createdAt: "asc" },
        })
      : turns;

  const turnViews: ChatTurnView[] = turnRows.map((t) => ({
    id: t.id,
    role: t.role === "agent" ? "agent" : "user",
    text: t.text,
    bucket: t.bucket,
  }));

  const progress = await prisma.chapterProgress.findMany({
    where: { userId: user.id },
    select: { chapter: true, status: true },
  });

  return (
    <ChapterShell
      identity={toIdentity(user)}
      family={toFamily(user.aboutYouDetails)}
      sections={computeSections(progress)}
      initialAssets={assets.map(toAssetView)}
      initialTurns={turnViews}
      chapter={def.id}
    />
  );
}

function computeSections(
  progress: Array<{ chapter: string; status: string }>,
): SidebarSection[] {
  const statusByChapter = new Map(progress.map((p) => [p.chapter, p.status]));
  const allChaptersDone = CHAPTERS.every((c) => {
    const s = statusByChapter.get(c.id);
    return s === "complete" || s === "deferred";
  });
  return [
    { label: "About you", state: "done" },
    { label: "What you have", state: allChaptersDone ? "done" : "active" },
    { label: "Who you protect", state: "locked" },
    { label: "Wishes & stories", state: "locked" },
  ];
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
};

function toIdentity(user: UserSummary): IdentityView {
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
