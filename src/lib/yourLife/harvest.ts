import { isDesync } from "./turnMeta";

// Pure helpers that turn a captured turn into an eval-case stub, in the exact
// schema evals/run.py consumes. No DB, no server-only imports, so both the
// harvest script (tsx) and vitest can use them. The script supplies the data.

export type HarvestProfile = {
  user: {
    legalName: string | null;
    stateCode: string | null;
    maritalStatus: string | null;
  } | null;
  assets: Array<{
    id: string;
    label: string | null;
    location: string | null;
    acquisitionSource?: string | null;
    titleStatus?: string | null;
    deedRecorded?: boolean | null;
  }>;
};

export type AppliedToolCall = { name: string; args?: Record<string, unknown> };

export type TurnPair = {
  chapter: string;
  userText: string;
  userTurnId: string;
  history: Array<{ role: "user" | "agent"; text: string }>;
  profile: HarvestProfile;
  applied: AppliedToolCall[]; // tools applied on the following agent turn
  desyncFlag?: boolean | null; // persisted desync signal, if present
};

export type EvalCase = {
  id: string;
  mode: string;
  chapter: string;
  profile: HarvestProfile;
  history: Array<{ role: "user" | "agent"; text: string }>;
  user: string;
  expect: Record<string, unknown>;
  source_turn_id: string; // provenance: the turn this case was harvested from
};

export type CaseKind = "desync" | "capture" | "skip";

// Decide what kind of eval case (if any) a turn yields.
export function classifyTurn(pair: TurnPair): CaseKind {
  if (pair.applied.length > 0) return "capture";
  const desync =
    pair.desyncFlag ??
    isDesync(
      pair.userText,
      pair.applied.map((t) => t.name),
    );
  return desync ? "desync" : "skip";
}

export function buildEvalCase(
  pair: TurnPair,
  kind: Exclude<CaseKind, "skip">,
): EvalCase {
  const base = {
    id: `harvested-${pair.userTurnId.slice(0, 8)}`,
    chapter: pair.chapter,
    profile: pair.profile,
    history: pair.history,
    user: pair.userText,
    source_turn_id: pair.userTurnId,
  };

  if (kind === "desync") {
    // The agent captured nothing on substantive input. `expect` is BLANK for a
    // human to fill in what SHOULD have been captured before promotion.
    return { ...base, mode: "under_extraction", expect: {} };
  }

  // A successful capture becomes a ready-to-use regression case: assert the first
  // applied tool fired with the same fields present (id excluded — it's an update key).
  const primary = pair.applied[0];
  const argsPresent = primary.args
    ? Object.keys(primary.args).filter((k) => k !== "id")
    : [];
  return {
    ...base,
    mode: "capture",
    expect: { tool: primary.name, args_present: argsPresent },
  };
}
