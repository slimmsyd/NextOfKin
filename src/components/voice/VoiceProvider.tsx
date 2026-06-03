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
import type { VoiceStatus } from "./useVoiceScene";

type VoiceContextValue = {
  audioRef: RefObject<HTMLAudioElement | null>;
  currentScene: SceneKey | null;
  status: VoiceStatus;
  playScene: (scene: SceneKey) => Promise<void>;
  skip: () => void;
};

const VoiceContext = createContext<VoiceContextValue | null>(null);

function sceneUrl(scene: SceneKey): string {
  return `/api/voice/${scene}`;
}

export function VoiceProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentScene, setCurrentScene] = useState<SceneKey | null>(null);
  const [status, setStatus] = useState<VoiceStatus>("idle");

  // Wire audio element events to status. One subscription for the lifetime
  // of the provider — the element itself survives every SPA navigation.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setStatus("playing");
    const onEnded = () => setStatus("ended");
    const onError = () => setStatus("error");
    audio.addEventListener("play", onPlay);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const playScene = useCallback(
    async (scene: SceneKey) => {
      // Same scene already running — don't restart.
      if (currentScene === scene && status === "playing") return;

      setCurrentScene(scene);
      setStatus("loading");
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = sceneUrl(scene);
      audio.currentTime = 0;
      try {
        await audio.play();
        // 'play' event handler will flip status → "playing".
      } catch {
        // Autoplay blocked by the browser. Body text already conveys the message,
        // so silently mark this scene done and move on — no UI surfaces.
        setStatus("ended");
      }
    },
    [currentScene, status],
  );

  const skip = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = audio.duration || 0;
    }
    setStatus("ended");
  }, []);

  // Pre-warm other scenes so subsequent navigations get instant playback
  // from the server disk cache + browser HTTP cache. Fire-and-forget.
  useEffect(() => {
    if (!currentScene) return;
    const scenesToWarm: SceneKey[] = ["welcome", "protect", "about-you"];
    for (const s of scenesToWarm) {
      if (s === currentScene) continue;
      fetch(sceneUrl(s), { cache: "force-cache" }).catch(() => {
        /* ignore */
      });
    }
  }, [currentScene]);

  const value: VoiceContextValue = {
    audioRef,
    currentScene,
    status,
    playScene,
    skip,
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
