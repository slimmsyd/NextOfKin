import { CHAPTERS } from "@/lib/yourLife/chapters";
import { JOURNEY, type JourneyPhaseId } from "@/lib/yourLife/journey";
import type {
  SidebarSection,
  SidebarSectionState,
} from "@/components/yourLife/types";

// Pure, client-safe derivation of the intake sidebar from chapter progress +
// whether any people are on record. Used both server-side (initial render) and
// client-side (live, as confirm/defer/person stream in), so the sidebar and the
// right pane stay in sync with the conversation without a reload.
//
// The phase list itself lives in journey.ts (the single source of truth); this
// only computes each phase's state from the deterministic record.

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
  // "What you own" is done once the asset loop is finished. People become
  // reachable when the loop is done OR a beneficiary already exists (the pane
  // reflects real data, rule #5).
  const assetsDone = chapterLoopDone(progress);
  const peopleReachable = assetsDone || opts.hasPeople;

  const stateById: Record<JourneyPhaseId, SidebarSectionState> = {
    about_you: "done",
    what_you_own: assetsDone ? "done" : "active",
    who_you_protect: peopleReachable ? "active" : "locked",
    // Review unlocks once the people phase completes (a later slice tracks that
    // signal); locked for now so the nav never lies about being reachable.
    review: "locked",
    // V1.5 teaser, dimmed and not part of the V1 path.
    wishes: "future",
  };

  return JOURNEY.map((p) => ({ label: p.label, state: stateById[p.id] }));
}
