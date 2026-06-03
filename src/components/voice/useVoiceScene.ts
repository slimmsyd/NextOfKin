"use client";

import { useEffect } from "react";
import type { SceneKey } from "@/lib/voice/scenes";
import { useVoice } from "./VoiceProvider";

export type VoiceStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "ended"
  | "error";

type UseVoiceSceneResult = {
  status: VoiceStatus;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  skip: () => void;
};

/**
 * Plays the given scene through the app-wide persistent audio element.
 * Autoplay works across SPA navigations because the audio element is
 * mounted in the root layout, not per-page.
 */
export function useVoiceScene(scene: SceneKey): UseVoiceSceneResult {
  const v = useVoice();

  useEffect(() => {
    void v.playScene(scene);
    // Only re-trigger when the scene key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  const isMine = v.currentScene === scene;

  return {
    status: isMine ? v.status : "idle",
    audioRef: v.audioRef,
    skip: v.skip,
  };
}
