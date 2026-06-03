import "server-only";

import type { ChapterState } from "@/lib/yourLife/loadChapterState";
import type { Probe } from "@/lib/yourLife/interviewFlow";

export type TurnBucket =
  | "answer"
  | "clarify"
  | "legal_advice"
  | "financial_advice"
  | "distress"
  | "off_topic"
  | "jailbreak";

export type ScriptedTurn = {
  text: string;
  toolCalls: Array<{ name: string; args: Record<string, unknown> }>;
  bucket: TurnBucket;
  /**
   * The most useful next topic to learn, computed before the reply call and used
   * to (a) steer Ava's question and (b) seed the "Recommended next questions"
   * chips. See interviewFlow.ts. Optional so older/edge turns can omit it.
   */
  nextProbe?: Probe;
};

export type BrainContext = {
  /** How the user's latest message arrived. Drives voice read-back of binding fields. */
  inputMethod?: "voice" | "text";
};

/**
 * A chapter "brain" maps the current chapter state + the user's last message to
 * the agent's next turn. Async so a real model call (DeepSeek) drops in behind
 * the same signature; deterministic scripts just resolve immediately.
 */
export type ChapterBrain = (
  state: ChapterState,
  lastUserMessage: string,
  ctx?: BrainContext,
) => Promise<ScriptedTurn>;
