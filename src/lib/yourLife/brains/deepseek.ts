import "server-only";

import { generateText, tool } from "ai";
import { getAgentModel } from "@/lib/yourLife/llm";
import { buildMessages, buildSystemPrompt } from "@/lib/yourLife/agentContract";
import type { ChapterId } from "@/lib/yourLife/chapters";
import { UpsertAssetSchema } from "@/lib/yourLife/tools/upsertAsset";
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
// there's one definition per tool.
function realEstateTools() {
  return {
    upsert_asset: tool({
      description:
        "Add or update a real-estate property. Pass `id` (from the record) to UPDATE an existing one; omit `id` to add a new one. Only include fields the person actually stated.",
      inputSchema: UpsertAssetSchema,
    }),
    flag_heirs_property_risk: tool({
      description:
        "Flag an existing property as possible heirs property (inherited with unclear or unrecorded title). Pass the asset's id.",
      inputSchema: FlagHeirsPropertyRiskSchema,
    }),
    confirm_chapter_complete: tool({
      description:
        "Call when the person has finished sharing their property and has nothing to add.",
      inputSchema: ConfirmChapterCompleteSchema,
    }),
    defer_chapter: tool({
      description: "Call when the person wants to skip this chapter for now.",
      inputSchema: DeferChapterSchema,
    }),
  };
}

/**
 * DeepSeek-backed brain. Assembles context (system prompt + serialized profile +
 * recent turns), calls the model with the chapter's tools, and returns the same
 * ScriptedTurn shape the route already executes. On any model error it degrades
 * to a safe clarify turn so the route never crashes.
 */
export function makeDeepSeekBrain(chapterId: ChapterId): ChapterBrain {
  return async (state, userText) => {
    try {
      const result = await generateText({
        model: getAgentModel(),
        system: buildSystemPrompt(chapterId, state),
        messages: buildMessages(state, userText),
        tools: realEstateTools(),
        toolChoice: "auto",
      });

      const toolCalls = result.toolCalls.map((tc) => ({
        name: tc.toolName,
        args: (tc.input ?? {}) as Record<string, unknown>,
      }));

      const text =
        result.text?.trim() ||
        (toolCalls.length ? "Got it. I've noted that on your record." : FALLBACK.text);

      return { text, toolCalls, bucket: "answer" };
    } catch (err) {
      console.error("[deepseek] turn failed:", err);
      return FALLBACK;
    }
  };
}
