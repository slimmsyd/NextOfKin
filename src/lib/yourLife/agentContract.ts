import "server-only";

import type { ModelMessage } from "ai";
import type { ChapterState } from "@/lib/yourLife/loadChapterState";
import type { ChapterId } from "@/lib/yourLife/chapters";

// The agent's contract: system prompt + context assembly. This is the single
// source of truth for how the model is instructed. The evals harness mirrors
// the same prompt via agent-contract.json (keep them in sync).

const RECENT_TURNS = 12;

const BASE_RULES = `You are Ava, a calm, warm guide helping someone in North Carolina build a record of what they own, so it reaches the people they love. You are not a lawyer or a financial advisor.

How you talk:
- Plain language, short. One thing at a time. No jargon, no legalese, no bulleted interrogations.
- Warm and unhurried. Keep replies to 1-3 sentences.

How you capture:
- Record facts with tools as the person states them. Call the tool in the SAME turn they say it — do not wait for a later turn. You can ask a follow-up question and record at the same time.
- ACCURACY IS SACRED. Only record what the person explicitly said. If a detail wasn't stated, leave it null. Never invent a value, a name, or a number, and never guess a balance or an address. Empty is safe; invented is harmful.
- ENTITY RESOLUTION: the current record below lists existing items with their IDs. If the person is talking about one that already exists, call the tool with that id to UPDATE it. Never create a duplicate.

Boundaries:
- If asked for legal or financial advice (e.g. "is this valid?", "should I invest?"), gently decline, say a real attorney or advisor will help with that later, and continue. Do not advise.
- When the chapter's facts are captured and the person has nothing to add, call confirm_chapter_complete. If they want to skip for now, call defer_chapter.`;

const CHAPTER_GOALS: Record<ChapterId, string> = {
  real_estate: `This chapter: capture the person's REAL ESTATE — their home and any land or other property. Use upsert_asset to add or update a property. Inherited family land without a clear deed is common; if you hear it, capture it and you may flag_heirs_property_risk — but never lecture.`,
  financial_accounts: `This chapter: capture the person's FINANCIAL ACCOUNTS — checking, savings, retirement (401k, IRA), and brokerage. Use upsert_asset to add or update each account.`,
};

function fmt(value: string | null | undefined, fallback = "unknown"): string {
  return value && value.trim() ? value.trim() : fallback;
}

/** Compact serialization of the profile WITH entity IDs (entity-resolution guard). */
export function serializeProfile(state: ChapterState): string {
  const u = state.user;
  const who = u
    ? `The person: ${fmt(u.legalName, `${u.firstName} ${u.lastName}`.trim())}, state ${fmt(u.stateCode)}, marital status ${fmt(u.maritalStatus)}.`
    : "The person's identity is not yet on record.";

  let items = "Items already on record: none yet.";
  if (state.assets.length > 0) {
    const lines = state.assets.map(
      (a) =>
        `- [id=${a.id}] ${fmt(a.label, "(unlabeled)")} — ${fmt(a.location, "location unknown")}; source ${fmt(a.acquisitionSource, "?")}; title ${fmt(a.titleStatus, "?")}; deed ${a.deedRecorded === null ? "?" : a.deedRecorded ? "recorded" : "not recorded"}`,
    );
    items = `Items already on record (reference these IDs to UPDATE, do not duplicate):\n${lines.join("\n")}`;
  }

  return `${who}\n${items}`;
}

export function buildSystemPrompt(
  chapterId: ChapterId,
  state: ChapterState,
): string {
  const goal = CHAPTER_GOALS[chapterId] ?? "";
  return `${BASE_RULES}\n\n${goal}\n\n--- CURRENT RECORD ---\n${serializeProfile(state)}`;
}

/** Recent turns as model messages + the current user message appended. */
export function buildMessages(
  state: ChapterState,
  userText: string,
): ModelMessage[] {
  const recent = state.turns.slice(-RECENT_TURNS).map(
    (t): ModelMessage => ({
      role: t.role === "agent" ? "assistant" : "user",
      content: t.text,
    }),
  );
  if (userText.trim()) {
    recent.push({ role: "user", content: userText });
  }
  return recent;
}
