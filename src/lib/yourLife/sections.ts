import { CHAPTERS } from "@/lib/yourLife/chapters";
import type { SidebarSection } from "@/components/yourLife/types";

// Pure, client-safe derivation of the four intake phase sections from chapter
// progress + whether any people are on record. Used both server-side (initial
// render) and client-side (live, as confirm/defer/person stream in), so the
// sidebar and right pane stay in sync with the conversation without a reload.
//
// Phases: About you (identity, done by this point) -> What you have (the chapter
// loop) -> Who you protect (beneficiaries, Phase 4) -> Wishes (later).

type ProgressMap = Record<string, string>;

function chapterLoopDone(progress: ProgressMap): boolean {
  return CHAPTERS.every((c) => {
    const s = progress[c.id];
    return s === "complete" || s === "deferred";
  });
}

export function deriveSections(
  progress: ProgressMap,
  opts: { hasPeople: boolean },
): SidebarSection[] {
  const loopDone = chapterLoopDone(progress);
  // "Who you protect" is no longer locked once people exist (the pane reflects
  // real data, rule #5) OR once the chapter loop is finished (we've arrived).
  const whoYouProtect: SidebarSection["state"] =
    opts.hasPeople || loopDone ? "active" : "locked";
  return [
    { label: "About you", state: "done" },
    { label: "What you have", state: loopDone ? "done" : "active" },
    { label: "Who you protect", state: whoYouProtect },
    { label: "Wishes & stories", state: "locked" },
  ];
}
