import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { makeScriptPrisma } from "./_prisma";

// Read-only analytics over real onboarding turns: intent distribution, desync
// rate per chapter (the capture-failure canary), input method split, recommended-
// question tap-through, and samples of what we failed to capture. Output is real
// user data, so it lands in evals/review/ (gitignored).

async function main() {
  const prisma = makeScriptPrisma();
  try {
    const turns = await prisma.conversationTurn.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        chapter: true,
        role: true,
        text: true,
        bucket: true,
        desync: true,
        inputMethod: true,
        meta: true,
      },
    });

    const userTurns = turns.filter((t) => t.role === "user");
    const agentTurns = turns.filter((t) => t.role === "agent");

    const bucketCounts = new Map<string, number>();
    for (const t of agentTurns) {
      const b = t.bucket ?? "untagged";
      bucketCounts.set(b, (bucketCounts.get(b) ?? 0) + 1);
    }

    const perChapter = new Map<string, { agent: number; desync: number }>();
    for (const t of agentTurns) {
      const c = perChapter.get(t.chapter) ?? { agent: 0, desync: 0 };
      c.agent += 1;
      if (t.desync) c.desync += 1;
      perChapter.set(t.chapter, c);
    }

    let voice = 0;
    let text = 0;
    let chipTaps = 0;
    for (const t of userTurns) {
      if (t.inputMethod === "voice") voice += 1;
      else text += 1;
      const meta = t.meta as { chipSource?: string } | null;
      if (meta?.chipSource) chipTaps += 1;
    }
    const chipsShownTurns = agentTurns.filter((t) => {
      const m = t.meta as { chipsShown?: string[] } | null;
      return (m?.chipsShown?.length ?? 0) > 0;
    }).length;

    // Pair each desync agent turn with the preceding user text (the miss).
    const desyncSamples: string[] = [];
    for (let i = 1; i < turns.length; i++) {
      if (turns[i].role === "agent" && turns[i].desync && turns[i - 1].role === "user") {
        desyncSamples.push(turns[i - 1].text);
      }
    }

    const lines: string[] = ["# Onboarding insights", ""];
    lines.push(
      `Turns: ${turns.length} (${userTurns.length} user, ${agentTurns.length} agent)`,
      "",
      "## Intent distribution (agent buckets)",
    );
    for (const [b, n] of [...bucketCounts].sort((x, y) => y[1] - x[1])) {
      lines.push(`- ${b}: ${n}`);
    }
    lines.push("", "## Desync rate per chapter (substantive input, zero capture)");
    for (const [c, v] of perChapter) {
      const pct = v.agent ? ((v.desync / v.agent) * 100).toFixed(1) : "0.0";
      lines.push(`- ${c}: ${v.desync}/${v.agent} (${pct}%)`);
    }
    lines.push("", "## Input + recommended questions");
    lines.push(`- voice: ${voice}, text: ${text}`);
    lines.push(`- chip taps: ${chipTaps} (of ${chipsShownTurns} turns that showed chips)`);
    lines.push("", "## Desync samples (what we failed to capture)");
    for (const s of desyncSamples.slice(0, 15)) {
      lines.push(`- ${JSON.stringify(s.slice(0, 120))}`);
    }

    const outDir = resolve(process.cwd(), "evals", "review");
    mkdirSync(outDir, { recursive: true });
    const out = resolve(outDir, "insights.md");
    writeFileSync(out, lines.join("\n") + "\n");
    console.log(lines.join("\n"));
    console.log(`\nWrote ${out}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
