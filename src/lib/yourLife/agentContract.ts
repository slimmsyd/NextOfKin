import "server-only";

import type { ModelMessage } from "ai";
import type { ChapterState } from "@/lib/yourLife/loadChapterState";
import type { ChapterId } from "@/lib/yourLife/chapters";
import type { Probe } from "@/lib/yourLife/interviewFlow";
import { fewshotBlock } from "@/lib/yourLife/fewshot";

// The agent's contract. The turn is SPLIT into two single-job model calls:
//   1) EXTRACTION — emit tool calls for what was stated (no prose).
//   2) REPLY — warm conversation that truthfully acknowledges what was captured.
// The evals harness mirrors the extraction prompt via agent-contract.json.

const RECENT_TURNS = 12;

export type InputMethod = "voice" | "text";

export type ToolCall = { name: string; args: Record<string, unknown> };

// Binding fields per tool: captured values that get a voice read-back (the
// fields where a misheard digit/name is costly). See CONTEXT.md "Binding field".
const BINDING_ARGS: Record<string, string[]> = {
  upsert_asset: ["estimated_value"],
  add_financial_account: ["estimated_value"],
  add_person: ["full_name", "date_of_birth"],
};

const CHAPTER_GOALS: Record<ChapterId, string> = {
  real_estate: `REAL ESTATE — the person's home and any land or other property. Use upsert_asset to add or update a property. Inherited family land without a clear deed is common; capture it and you may flag_heirs_property_risk. When the person says who a property should GO TO, capture that recipient with add_person and set asset_id to that property's id.`,
  financial_accounts: `FINANCIAL ACCOUNTS — checking, savings, retirement (401k, IRA), and brokerage/investment accounts. Use add_financial_account for each account (pass institution and account_type). If the person also mentions real estate, capture it with upsert_asset. When they name who should receive something, capture that recipient with add_person.`,
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

  let people = "";
  if (state.beneficiaries.length > 0) {
    const plines = state.beneficiaries.map((b) => {
      const rel = b.relationship ? `, ${b.relationship}` : "";
      const recv = b.receivesAssetLabel
        ? `; receives ${b.receivesAssetLabel}`
        : b.receivesAssetId
          ? "; receives a property on record"
          : "";
      return `- [id=${b.id}] ${fmt(b.fullName, "(unnamed)")}${rel}${recv}`;
    });
    people = `\nPeople already on record (reference these IDs to UPDATE, do not duplicate):\n${plines.join("\n")}`;
  }

  return `${who}\n${items}${people}`;
}

// ---------- Extraction call (single job: emit tool calls) ----------

const EXTRACTION_RULES = `You are the capture engine for an estate-intake conversation. Your ONLY job is to emit tool calls for what the person stated THIS turn. You do not write any prose reply.

Rules:
- Capture EARLY: create a row the moment a thing is identifiable (an address, "our home", an account). Do not wait for more detail.
- Leave unknown fields null. NEVER invent a value, a name, a number, an address, or a balance. Empty is safe; invented is harmful.
- ENTITY RESOLUTION: the record below lists existing items (and people) with their IDs. If the person refers to one that already exists, call the tool with that id to UPDATE it. Never create a duplicate.
- WHO THEY PROTECT: when the person names someone they want to protect, provide for, or leave something to (a beneficiary or recipient, e.g. "it goes to my son Atlas" or "I want my mother and father to have it"), call add_person with their name (and relationship if stated). Capture EACH named person as a separate add_person call. If they tie that person to a SPECIFIC property on record, set asset_id to that property's id; if it is a general wish with no specific asset, OMIT asset_id. The OWNER (the person you are talking to) is never the recipient. Update an existing person by their id.
- Do not re-capture what is unchanged. If the person stated nothing new and gave no instruction, emit NO tool call.
- Do not re-ask or re-record what the chapter opening already implied (the chapter is about things they own).
- MOVING ON: when the person signals they are done with this chapter or want to move on ("that's everything", "that's all", "nothing else", "let's continue", "next"), call confirm_chapter_complete. If they want to skip this chapter for now, call defer_chapter. The conversation must not advance to a new section without one of these calls.

This chapter's focus: `;

