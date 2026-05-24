// Server-side scene library for ElevenLabs voiceovers.
// Each phase/step that wants narration registers its text here. The text is
// static today; when the agent text layer lands, individual scenes can swap
// to a Claude-generated prompt without changing the client.

export type SceneKey = "welcome" | "protect" | "about-you";

type Scene = {
  key: SceneKey;
  text: string;
};

const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_WELCOME_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

export const SCENES: Record<SceneKey, Scene> = {
  welcome: {
    key: "welcome",
    text: "Over the next hour, we'll walk through what matters to you, who matters to you, and how you'd want things handled if something happened. Nothing is final until you say so. We won't ask you anything legal or technical yet. This first step is just so you know what's ahead, and so you trust where this is going.",
  },
  protect: {
    key: "protect",
    text: "Let's protect what you share with me. We'll send you a code each time you sign in. That way only you can see what's here.",
  },
  "about-you": {
    key: "about-you",
    text: "Let's start with you. Seven quick questions. About ten minutes.",
  },
};

// All scenes use the same voice today. When we want per-scene voices later
// (e.g. a different voice for legal copy), add overrides here keyed by SceneKey.
const VOICE_ID_OVERRIDES: Partial<Record<SceneKey, string>> = {};

export function getVoiceId(scene: SceneKey): string {
  return VOICE_ID_OVERRIDES[scene] ?? DEFAULT_VOICE_ID;
}

export function isSceneKey(value: string): value is SceneKey {
  return value === "welcome" || value === "protect" || value === "about-you";
}
