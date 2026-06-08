# Pre-launch hardening checklist

> Standing gate. Items here are **deliberately deferred** for the private V1
> (founder's mother + 4 trusted families) and become **required before
> onboarding anyone outside the founder's family.** Do not widen access until
> the blocking items are done.

## 🔴 BLOCKING — required before any non-family user

### AI / DeepSeek privacy
- [ ] **Move DeepSeek off `api.deepseek.com`** (PRC jurisdiction) to a **Western
      zero-retention host + signed DPA** — Fireworks / Together / DeepInfra, or
      Azure AI Foundry / AWS Bedrock for the strongest compliance posture.
      *This is an env change only* (`DEEPSEEK_BASE_URL` / `DEEPSEEK_MODEL` /
      `DEEPSEEK_API_KEY` in `src/lib/yourLife/llm.ts`) — built provider-agnostic
      on purpose. See `ADR-001-deepseek-agent.md`.
- [ ] Confirm training/retention is disabled on whichever account is in use.
- [ ] **PII tokenization** before model calls — replace names/numbers with
      placeholders, rehydrate server-side (most sensitive fields first).
- [ ] **Field-level encryption at rest** for sensitive profile values; decrypt
      only server-side when assembling the prompt.
- [ ] **Consent + privacy policy** disclose the AI subprocessor accurately
      (the `SetupConsent` copy was softened from "not even our team reads it" —
      finish the privacy-policy page to match).
- [x] **Speech-to-text retention** — RESOLVED when whisper-flow is the default.
      Family voice is now transcribed by self-hosted whisper-flow on our Cloud Run
      (US, private), so no third-party STT logging. To confirm at launch: verify
      `STT_PROVIDER=whisperFlow` in production and the service is deployed
      `--no-allow-unauthenticated`. ElevenLabs Scribe remains only as an OFF-by-default
      fallback. See `ADR-002` (Amendment 2026-06-08).
- [ ] **Text-to-speech / narration voice** — still ElevenLabs (`/api/voice/[scene]`).
      Narration is fixed and tiny (~1100 chars across 5 scenes), so this is a negligible
      cost, not the credit sink (STT was). Note: the runtime disk cache does not persist
      on Vercel, so leaving it live re-bills on cold instances. If this matters, pre-render
      the 5 clips once and commit them as static files. Self-hosting the voice (MisoTTS or
      a CPU model) is a deferred option, not required for launch.
- [ ] **Captured onboarding data (the flywheel)** — `ConversationTurn` now stores
      per-turn capture signals (`inputMethod`, `desync`, `meta`); the harvest +
      insights scripts export real turns to `evals/review/` (gitignored). This stays
      inside the family boundary. Before any non-family or training use: PII
      tokenization + provenance fields (`source_turn_id`, `capture_method`,
      `confidence`, `confirmed`) + DPA. Few-shot examples sent to the LLM
      (`src/lib/yourLife/fewshot.ts`) must remain synthetic.

### Data accuracy (the confirmation system)
- [ ] **Provenance** on every captured field: `source_turn_id`,
      `capture_method` (stated / inferred / user-edited), `confidence`,
      `confirmed`.
- [ ] **Pending/unconfirmed write state** + frictionless confirmation loop in
      the right pane (the model gets ~90%; the human closes the last 10%).
- [ ] **Async reconciliation pass** — re-read each chapter transcript against
      the profile to catch under-extraction; wire into Phase 5 (review + gaps).

## 🟡 Before broader (non-NC / public) launch
- [ ] Security baseline review (MFA actually enforced — currently selection-only;
      audit logging coverage; SOC 2 trajectory).
- [ ] Attorney sign-off before any document template ships (V1.5).
- [ ] Add states beyond NC (each ~6–8 weeks incl. attorney review).

## ✅ Already in place (context)
- DeepSeek lives only in the conversation/extraction layer; legal core stays
  deterministic (non-negotiable rule #1).
- Provider-agnostic LLM config + a runtime warning when pointed at the
  family-only PRC endpoint (`llm.ts`).
- Owner-only RLS + audit triggers on user-owned tables.
- Evals harness for the 4 extraction failure modes (`evals/`).