export function buildExtractionSystem(
  chapterId: ChapterId,
  state: ChapterState,
): string {
  const goal = CHAPTER_GOALS[chapterId] ?? "";
  return `${EXTRACTION_RULES}${goal}${fewshotBlock(chapterId)}\n\n--- CURRENT RECORD ---\n${serializeProfile(state)}`;
}

// ---------- Reply call (single job: warm, truthful conversation) ----------

const REPLY_RULES = `You are Ava, a calm, warm guide helping someone in North Carolina build a record of what they own, so it reaches the people they love. You are not a lawyer or a financial advisor. You write ONLY the conversational reply — capturing facts happens separately, so never mention "recording" mechanics.

Voice and tone:
- Plain language, no jargon. Warm, unhurried, a trusted person, not a form.
- Keep replies to 1-3 short sentences. One thing at a time.
- NEVER use em dashes. Use periods, commas, or parentheses.
- Frame around the people they love and what they've built. Never be clinical about death. If emotional weight surfaces, acknowledge it briefly in a sentence, then keep moving.
- Never re-ask something already answered or already on the record.
- Education on demand only: if they ask what a term means, answer in one sentence, then ask the next thing.
- If they ask for legal or financial advice, gently decline and say a real attorney or advisor will help with that later, then continue. Do not advise.
- Inherited family land without a clear deed (heirs property) is common; you may gently name it, but never lecture.

Truthful acknowledgment:
- Acknowledge ONLY what was actually captured this turn (listed below). Never promise to record something ("let me record that") — it already happened.
- READ-BACK: `;

function describeCall(c: ToolCall): string {
  const a = c.args;
  switch (c.name) {
    case "upsert_asset": {
      const verb = a.id ? "Updated" : "Added";
      const loc = a.location ? ` at ${a.location}` : "";
      const val = a.estimated_value != null ? `, value ${a.estimated_value}` : "";
      return `${verb} property "${a.label ?? "unnamed"}"${loc}${val}`;
    }
    case "add_financial_account":
      return `Added account: ${a.institution ?? ""} ${a.account_type ?? ""}`.trim();
    case "add_person":
      return `Added person: ${a.full_name ?? ""}`.trim();
    case "flag_heirs_property_risk":
      return "Flagged a property as possible heirs property";
    case "confirm_chapter_complete":
      return "Chapter complete — warmly invite them to the next section (who you protect)";
    case "defer_chapter":
      return "Chapter deferred for now";
    default:
      return `Tool: ${c.name}`;
  }
}

function summarizeCaptured(
  toolCalls: ToolCall[],
  inputMethod: InputMethod,
): { captured: string; readback: string } {
  if (toolCalls.length === 0) {
    return {
      captured: "Nothing new was captured this turn.",
      readback:
        "Nothing to read back. If they asked a question, answer it briefly, then ask the next thing.",
    };
  }

  const readbackVals: string[] = [];
  if (inputMethod === "voice") {
    for (const c of toolCalls) {
      for (const key of BINDING_ARGS[c.name] ?? []) {
        const v = c.args[key];
        if (v != null && v !== "") {
          readbackVals.push(`${key.replace(/_/g, " ")} = ${String(v)}`);
        }
      }
    }
  }

  const readback = readbackVals.length
    ? `These were captured by VOICE and may be misheard, so restate them naturally and invite a correction: ${readbackVals.join("; ")}.`
    : "No read-back needed this turn.";

  return { captured: toolCalls.map(describeCall).join("; "), readback };
}

export function buildReplySystem(
  state: ChapterState,
  toolCalls: ToolCall[],
  inputMethod: InputMethod,
  probe?: Probe,
): string {
  const { captured, readback } = summarizeCaptured(toolCalls, inputMethod);
  // Soft steer: ask about the same thing the chips will surface, so Ava's
  // question and the recommended questions stay aligned. Advisory only.
  const nextStep =
    probe && probe.ask
      ? `\n\nThe most useful next thing to learn is ${probe.ask}. Make this the main question of your reply, phrased warmly and in your own words, UNLESS the person is clearly steering somewhere else. Never ask about something already on the record.`
      : "";
  return `${REPLY_RULES}${readback}\n\nWhat was captured this turn: ${captured}${nextStep}\n\n--- CURRENT RECORD ---\n${serializeProfile(state)}`;
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
