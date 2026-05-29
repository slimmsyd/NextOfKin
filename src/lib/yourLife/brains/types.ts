import "server-only";

import type { ChapterState } from "@/lib/yourLife/loadChapterState";

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
};

/**
 * A chapter "brain" maps the current chapter state + the user's last message to
 * the agent's next turn. Deterministic scripts implement this today; a real
 * Claude streaming implementation can drop in later behind the same signature
 * with zero route/client changes.
 */
export type ChapterBrain = (
  state: ChapterState,
  lastUserMessage: string,
) => ScriptedTurn;
