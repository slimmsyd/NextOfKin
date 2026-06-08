import { NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { SCENES, getVoiceId, isSceneKey } from "@/lib/voice/scenes";
import { cacheKey, readCachedStream, writeCacheSink } from "@/lib/voice/cache";

// Voice synthesis for any scene defined in src/lib/voice/scenes.ts.
// Streams MP3 bytes straight from ElevenLabs (or from the on-disk cache on
// repeat hits). Cache key is scene + voice + model + text — editing the
// scene text invalidates automatically.

export const runtime = "nodejs";

const MODEL_ID = "eleven_multilingual_v2";

export async function GET(
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

  const key = cacheKey({
    scene: scene.key,
    voiceId,
    modelId: MODEL_ID,
    text: scene.text,
  });

  const cached = await readCachedStream(key);
  if (cached) {
    return new Response(cached.stream, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(cached.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Voice-Cache": "hit",
      },
    });
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const upstream = await client.textToSpeech.stream(voiceId, {
      text: scene.text,
      modelId: MODEL_ID,
      outputFormat: "mp3_44100_128",
    });

    const [forResponse, forCache] = upstream.tee();

    // Fire-and-forget pipe to the disk cache. Failure here must not affect
    // the user-facing response.
    void (async () => {
      try {
        const sink = await writeCacheSink(key);
        await forCache.pipeTo(sink);
      } catch (err) {
        console.error(
          `Voice cache write failed for scene "${scene.key}":`,
          err,
        );
      }
    })();

    return new Response(forResponse, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Voice-Cache": "miss",
      },
    });
  } catch (err) {
    console.error(`ElevenLabs TTS failed for scene "${scene.key}":`, err);
    return NextResponse.json(
      { error: "TTS synthesis failed" },
      { status: 502 },
    );
  }
}
