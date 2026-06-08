// Single source of truth for the V1 intake journey. The sidebar nav is just a
// readout of this (rule #5: the structured state is the truth, the conversation
// is the interview), and later slices feed the same journey into the agent so it
// knows where it is and what comes next.
//
// V1 phases (CLAUDE.md scope): identity -> assets -> people -> review.
// "Wishes & stories" is V1.5 (it lives in document generation), so it is shown
// dimmed as a teaser of what is coming, never as a working phase.

export type JourneyPhaseId =
  | "about_you"
  | "what_you_own"
  | "who_you_protect"
  | "review"
  | "wishes";

export type JourneyPhase = {
  id: JourneyPhaseId;
  label: string;
  /** Not built in V1; rendered dimmed as a teaser, not a reachable phase. */
  future?: boolean;
};

export const JOURNEY: JourneyPhase[] = [
  { id: "about_you", label: "About you" },
  { id: "what_you_own", label: "What you own" },
  { id: "who_you_protect", label: "Who you protect" },
  { id: "review", label: "Review" },
  { id: "wishes", label: "Wishes & stories", future: true },
];
