import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Speech-to-text for the Your Life intake. V1 is record-then-transcribe (batch):
// the client records an answer, POSTs the audio, and we transcribe it in one call
// via ElevenLabs Scribe (scribe_v2).
//
// SEAM: this is intentionally a single-provider, single-shot module. The product is
// meant to evolve to live word-by-word streaming later, either ElevenLabs
// v1SpeechToTextRealtime or Deepgram Nova-3 over a WebSocket. When that lands, add the
// streaming path (and only then a provider switch). Do NOT pre-build it here.
// See PlatformDocuments/ADR-002-speech-to-text-provider.md.

const MODEL_ID = "scribe_v2";
const LANGUAGE_CODE = "en";

export async function transcribeAudio(file: Blob): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }

  // Zero-retention (enableLogging: false) is ElevenLabs enterprise-only. Default to
  // logging-on for family-only V1; flipping ELEVENLABS_STT_ZERO_RETENTION is the
  // documented privacy gate before any non-family user (ADR-002 + the launch checklist).
  const zeroRetention = process.env.ELEVENLABS_STT_ZERO_RETENTION === "true";

  const client = new ElevenLabsClient({ apiKey });
  const response = await client.speechToText.convert({
    modelId: MODEL_ID,
    file,
    languageCode: LANGUAGE_CODE,
    enableLogging: !zeroRetention,
  });

  // convert() returns a union (chunk | multichannel | webhook). Our request uses
  // neither multichannel nor webhook, so the chunk shape with `.text` is what we get.
  return "text" in response ? response.text.trim() : "";
}
