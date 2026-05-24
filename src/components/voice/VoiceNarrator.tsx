"use client";

import { useVoiceScene } from "./useVoiceScene";
import type { SceneKey } from "@/lib/voice/scenes";

function WaveIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M5 12v0M9 8v8M13 5v14M17 8v8M21 12v0" />
    </svg>
  );
}

type VoiceNarratorProps = {
  scene: SceneKey;
  /** Optional className for the wrapper row. */
  className?: string;
};

/**
 * Drop-in voiceover indicator for a phase/step page. The actual audio
 * element lives in the root layout's VoiceProvider — this component only
 * triggers playback and shows the "Speaking · Skip" affordance. Autoplay
 * works on every page because the audio element survives SPA navigations.
 */
export function VoiceNarrator({ scene, className }: VoiceNarratorProps) {
  const { status, skip } = useVoiceScene(scene);

  const showSkip = status === "playing" || status === "loading";
  const hidden = !showSkip;

  return (
    <div
      className={[
        "flex items-center gap-2 text-[12px] text-foreground/60",
        hidden ? "opacity-0 pointer-events-none h-0" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={hidden}
    >
      {showSkip ? (
        <>
          <span
            aria-hidden
            className="inline-flex items-center gap-1.5 text-brand-indigo"
          >
            <WaveIcon />
            <span className="font-medium uppercase tracking-[0.18em] text-[11px]">
              {status === "loading" ? "Loading" : "Speaking"}
            </span>
          </span>
          <span aria-hidden className="text-foreground/30">
            ·
          </span>
          <button
            type="button"
            onClick={skip}
            className="cursor-pointer inline-flex items-center gap-1 text-foreground/55 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/40 rounded-sm"
            aria-label="Skip the voiceover"
          >
            Skip
            <span aria-hidden>&rsaquo;&rsaquo;</span>
          </button>
        </>
      ) : null}
    </div>
  );
}
