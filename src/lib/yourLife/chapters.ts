import type { AssetType } from "@prisma/client";

// Single source of truth for the Phase 3 chapter loop ("What you have").
// CLAUDE.md scopes V1 to exactly two chapters. Adding a chapter later = add an
// entry here (+ a brain in brains/index.ts). The route, sidebar, asset loader,
// and entry redirect all read from this registry rather than hard-coding ids.

export type ChapterId = "real_estate" | "financial_accounts";

export type ChapterDef = {
  id: ChapterId;
  /** URL segment under /your-life/. */
  slug: string;
  /** Short label for sidebar / progress. */
  label: string;
  /** Display order in the chapter loop. */
  order: number;
  /** Asset.type values that belong to this chapter (drives loadChapterState). */
  assetTypes: AssetType[];
  /** First agent turn, seeded on first visit. */
  opening: string;
};

export const CHAPTERS: ChapterDef[] = [
  {
    id: "real_estate",
    slug: "real-estate",
    label: "Real estate",
    order: 1,
    assetTypes: ["real_estate"],
    opening:
      "Let's talk about where you live and any property in your family. Do you own your home?",
  },
  {
    id: "financial_accounts",
    slug: "financial",
    label: "Financial accounts",
    order: 2,
    assetTypes: [
      "account_401k",
      "account_ira",
      "account_brokerage",
      "account_checking",
      "account_savings",
    ],
    opening:
      "Now let's get a picture of your accounts. Where do you bank, and do you have any retirement or investment accounts?",
  },
];

const BY_ID = new Map<string, ChapterDef>(CHAPTERS.map((c) => [c.id, c]));
const BY_SLUG = new Map<string, ChapterDef>(CHAPTERS.map((c) => [c.slug, c]));

export function getChapter(id: string): ChapterDef | undefined {
  return BY_ID.get(id);
}

export function getChapterBySlug(slug: string): ChapterDef | undefined {
  return BY_SLUG.get(slug);
}

type ProgressRow = { chapter: string; status: string };

/**
 * The chapter to drop a returning user into: the first (by order) that isn't
 * complete or deferred. Falls back to the first chapter if all are resolved.
 */
export function firstIncompleteChapter(progress: ProgressRow[]): ChapterDef {
  const statusByChapter = new Map(progress.map((p) => [p.chapter, p.status]));
  const next = [...CHAPTERS]
    .sort((a, b) => a.order - b.order)
    .find((c) => {
      const s = statusByChapter.get(c.id);
      return s !== "complete" && s !== "deferred";
    });
  return next ?? CHAPTERS[0];
}
