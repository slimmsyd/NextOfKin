// Server-side scene library for voice narration.
//
// The 5 scene texts live in scenes.data.json so they are a SINGLE SOURCE shared
// between this module and the offline TTS render script
// (services/miso-tts/scripts/render_scenes.py). When a script changes here, re-render
// the affected clip. The text is static today; when spoken agent replies land, the
// TTS provider seam (TTS_PROVIDER) gains a live `misoService` source.

import sceneText from "./scenes.data.json";

export type SceneKey =
  | "welcome"
  | "consent"
  | "protect"
  | "about-you"
  | "your-life-real-estate";

type Scene = {
  key: SceneKey;
  text: string;
};

const DEFAULT_VOICE_ID =
  process.env.ELEVENLABS_WELCOME_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

const SCENE_TEXT = sceneText as Record<SceneKey, string>;

const SCENE_KEYS: SceneKey[] = [
  "welcome",
  "consent",
  "protect",
  "about-you",
  "your-life-real-estate",
];

export const SCENES: Record<SceneKey, Scene> = Object.fromEntries(
  SCENE_KEYS.map((key) => [key, { key, text: SCENE_TEXT[key] }]),
) as Record<SceneKey, Scene>;

// All scenes use the same voice today. When we want per-scene voices later
// (e.g. a different voice for legal copy), add overrides here keyed by SceneKey.
const VOICE_ID_OVERRIDES: Partial<Record<SceneKey, string>> = {};

export function getVoiceId(scene: SceneKey): string {
  return VOICE_ID_OVERRIDES[scene] ?? DEFAULT_VOICE_ID;
}

export function isSceneKey(value: string): value is SceneKey {
  return (SCENE_KEYS as string[]).includes(value);
}
