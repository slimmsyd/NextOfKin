import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// The STT provider seam: STT_PROVIDER selects the backend behind the stable
// transcribeAudio(file) interface. Default is self-hosted whisper-flow; ElevenLabs
// is an optional fallback. See PlatformDocuments/ADR-002.

const ORIGINAL_ENV = { ...process.env };

describe("transcribeAudio provider seam", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.STT_PROVIDER = "whisperFlow";
    process.env.WHISPER_FLOW_URL = "https://whisper.example";
    process.env.WHISPER_FLOW_AUTH_TOKEN = "secret";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it("POSTs the blob to the whisper-flow service with bearer auth and returns text", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ text: "  Vanguard account  " }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { transcribeAudio } = await import("@/lib/yourLife/stt");
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });
    const text = await transcribeAudio(blob);

    expect(text).toBe("Vanguard account");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://whisper.example/transcribe");
    expect(init.method).toBe("POST");
    expect(
      new Headers(init.headers).get("authorization"),
    ).toBe("Bearer secret");
    expect(init.body).toBeInstanceOf(FormData);
  });

  it("throws when the whisper-flow service returns a non-200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500 })),
    );
    const { transcribeAudio } = await import("@/lib/yourLife/stt");
    await expect(
      transcribeAudio(new Blob([new Uint8Array([1])], { type: "audio/webm" })),
    ).rejects.toThrow();
  });

  it("throws if WHISPER_FLOW_URL is missing", async () => {
    delete process.env.WHISPER_FLOW_URL;
    vi.stubGlobal("fetch", vi.fn());
    const { transcribeAudio } = await import("@/lib/yourLife/stt");
    await expect(
      transcribeAudio(new Blob([new Uint8Array([1])], { type: "audio/webm" })),
    ).rejects.toThrow(/WHISPER_FLOW_URL/);
  });

  it("routes to ElevenLabs when STT_PROVIDER=elevenlabs", async () => {
    process.env.STT_PROVIDER = "elevenlabs";
    process.env.ELEVENLABS_API_KEY = "el-key";
    const convert = vi.fn(async () => ({ text: "from elevenlabs" }));
    vi.doMock("@elevenlabs/elevenlabs-js", () => ({
      ElevenLabsClient: class {
        speechToText = { convert };
      },
    }));

    const { transcribeAudio } = await import("@/lib/yourLife/stt");
    const text = await transcribeAudio(
      new Blob([new Uint8Array([1])], { type: "audio/webm" }),
    );

    expect(text).toBe("from elevenlabs");
    expect(convert).toHaveBeenCalledTimes(1);
  });
});
