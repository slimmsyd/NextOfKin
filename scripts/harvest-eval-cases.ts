import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { makeScriptPrisma } from "./_prisma";
import { getChapter } from "../src/lib/yourLife/chapters";
import {
  classifyTurn,
  buildEvalCase,
  type TurnPair,
  type HarvestProfile,
  type AppliedToolCall,
  type EvalCase,
} from "../src/lib/yourLife/harvest";

// Read-only harvest: mine real onboarding turns into eval-case STUBS in the exact
// schema evals/run.py consumes. Desync turns (substantive input, zero capture)
// become blank-`expect` cases for a human to label; successful captures become
// ready regression cases. Output lands in evals/review/ (gitignored, real data).
// A human reviews, fills `expect`, and promotes good cases into evals/datasets/.

async function main() {
  const prisma = makeScriptPrisma();
  try {
    const turns = await prisma.conversationTurn.findMany({
      orderBy: [{ userId: "asc" }, { chapter: "asc" }, { createdAt: "asc" }],
    });

    // Group consecutive turns by user+chapter so we can read user -> agent pairs
    // and reconstruct the prior history.
    const groups = new Map<string, typeof turns>();
    for (const t of turns) {
      const key = `${t.userId}::${t.chapter}`;
      const arr = groups.get(key) ?? [];
      arr.push(t);
      groups.set(key, arr);
    }

    const casesByChapter = new Map<string, EvalCase[]>();
    const push = (chapter: string, c: EvalCase) => {
      const arr = casesByChapter.get(chapter) ?? [];
      arr.push(c);
      casesByChapter.set(chapter, arr);
    };

    for (const [key, group] of groups) {
      const [userId, chapter] = key.split("::");
      const chapterDef = getChapter(chapter);
      if (!chapterDef) continue;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          legalName: true,
          firstName: true,
          lastName: true,
          stateCode: true,
          maritalStatus: true,
        },
      });

      for (let i = 0; i < group.length - 1; i++) {
        const u = group[i];
        const a = group[i + 1];
        if (u.role !== "user" || a.role !== "agent") continue;

        // Approx profile snapshot: this chapter's assets created at or before the
        // agent turn, not soft-deleted. Field edits aren't versioned (noted).
        const assets = await prisma.asset.findMany({
          where: {
            userId,
            type: { in: chapterDef.assetTypes },
            createdAt: { lte: a.createdAt },
            deletedAt: null,
          },
          select: {
            id: true,
            institution: true,
            identifier: true,
            acquisitionSource: true,
            titleStatus: true,
            deedRecorded: true,
          },
        });

        const profile: HarvestProfile = {
          user: user
            ? {
                legalName:
                  user.legalName ??
                  `${user.firstName} ${user.lastName}`.trim() ??
                  null,
                stateCode: user.stateCode ?? null,
                maritalStatus: user.maritalStatus ?? null,
              }
            : null,
          assets: assets.map((x) => ({
            id: x.id,
            label: x.institution ?? null,
            location: x.identifier ?? null,
            acquisitionSource: x.acquisitionSource ?? null,
            titleStatus: x.titleStatus ?? null,
            deedRecorded: x.deedRecorded ?? null,
          })),
        };

        // The agent turn stores applied results as [{name, data}] (no original
        // args), so capture cases assert the tool fired; a human adds field
        // assertions on review.
        const applied: AppliedToolCall[] = Array.isArray(a.toolCalls)
          ? (a.toolCalls as Array<{ name?: string }>)
              .filter((c) => typeof c?.name === "string")
              .map((c) => ({ name: c.name as string }))
          : [];

        const history = group.slice(0, i).map((t) => ({
          role: t.role as "user" | "agent",
          text: t.text,
        }));

        const pair: TurnPair = {
          chapter,
          userText: u.text,
          userTurnId: u.id,
          history,
          profile,
          applied,
          desyncFlag: a.desync,
        };

        const kind = classifyTurn(pair);
        if (kind === "skip") continue;
        push(chapter, buildEvalCase(pair, kind));
      }
    }

    const outDir = resolve(process.cwd(), "evals", "review");
    mkdirSync(outDir, { recursive: true });
    let total = 0;
    for (const [chapter, cases] of casesByChapter) {
      const file = resolve(outDir, `${chapter}-harvest.jsonl`);
      writeFileSync(file, cases.map((c) => JSON.stringify(c)).join("\n") + "\n");
      const desync = cases.filter((c) => c.mode === "under_extraction").length;
      total += cases.length;
      console.log(`${chapter}: ${cases.length} stubs (${desync} desync) -> ${file}`);
    }
    if (total === 0) console.log("No harvestable turns found.");
    else
      console.log(
        `\nHarvested ${total} stubs. Review evals/review/, fill blank \`expect\`, ` +
          `then promote into evals/datasets/.`,
      );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
