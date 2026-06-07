// Capture-intelligence helpers for conversation turns. Pure + plain (no
// server-only, no DB, no imports) so the chat route, the harvest/insights scripts,
// and vitest all share ONE definition of "what a turn captured" and the desync
// signal. See the onboarding flywheel plan.

export type ProbeMeta = { kind: string; topic: string } | null;

export type ExtractionMeta = {
  emitted: string[]; // tool names the model emitted this turn
  applied: string[]; // emitted tools that validated + persisted
  failed: string[]; // emitted tools that errored on apply
};

export type AgentTurnMeta = {
  probe: ProbeMeta;
  extraction: ExtractionMeta;
  chipsShown: string[]; // recommended-question topics surfaced this turn
};

const MIN_SUBSTANTIVE_LEN = 12;
const QUESTION_OPENERS =
  /^(what|how|why|when|who|where|which|can|could|would|do|does|did|is|are|should)\b/i;

// True when the person said something substantive but the agent captured nothing:
// the runtime canary for the capture desync (conversation advances, profile does
// not). A short acknowledgement or a pure question is expected to capture nothing,
// so those are NOT desyncs.
export function isDesync(userText: string, emittedToolNames: string[]): boolean {
  if (emittedToolNames.length > 0) return false;
  const t = userText.trim();
  if (t.length < MIN_SUBSTANTIVE_LEN) return false;
  if (QUESTION_OPENERS.test(t) && t.endsWith("?")) return false;
  return true;
}

export function buildAgentTurnMeta(input: {
  probe?: { kind: string; topic: string } | null;
  emitted: string[];
  applied: string[];
  failed: string[];
  chipsShown: string[];
}): AgentTurnMeta {
  return {
    probe: input.probe
      ? { kind: input.probe.kind, topic: input.probe.topic }
      : null,
    extraction: {
      emitted: input.emitted,
      applied: input.applied,
      failed: input.failed,
    },
    chipsShown: input.chipsShown,
  };
}
