import "server-only";

import * as ai from "ai";
import { Client } from "langsmith";
import {
  wrapAISDK,
  createLangSmithProviderOptions,
} from "langsmith/experimental/vercel";

// LangSmith tracing for the agent's two generateText calls (extraction + reply).
// This is a DEBUGGING / EVAL observability seam, gated hard behind the same
// privacy posture as the DeepSeek-PRC endpoint (rule #1, ADR-001):
//
//   Onboarding turns carry dense real PII (names, institutions, property,
//   beneficiaries). Sending those to LangSmith's US cloud is the same trust
//   violation as the DeepSeek-PRC gate. So:
//     - Tracing is OFF unless LANGSMITH_TRACING=true (prod default: zero traces).
//     - Even when on, it REFUSES to run in production unless LANGSMITH_ALLOW_PROD
//       is explicitly set, so live family sessions on Vercel never trace.
//     - When on, inputs/outputs are REDACTED before anything leaves the process,
//       UNLESS LANGSMITH_REDACT=false (reserved for dev runs on SYNTHETIC data
//       where you want to read the real prompts to debug capture).
//
// Net: the only way real family PII reaches LangSmith is a deliberate
// LANGSMITH_TRACING=true + LANGSMITH_ALLOW_PROD=true + LANGSMITH_REDACT=false on
// a prod deploy. That combination is the thing the launch checklist forbids
// until we self-host LangSmith.

const TRACING_ON = process.env.LANGSMITH_TRACING === "true";
const IS_PROD = process.env.NODE_ENV === "production";
const ALLOW_PROD = process.env.LANGSMITH_ALLOW_PROD === "true";

/** Tracing actually emits spans only when on AND not silently in prod. */
export const TRACING_ENABLED = TRACING_ON && (!IS_PROD || ALLOW_PROD);

// Redact by default whenever tracing is enabled. Opt out ONLY for synthetic dev.
const REDACT = TRACING_ENABLED && process.env.LANGSMITH_REDACT !== "false";

if (TRACING_ON && IS_PROD && !ALLOW_PROD) {
  console.warn(
    "[tracing] LANGSMITH_TRACING=true ignored in production (no LANGSMITH_ALLOW_PROD). " +
      "Live family PII stays off LangSmith. See PRE-PUBLIC-LAUNCH-CHECKLIST.md.",
  );
}
if (TRACING_ENABLED && !REDACT) {
  console.warn(
    "[tracing] LANGSMITH_REDACT=false: full prompts/replies will be sent to LangSmith. " +
      "Use ONLY with synthetic/own data, never real family sessions.",
  );
}

// Own the client so we can flush pending batches at end of request (see route).
const client = TRACING_ENABLED ? new Client() : null;

// Swap in the wrapped generateText only when tracing is enabled; otherwise this
// is the raw AI SDK function with zero overhead and zero new behavior.
const wrapped = TRACING_ENABLED ? wrapAISDK(ai, { client: client! }) : null;

/** Drop-in for ai.generateText. Traced iff tracing is enabled. */
export const generateText: typeof ai.generateText = wrapped
  ? wrapped.generateText
  : ai.generateText;

// ---- redaction ---------------------------------------------------------------
// Keep the SHAPE useful for debugging (message roles, which tools fired) while
// stripping the free-text and tool args that carry PII.

function redactInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (inputs.system) out.system = "[REDACTED]";
  if (inputs.prompt) out.prompt = "[REDACTED]";
  const messages = inputs.messages;
  if (Array.isArray(messages)) {
    out.messages = messages.map((m) => ({
      role: (m as { role?: string }).role ?? "unknown",
      content: "[REDACTED]",
    }));
  }
  return out;
}

function redactOutputs(outputs: Record<string, unknown>): Record<string, unknown> {
  // Preserve tool NAMES (the capture signal we are debugging) but drop their
  // args and the free-text reply.
  const out: Record<string, unknown> = { content: "[REDACTED]" };
  const toolCalls = outputs.toolCalls;
  if (Array.isArray(toolCalls)) {
    out.toolCalls = toolCalls.map((c) => ({
      toolName:
        (c as { toolName?: string; name?: string }).toolName ??
        (c as { name?: string }).name ??
        "unknown",
    }));
  }
  return out;
}

/**
 * Provider options for a single traced call. Returns undefined when tracing is
 * disabled, so callers pass `providerOptions: traceOptions(...)` unconditionally
 * and it is a no-op in prod.
 */
export function traceOptions(
  runName: string,
  metadata: Record<string, unknown>,
): { langsmith: ReturnType<typeof createLangSmithProviderOptions> } | undefined {
  if (!TRACING_ENABLED) return undefined;
  const ls = createLangSmithProviderOptions<typeof ai.generateText>({
    name: runName,
    metadata,
    ...(REDACT
      ? { processInputs: redactInputs, processOutputs: redactOutputs }
      : {}),
  });
  return { langsmith: ls };
}

/** Flush pending trace batches. No-op when disabled. Call via after() in routes. */
export async function flushTraces(): Promise<void> {
  if (!client) return;
  try {
    await client.awaitPendingTraceBatches();
  } catch (err) {
    console.warn("[tracing] flush failed:", err);
  }
}
