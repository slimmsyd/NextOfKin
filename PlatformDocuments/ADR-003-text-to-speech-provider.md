# ADR-003: Self-hosted MisoTTS (pre-rendered) as the text-to-speech provider

- **Status:** Accepted (V1, family-only)
- **Date:** 2026-06-08
- **Supersedes:** ElevenLabs `eleven_multilingual_v2` as the narration voice (kept as fallback)

## Context

ElevenLabs did both halves of voice: STT (Scribe, see ADR-002) and TTS narration via
`/api/voice/[scene]`. We ran out of credits, and the same privacy logic that moved STT
off a third party applies to TTS. Narration is also conversation-layer only (rule #1).

Key fact that shapes the decision: **narration is 100% fixed** today. There are exactly
5 scene scripts (`welcome`, `consent`, `protect`, `about-you`, `your-life-real-estate`),
~160 words total, in `src/lib/voice/scenes.data.json`. Agent replies are text-only; there
is no dynamic TTS.

## Decision

1. **Model:** self-hosted **MisoTTS (Miso TTS 8B)** for its warm, conversational quality
   (the founder's-mother bar for the welcome/consent narration).
2. **Phase A (now): pre-render, serve static.** Because the text is fixed and tiny, render
   the 5 clips **once** on a GPU (`services/miso-tts/scripts/render_scenes.py`), commit them
   to `public/voice/{scene}.mp3`, and serve them statically. No runtime TTS service, no GPU
   bill, no per-character cost. MisoTTS's 24 GB GPU requirement only applies to the one-off
   render.
3. **Provider seam:** `/api/voice/[scene]` is now a switch. `TTS_PROVIDER=static` (default)
   serves the pre-rendered clip; `TTS_PROVIDER=elevenlabs` is the fallback (default OFF).
   The client and audio player are unchanged.
4. **Single source for scene text:** `scenes.data.json` is shared by `scenes.ts` and the
   render script, so they cannot drift. Re-render when a script changes.
5. **Phase B (later, not built): live spoken agent replies.** Deploy the same
   `services/miso-tts/` image to Cloud Run GPU (L4, scale-to-zero) and add a `misoService`
   source to the seam. If the GPU cost is too high, keep MisoTTS for the pre-rendered hero
   scenes and use a CPU model (Kokoro) for dynamic replies.

## Gates (must clear before relying on this)

- **License — HARD GATE.** The MisoTTS repo does not state a license. Confirm commercial-use
  rights before shipping. Output is watermarked (SilentCipher), inaudible, acceptable.
- **API verification.** The `generator` import/signature in `app/synth.py` and
  `render_scenes.py` follows the MisoTTS README; verify against the repo when rendering.

## Consequences

- ElevenLabs is removed from the default product (TTS here + STT in ADR-002). No credits
  dependency, no third-party voice logging.
- Phase A narration is static, immutable, CDN-cacheable, near-zero ongoing cost.
- A scene-text change requires a manual GPU re-render of the affected clip(s).
- Spoken agent replies remain a future phase with a real GPU cost decision attached.
