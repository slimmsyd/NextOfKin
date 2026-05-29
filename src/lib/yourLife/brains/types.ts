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
 * the agent's next turn. Async so a real model call (DeepSeek) drops in behind
 * the same signature; deterministic scripts just resolve immediately.
 */
export type ChapterBrain = (
  state: ChapterState,
  lastUserMessage: string,
) => Promise<ScriptedTurn>;
