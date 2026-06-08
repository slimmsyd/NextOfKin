# ADR-002: ElevenLabs Scribe as the speech-to-text provider

- **Status:** Superseded as default by self-hosted whisper-flow (see Amendment 2026-06-08). ElevenLabs Scribe retained as optional fallback.
- **Date:** 2026-06-03
- **Supersedes:** the browser Web Speech API used for the first voice-input pass

## Amendment (2026-06-08): self-hosted whisper-flow is now the default STT

We ran out of ElevenLabs credits, and the default-logging privacy debt below was never
acceptable past the tiny pilot. Both pushed the same way: stop sending family voice to a
third party.

- **Default STT is now self-hosted whisper-flow** (faster-whisper `base.en`) on Google
  Cloud Run, private, scale-to-zero. Family audio is decoded and transcribed entirely on
  our own infrastructure and never reaches a third party. `STT_PROVIDER=whisperFlow`.
- **ElevenLabs Scribe is retained as a fallback** behind the seam (`STT_PROVIDER=elevenlabs`,
  default OFF). `src/lib/yourLife/stt.ts` is now a provider switch (mirrors `llm.ts`).
- **The HARD GATE below is resolved when whisper-flow is the default**, because there is
  no third-party STT logging. Verify `STT_PROVIDER=whisperFlow` and a private
  (`--no-allow-unauthenticated`) service in production.
- Phase 2 streaming now targets the whisper-flow `ws` endpoint, not ElevenLabs/Deepgram.
- See `services/whisper-flow/` and the plan. TTS moved off ElevenLabs in the same effort
  (pre-rendered MisoTTS clips); record a sibling decision when ADR-003 is written.

The original ADR is kept below for history.

## Context

Voice input is first-class for the target user (the founder's mother), who is more
comfortable speaking than typing. The first pass used the browser Web Speech API. It
failed in practice (no transcript returned) and is wrong for the product: it works well
only in Chrome (unreliable on the iOS Safari the target user is likely on) and silently
streams voice to Google with no DPA. STT lives only in the conversation/extraction
layer, never the legal core (non-negotiable rule #1).

## Decision

1. **Provider:** ElevenLabs **Scribe** (`scribe_v2`). Reuses the ElevenLabs vendor and
   `ELEVENLABS_API_KEY` already wired for TTS (`/api/voice/[scene]`). One vendor, one DPA.
2. **Mode (V1):** record-then-transcribe (batch). The client records an answer with
   MediaRecorder, POSTs the audio to `/api/your-life/transcribe`, and we transcribe in
   one call. Works on every browser including iOS Safari. The transcript drops into the
   composer as editable text (the user reviews and sends; never auto-sent).
3. **Single provider on purpose:** `src/lib/yourLife/stt.ts` is a thin, single-provider
   module. A provider switch is NOT pre-built; the future-streaming path is a documented
   seam, not a code branch.
4. **Seam for later:** evolve to live word-by-word streaming (ElevenLabs
   `v1SpeechToTextRealtime` or Deepgram Nova-3 over a WebSocket) when that UX is wanted.

## The privacy trade-off (explicit)

Family voice now leaves the browser to our server and then to ElevenLabs, which by
default logs audio and transcripts. Zero-retention (`enableLogging: false`, exposed via
`ELEVENLABS_STT_ZERO_RETENTION`) is ElevenLabs **enterprise-only**, so it cannot be
turned on for the standard family-only V1. Acceptable **only** for the tiny private V1,
same posture as the DeepSeek decision in ADR-001.

### Migration trigger — HARD GATE
**Before onboarding any user outside the founder's family**, either enable zero-retention
(enterprise plan, set `ELEVENLABS_STT_ZERO_RETENTION=true`) or switch to a zero-retention
STT host + DPA, and complete the AI-privacy items in `PRE-PUBLIC-LAUNCH-CHECKLIST.md`.

## Reminders (so this doesn't get forgotten)
1. `PRE-PUBLIC-LAUNCH-CHECKLIST.md` (blocking STT item)
2. This ADR (the migration trigger)
3. The gate comment in `src/lib/yourLife/stt.ts` at the `enableLogging` line

## Consequences
- Reliable cross-browser voice input; vendor swap is config-light later.
- Batch (record-then-transcribe) has a short delay after the user stops and no live
  word-by-word caption. Documented seam to add streaming when wanted.
- Carries an explicit, documented privacy debt (default logging) that must be paid
  before scaling.
