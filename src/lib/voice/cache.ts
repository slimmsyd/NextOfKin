import { createHash, randomBytes } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { Readable, Writable } from "node:stream";

const CACHE_DIR = path.join(process.cwd(), ".cache", "voice");

export function cacheKey(parts: {
  scene: string;
  voiceId: string;
  modelId: string;
  text: string;
}): string {
  return createHash("sha256")
    .update(`${parts.scene}|${parts.voiceId}|${parts.modelId}|${parts.text}`)
    .digest("hex");
}

function cachePath(key: string): string {
  return path.join(CACHE_DIR, `${key}.mp3`);
}

export async function readCachedStream(
  key: string,
): Promise<{ stream: ReadableStream<Uint8Array>; size: number } | null> {
  const file = cachePath(key);
  try {
    const info = await stat(file);
    if (!info.isFile() || info.size === 0) return null;
    const node = createReadStream(file);
    return {
      stream: Readable.toWeb(node) as ReadableStream<Uint8Array>,
      size: info.size,
    };
  } catch {
    return null;
  }
}

export async function writeCacheSink(key: string): Promise<WritableStream<Uint8Array>> {
  await mkdir(CACHE_DIR, { recursive: true });
  const final = cachePath(key);
  const tmp = `${final}.${randomBytes(6).toString("hex")}.tmp`;
  const node = createWriteStream(tmp);
  const webWritable = Writable.toWeb(node) as WritableStream<Uint8Array>;

  // When the underlying file is fully written, atomically rename. If anything
  // goes wrong, clean up the temp file so we never serve a half-written cache.
  node.on("finish", () => {
    rename(tmp, final).catch(async () => {
      await unlink(tmp).catch(() => {});
    });
  });
  node.on("error", async () => {
    await unlink(tmp).catch(() => {});
  });

  return webWritable;
}
