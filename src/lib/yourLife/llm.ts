import "server-only";

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";

// Provider-agnostic DeepSeek access. The base URL, model, and key are env, so
// migrating from the DeepSeek API (V1, family-only) to a Western zero-retention
// host is a config change, not a rewrite.
//
// V1 default: api.deepseek.com (DeepSeek's own API). See
// PlatformDocuments/PRE-PUBLIC-LAUNCH-CHECKLIST.md — moving off this endpoint is
// a HARD GATE before onboarding any non-family user.

const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
const DEFAULT_MODEL = "deepseek-chat";

let warned = false;

/**
 * One-line loud reminder in the logs whenever we're pointed at DeepSeek's own
 * (PRC-jurisdiction) endpoint. Reminder #3 of 4 — see the launch checklist.
 */
function warnIfFamilyOnlyEndpoint(baseURL: string) {
  if (warned) return;
  warned = true;
  if (/api\.deepseek\.com/.test(baseURL)) {
    console.warn(
      "[deepseek] Using api.deepseek.com (PRC jurisdiction). FAMILY-ONLY for V1. " +
        "Migrate to a Western zero-retention host + DPA before any non-family user. " +
        "See PlatformDocuments/PRE-PUBLIC-LAUNCH-CHECKLIST.md",
    );
  }
}

export function getAgentModel(): LanguageModel {
  const baseURL = process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
  const modelId = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  const apiKey = process.env.DEEPSEEK_API_KEY;

  warnIfFamilyOnlyEndpoint(baseURL);

  const provider = createOpenAICompatible({
    name: "deepseek",
    baseURL,
    apiKey,
  });
  return provider(modelId);
}

export function isAgentConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}
