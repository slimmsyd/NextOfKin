import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { SCENES, getVoiceId, isSceneKey } from "@/lib/voice/scenes";
import type { SceneKey } from "@/lib/voice/scenes";

// Voice synthesis for any scene defined in src/lib/voice/scenes.ts.
// Each scene is cached in-memory after first synthesis. Cache key is
// scene + voice + model + text — so editing the scene text invalidates.

export const runtime = "nodejs";

const MODEL_ID = "eleven_multilingual_v2";

type VoicePayload = {
  scene: SceneKey;
  text: string;
  audioBase64: string;
  alignment: {
    characters: string[];
    startTimes: number[];
    endTimes: number[];
  };
};

const cache = new Map<string, VoicePayload>();

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ scene: string }> },
) {
  const { scene: sceneParam } = await params;
  if (!isSceneKey(sceneParam)) {
    return NextResponse.json({ error: "Unknown scene" }, { status: 404 });
  }
  const scene = SCENES[sceneParam];
  const voiceId = getVoiceId(scene.key);

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY not configured" },
      { status: 500 },
    );
  }

  const cacheKey = `${scene.key}|${voiceId}|${MODEL_ID}|${scene.text}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const result = await client.textToSpeech.convertWithTimestamps(voiceId, {
      text: scene.text,
      modelId: MODEL_ID,
      outputFormat: "mp3_44100_128",
    });

    const alignment = result.alignment;
    if (!alignment) {
      return NextResponse.json(
        { error: "No alignment returned from TTS" },
        { status: 502 },
      );
    }

    const payload: VoicePayload = {
      scene: scene.key,
      text: scene.text,
      audioBase64: result.audioBase64,
      alignment: {
        characters: alignment.characters,
        startTimes: alignment.characterStartTimesSeconds,
        endTimes: alignment.characterEndTimesSeconds,
      },
    };

    cache.set(cacheKey, payload);
    return NextResponse.json(payload);
  } catch (err) {
    console.error(`ElevenLabs TTS failed for scene "${scene.key}":`, err);
    return NextResponse.json(
      { error: "TTS synthesis failed" },
      { status: 502 },
    );
  }
}
