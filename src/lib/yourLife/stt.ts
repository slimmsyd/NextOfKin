import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Speech-to-text for the Your Life intake. V1 is record-then-transcribe (batch):
// the client records an answer, POSTs the audio, and we transcribe it in one call.
//
// PROVIDER SEAM (mirrors src/lib/yourLife/llm.ts): STT_PROVIDER selects the backend.
// Default is self-hosted whisper-flow on Cloud Run, so family audio never leaves our
// infrastructure. ElevenLabs Scribe is retained as an optional fallback only, default
// OFF. transcribeAudio(file: Blob): Promise<string> is the stable interface the route
// and recorder depend on, unchanged across providers.
// See PlatformDocuments/ADR-002-speech-to-text-provider.md.
//
// STREAMING SEAM (Phase 2): live word-by-word captions over the whisper-flow ws
// endpoint. Documented, not pre-built here.

type SttProvider = "whisperFlow" | "elevenlabs";

function selectedProvider(): SttProvider {
  return process.env.STT_PROVIDER === "elevenlabs" ? "elevenlabs" : "whisperFlow";
}

// Self-hosted whisper-flow (Cloud Run). Forwards the original audio blob untouched;
// the service decodes (ffmpeg) and transcribes. Server-to-server, never from the browser.
async function transcribeWhisperFlow(file: Blob): Promise<string> {
  const baseUrl = process.env.WHISPER_FLOW_URL;
  const token = process.env.WHISPER_FLOW_AUTH_TOKEN;
  if (!baseUrl) {
    throw new Error("WHISPER_FLOW_URL is not set");
  }
  if (!token) {
    throw new Error("WHISPER_FLOW_AUTH_TOKEN is not set");
  }

  const form = new FormData();
  form.append("file", file, "answer.webm");

  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/transcribe`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`whisper-flow transcribe failed: ${res.status}`);
  }
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}

// ElevenLabs Scribe (scribe_v2). Fallback only. enableLogging:false (zero-retention)
// is enterprise-only; family voice is logged by default, which is the privacy reason
// whisper-flow is now the default. See ADR-002 + the launch checklist.
async function transcribeElevenLabs(file: Blob): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }
  const zeroRetention = process.env.ELEVENLABS_STT_ZERO_RETENTION === "true";

  const client = new ElevenLabsClient({ apiKey });
  const response = await client.speechToText.convert({
    modelId: "scribe_v2",
    file,
    languageCode: "en",
    enableLogging: !zeroRetention,
  });

  // convert() returns a union (chunk | multichannel | webhook). Our request uses
  // neither multichannel nor webhook, so the chunk shape with `.text` is what we get.
  return "text" in response ? response.text.trim() : "";
}

export async function transcribeAudio(file: Blob): Promise<string> {
  return selectedProvider() === "elevenlabs"
    ? transcribeElevenLabs(file)
    : transcribeWhisperFlow(file);
}
