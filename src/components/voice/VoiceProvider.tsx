"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";
import type { SceneKey } from "@/lib/voice/scenes";
import type {
  VoiceAlignment,
  VoiceScenePayload,
  VoiceStatus,
} from "./useVoiceScene";

type SceneCacheEntry = {
  audioUrl: string;
  payload: VoiceScenePayload;
};

type VoiceContextValue = {
  audioRef: RefObject<HTMLAudioElement | null>;
  currentScene: SceneKey | null;
  status: VoiceStatus;
  payload: VoiceScenePayload | null;
  alignment: VoiceAlignment | null;
  playScene: (scene: SceneKey) => Promise<void>;
  skip: () => void;
  retry: () => void;
};

const VoiceContext = createContext<VoiceContextValue | null>(null);

function base64ToBlob(base64: string, mime: string): Blob {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function heardKey(scene: SceneKey): string {
  return `nok_voice_heard:${scene}`;
}

function wasHeard(scene: SceneKey): boolean {
  try {
    return Boolean(
      typeof window !== "undefined" &&
        window.sessionStorage.getItem(heardKey(scene)),
    );
  } catch {
    return false;
  }
}

function markHeard(scene: SceneKey) {
  try {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(heardKey(scene), "1");
    }
  } catch {
    /* ignore */
  }
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sceneCache = useRef<Map<SceneKey, SceneCacheEntry>>(new Map());
  const inFlight = useRef<Map<SceneKey, Promise<SceneCacheEntry>>>(new Map());

  const [currentScene, setCurrentScene] = useState<SceneKey | null>(null);
  const [payload, setPayload] = useState<VoiceScenePayload | null>(null);
  const [status, setStatus] = useState<VoiceStatus>("idle");

  // Wire audio element events to status. One subscription for the lifetime
  // of the provider — the element itself survives every SPA navigation.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setStatus("playing");
    const onEnded = () => {
      setStatus("ended");
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const fetchScene = useCallback(
    async (scene: SceneKey): Promise<SceneCacheEntry> => {
      const cached = sceneCache.current.get(scene);
      if (cached) return cached;
      const pending = inFlight.current.get(scene);
      if (pending) return pending;
      const p = (async () => {
        const res = await fetch(`/api/voice/${scene}`, { method: "POST" });
        if (!res.ok) throw new Error(`Voice fetch failed (${res.status})`);
        const data = (await res.json()) as VoiceScenePayload;
        const blob = base64ToBlob(data.audioBase64, "audio/mpeg");
        const audioUrl = URL.createObjectURL(blob);
        const entry: SceneCacheEntry = { audioUrl, payload: data };
        sceneCache.current.set(scene, entry);
        inFlight.current.delete(scene);
        return entry;
      })();
      inFlight.current.set(scene, p);
      return p;
    },
    [],
  );

  const playScene = useCallback(
    async (scene: SceneKey) => {
      // Same scene already running — don't restart.
      if (currentScene === scene && status === "playing") return;

      // Already heard this scene in this session — skip silently. Consumers
      // see status === "ended" so the Skip UI never appears.
      if (wasHeard(scene)) {
        setCurrentScene(scene);
        setStatus("ended");
        const cached = sceneCache.current.get(scene);
        if (cached) setPayload(cached.payload);
        return;
      }

      setCurrentScene(scene);
      setStatus("loading");
      try {
        const { audioUrl, payload: scenePayload } = await fetchScene(scene);
        setPayload(scenePayload);
        const audio = audioRef.current;
        if (!audio) return;
        audio.src = audioUrl;
        audio.currentTime = 0;
        try {
          await audio.play();
          // 'play' event handler will flip status → "playing".
        } catch {
          setStatus("needsGesture");
        }
      } catch {
        setStatus("error");
      }
    },
    [currentScene, status, fetchScene],
  );

  const skip = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = audio.duration || 0;
    }
    setStatus("ended");
    if (currentScene) markHeard(currentScene);
  }, [currentScene]);

  const retry = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(() => setStatus("needsGesture"));
  }, []);

  // Mark a scene as heard the first time playback completes naturally.
  useEffect(() => {
    if (status === "ended" && currentScene) markHeard(currentScene);
  }, [status, currentScene]);

  // Pre-warm scenes that aren't fetched yet so future navigations are instant.
  useEffect(() => {
    if (!currentScene) return;
    const scenesToWarm: SceneKey[] = ["welcome", "protect", "about-you"];
    for (const s of scenesToWarm) {
      if (s === currentScene) continue;
      if (sceneCache.current.has(s)) continue;
      // Fire-and-forget; result populates the cache.
      fetchScene(s).catch(() => {
        /* ignore */
      });
    }
  }, [currentScene, fetchScene]);

  // Revoke blob URLs when the provider unmounts (full app teardown).
  useEffect(() => {
    const cache = sceneCache.current;
    return () => {
      for (const entry of cache.values()) {
        URL.revokeObjectURL(entry.audioUrl);
      }
      cache.clear();
    };
  }, []);

  const value: VoiceContextValue = {
    audioRef,
    currentScene,
    status,
    payload,
    alignment: payload?.alignment ?? null,
    playScene,
    skip,
    retry,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
      {/* The single audio element for the whole app. Survives every SPA nav. */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        aria-hidden
        className="sr-only"
      />
    </VoiceContext.Provider>
  );
}

export function useVoice(): VoiceContextValue {
  const v = useContext(VoiceContext);
  if (!v) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return v;
}
