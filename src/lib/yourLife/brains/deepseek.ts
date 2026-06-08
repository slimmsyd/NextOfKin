import "server-only";

import { tool } from "ai";
import { generateText, traceOptions } from "@/lib/yourLife/tracing";
import { getAgentModel } from "@/lib/yourLife/llm";
import {
  buildExtractionSystem,
  buildMessages,
  buildReplySystem,
} from "@/lib/yourLife/agentContract";
import type { ChapterId } from "@/lib/yourLife/chapters";
import { nextProbe } from "@/lib/yourLife/interviewFlow";
import { OFFERED_TOOLS } from "@/lib/yourLife/tools/registry";
import { UpsertAssetSchema } from "@/lib/yourLife/tools/upsertAsset";
import { AddFinancialAccountSchema } from "@/lib/yourLife/tools/addFinancialAccount";
import { AddOtherAssetSchema } from "@/lib/yourLife/tools/addOtherAsset";
import { AddPersonSchema } from "@/lib/yourLife/tools/addPerson";
import { FlagHeirsPropertyRiskSchema } from "@/lib/yourLife/tools/flagHeirsPropertyRisk";
import { ConfirmChapterCompleteSchema } from "@/lib/yourLife/tools/confirmChapterComplete";
import { DeferChapterSchema } from "@/lib/yourLife/tools/deferChapter";
import type { ChapterBrain, ScriptedTurn } from "./types";

const FALLBACK: ScriptedTurn = {
  text: "Sorry, I didn't quite catch that. Could you say it again?",
  toolCalls: [],
  bucket: "clarify",
};

// Tools are defined WITHOUT `execute`: the SDK only returns the tool calls, and
// the chat route executes them via validateAndApply (keeping the auth/RLS/
// persistence boundary in Next.js). Schemas are reused from the tool layer, so
// there's one definition per tool. Which of these the model is OFFERED per
// chapter comes from the registry (tools/registry.ts), guarded by the contract
// test, so the offered set can never drift from what the route can apply.
function allToolDefs() {
  return {
    upsert_asset: tool({
      description:
        "Add or update a real-estate property (a home, land, or other real property). Pass `id` (from the record) to UPDATE an existing one; omit `id` to add a new one. Only include fields the person actually stated.",
      inputSchema: UpsertAssetSchema,
    }),
    add_financial_account: tool({
      description:
        "Add or update a financial account: checking, savings, brokerage, 401(k), or IRA. Pass institution (the bank or provider) and account_type. Pass `id` (from the record) to UPDATE an existing account, for example to add its balance on a later turn; omit `id` to add a new one. Use this for bank, retirement, and investment accounts, NOT for real estate.",
      inputSchema: AddFinancialAccountSchema,
    }),
    add_other_asset: tool({
      description:
        "Add or update an asset that is NOT real estate and NOT a financial account: a vehicle, business interest, personal property or valuables, life insurance, annuity, or anything else the person owns (e.g. crypto -> type 'other'). Pass the best-fit `type` and a short `label`. Pass `id` (from the record) to UPDATE an existing one, for example to add its value later; omit `id` to add a new one. Use this instead of forcing such things into the real-estate (upsert_asset) or account (add_financial_account) tools.",
      inputSchema: AddOtherAssetSchema,
    }),
    add_person: tool({
      description:
        "Record a person the owner wants to protect: a beneficiary or recipient. Pass full_name (and relationship if stated). If they should receive a SPECIFIC property already on the record, set asset_id to that property's id. If they should receive an asset you are capturing in THIS SAME turn (no id yet), set receives_new_asset_label to that asset's exact label instead of asset_id. If they are a general heir with no specific asset, omit both. Pass the person's `id` to UPDATE an existing one. The owner you are talking to is never the recipient.",
      inputSchema: AddPersonSchema,
    }),
    flag_heirs_property_risk: tool({
      description:
        "Flag an existing property as possible heirs property (inherited with unclear or unrecorded title). Pass the asset's id.",
      inputSchema: FlagHeirsPropertyRiskSchema,
    }),
    confirm_chapter_complete: tool({
      description:
        "Call when the person has finished sharing for this chapter and has nothing to add, or signals they want to move on. This advances the interview.",
      inputSchema: ConfirmChapterCompleteSchema,
    }),
    defer_chapter: tool({
      description: "Call when the person wants to skip this chapter for now.",
      inputSchema: DeferChapterSchema,
    }),
  };
}

// The subset of tools offered to the model for a given chapter, per the registry.
function toolsForChapter(chapterId: ChapterId) {
  const all = allToolDefs();
  const offered: Record<string, (typeof all)[keyof typeof all]> = {};
  for (const name of OFFERED_TOOLS[chapterId]) {
    if (name in all) offered[name] = all[name as keyof typeof all];
  }
  return offered;
}

/**
 * DeepSeek-backed brain, split into two single-job calls:
 *   1) EXTRACTION — emit tool calls for what was stated (reliable capture).
 *   2) REPLY — warm prose that truthfully acknowledges what call 1 captured.
 * Returns the same ScriptedTurn shape the route already executes (the route
 * runs the tool calls via validateAndApply). Degrades to a safe turn on error.
 */
export function makeDeepSeekBrain(chapterId: ChapterId): ChapterBrain {
  return async (state, userText, ctx) => {
    const inputMethod = ctx?.inputMethod ?? "text";
    const model = getAgentModel();
    try {
      // 1) Extraction — tools only, no prose.
      const extraction = await generateText({
        model,
        system: buildExtractionSystem(chapterId, state),
        messages: buildMessages(state, userText),
        tools: toolsForChapter(chapterId),
        toolChoice: "auto",
        providerOptions: traceOptions("yourlife-extraction", {
          chapter: chapterId,
          inputMethod,
          stage: "extraction",
        }),
      });
      const toolCalls = extraction.toolCalls.map((tc) => ({
        name: tc.toolName,
        args: (tc.input ?? {}) as Record<string, unknown>,
      }));
      console.log(
        "[deepseek] extracted tools:",
        toolCalls.length ? toolCalls.map((t) => t.name).join(", ") : "(none)",
      );

      // Shared primitive: the most useful next topic, computed from the record
      // + what was just captured. Steers Ava AND seeds the chips (one source of
      // truth, so they stay aligned).
      const probe = nextProbe({ chapter: chapterId, state, capturedThisTurn: toolCalls });

      // 2) Reply — prose only, knows what was just captured (truthful ack) and
      //    which topic to gently move toward.
      const reply = await generateText({
        model,
        system: buildReplySystem(state, toolCalls, inputMethod, probe),
        messages: buildMessages(state, userText),
        providerOptions: traceOptions("yourlife-reply", {
          chapter: chapterId,
          inputMethod,
          stage: "reply",
          // The capture signal we are debugging: what extraction emitted, so a
          // reply that advances the conversation while nothing was captured
          // (the desync class) is visible in the trace without any PII.
          capturedTools: toolCalls.map((t) => t.name),
          probeTopic: probe.topic,
        }),
      });
      const text =
        reply.text?.trim() ||
        (toolCalls.length
          ? "Got it. You'll see it on the right."
          : FALLBACK.text);

      return { text, toolCalls, bucket: "answer", nextProbe: probe };
    } catch (err) {
      console.error("[deepseek] turn failed:", err);
      return FALLBACK;
    }
  };
}
