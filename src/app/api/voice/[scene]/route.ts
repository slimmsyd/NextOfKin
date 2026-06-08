import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SCENES, getVoiceId, isSceneKey, type SceneKey } from "@/lib/voice/scenes";
import { cacheKey, readCachedStream, writeCacheSink } from "@/lib/voice/cache";

// Voice narration for any scene in src/lib/voice/scenes.ts.
//
// TTS PROVIDER SEAM (mirrors the STT seam in src/lib/yourLife/stt.ts):
//   TTS_PROVIDER=static (default) -> serve the pre-rendered MisoTTS clip from
//     public/voice/{scene}.mp3. Self-hosted, no per-character cost, no third party.
//   TTS_PROVIDER=elevenlabs       -> stream from ElevenLabs (fallback, default OFF).
//
// Narration text is fixed (5 scenes), so MisoTTS renders the clips offline once
// (services/miso-tts/scripts/render_scenes.py) and we serve them statically. When
// spoken agent replies land, add a live `misoService` source here. See ADR.

export const runtime = "nodejs";

const MODEL_ID = "eleven_multilingual_v2";

function ttsProvider(): "static" | "elevenlabs" {
  return process.env.TTS_PROVIDER === "elevenlabs" ? "elevenlabs" : "static";
}

const IMMUTABLE = "public, max-age=31536000, immutable";

async function servePrerendered(scene: SceneKey) {
  const file = path.join(process.cwd(), "public", "voice", `${scene}.mp3`);
  try {
    const bytes = await readFile(file);
    return new Response(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": IMMUTABLE,
        "X-Voice-Source": "prerendered",
      },
    });
  } catch {
    // Clip not rendered yet. The client tolerates a missing scene (narration just
    // does not play), same as an autoplay block.
    return NextResponse.json({ error: "Scene audio not rendered" }, { status: 404 });
  }
}

async function serveElevenLabs(scene: { key: SceneKey; text: string }) {
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
        "Cache-Control": IMMUTABLE,
        "X-Voice-Cache": "hit",
      },
    });
  }

  try {
    const { ElevenLabsClient } = await import("@elevenlabs/elevenlabs-js");
    const client = new ElevenLabsClient({ apiKey });
    const upstream = await client.textToSpeech.stream(voiceId, {
      text: scene.text,
      modelId: MODEL_ID,
      outputFormat: "mp3_44100_128",
    });

    const [forResponse, forCache] = upstream.tee();

    // Fire-and-forget pipe to the disk cache; failure must not affect the response.
    void (async () => {
      try {
        const sink = await writeCacheSink(key);
        await forCache.pipeTo(sink);
      } catch (err) {
        console.error(`Voice cache write failed for scene "${scene.key}":`, err);
      }
    })();

    return new Response(forResponse, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": IMMUTABLE,
        "X-Voice-Cache": "miss",
      },
    });
  } catch (err) {
    console.error(`ElevenLabs TTS failed for scene "${scene.key}":`, err);
    return NextResponse.json({ error: "TTS synthesis failed" }, { status: 502 });
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ scene: string }> },
) {
  const { scene: sceneParam } = await params;
  if (!isSceneKey(sceneParam)) {
    return NextResponse.json({ error: "Unknown scene" }, { status: 404 });
  }
  const scene = SCENES[sceneParam];

  return ttsProvider() === "elevenlabs"
    ? serveElevenLabs(scene)
    : servePrerendered(scene.key);
}
