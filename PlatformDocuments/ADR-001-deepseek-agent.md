# ADR-001: DeepSeek as the conversational agent runtime

- **Status:** Accepted (V1, family-only)
- **Date:** 2026-05-29
- **Supersedes:** the CLAUDE.md tech-stack line "Agent runtime: Claude API — to be added"

## Context

The intake interview needs a real LLM to converse and emit schema-bound tool
calls that populate the structured profile (the source of truth). CLAUDE.md and
the design doc originally assumed the Anthropic Claude API. The founder chose
**DeepSeek** instead (cost, openness, control). The model lives only in the
conversation/extraction layer — never the legal core (non-negotiable rule #1).

## Decision

1. **Model:** DeepSeek (`deepseek-chat`) via an OpenAI-compatible endpoint.
2. **Runtime:** the live turn loop stays in **Next.js** (Vercel AI SDK +
   `@ai-sdk/openai-compatible`), dropped into the existing `ChapterBrain` seam.
   No separate live service. **Python is used only for the evals harness.**
3. **Provider-agnostic:** base URL, model, and key are env (`llm.ts`), so the
   inference vendor is config, not code.
4. **V1 endpoint (family-only):** `api.deepseek.com`. Fast path to a working
   loop for the founder's mother + 4 trusted families, training/retention
   disabled.

## The privacy trade-off (explicit)

Any hosted model decrypts data to process it; `api.deepseek.com` is PRC
jurisdiction. That is in tension with the consent promise and is acceptable
**only** for the tiny private V1.

### Migration trigger — HARD GATE
**Before onboarding any user outside the founder's family**, switch to a
**Western zero-retention host + DPA** (env change) and complete the AI-privacy
items in `PRE-PUBLIC-LAUNCH-CHECKLIST.md` (tokenization, at-rest encryption,
consent/privacy-policy disclosure). The decision and its expiry live together so
neither is lost.

## Reminders (so this doesn't get forgotten) — planted in 4 places
1. `PRE-PUBLIC-LAUNCH-CHECKLIST.md` (blocking item #1)
2. This ADR (the migration trigger)
3. Runtime `console.warn` in `src/lib/yourLife/llm.ts` when on the PRC endpoint
4. A `project` memory entry for cross-session recall

## Consequences
- Fast V1; vendor swap is trivial later.
- DeepSeek function-calling is less battle-tested than Claude/GPT — mitigated by
  strict Zod tool schemas + server-side validation + the (upcoming) human
  confirmation loop.
- Carries an explicit, documented privacy debt that must be paid before scaling.
