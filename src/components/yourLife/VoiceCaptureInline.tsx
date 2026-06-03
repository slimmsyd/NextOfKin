"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { RecorderError } from "@/lib/yourLife/useAudioRecorder";

// Inline voice-capture morph (record-then-transcribe). Phase-driven status copy, not
// live words: V1 is batch transcription, so there are no per-word results to stream.
// SEAM: when live word-by-word streaming lands, this is where a live caption returns.
// See PlatformDocuments/ADR-002-speech-to-text-provider.md.

type VoiceCaptureInlineProps = {
  phase: "recording" | "transcribing" | "error";
  elapsedLabel: string;
  error: RecorderError | null;
  onConfirm: () => void; // recording -> stop and transcribe
  onRetry: () => void; // error -> record again
  onCancel: () => void; // discard and close
};

// Reactive audio waveform (decorative). Bars are JS-driven continuous geometry, so
// height/opacity stay inline; color comes from `currentColor` (text-brand-violet on
// the container). Real-amplitude is a cheap future upgrade since the recorder holds
// the mic stream, but the design calls for this animated look.
function Waveform({
  active,
  bars = 40,
  max = 34,
  min = 3,
}: {
  active: boolean;
  bars?: number;
  max?: number;
  min?: number;
}) {
  const [h, setH] = useState<number[] | null>(null);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setH(
        Array.from({ length: bars }, (_, i) => {
          const env = Math.sin((i / (bars - 1)) * Math.PI); // tall in the middle
          const r = Math.random();
          return min + env * (max - min) * (0.3 + 0.7 * r);
        }),
      );
    }, 90);
    return () => clearInterval(id);
  }, [active, bars, max, min]);

  const resting = Array.from({ length: bars }, () => min + 1);
  const heights = active && h ? h : resting;

  return (
    <div className="flex items-center justify-center gap-[3px] w-full text-brand-violet" style={{ height: max }}>
      {heights.map((v, i) => (
        <span
          key={i}
          className="w-[3px] shrink-0 rounded-[3px]"
          style={{
            height: Math.max(min, v),
            opacity: 0.45 + 0.55 * (v / max),
            background: "currentColor",
            transition: "height 110ms ease, opacity 110ms ease",
          }}
        />
      ))}
    </div>
  );
}

function CancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Discard voice capture"
      onClick={onClick}
      className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-surface-lavender-300 bg-white shadow-[0_1px_2px_rgba(34,30,68,0.05)] transition-colors hover:bg-surface-lavender-100"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          className="text-foreground/70"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

function ConfirmButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Use this answer"
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand-violet text-white shadow-[0_8px_22px_rgba(88,82,245,0.34)] transition-transform hover:scale-[1.03]"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 13l4 4L19 7"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function VoiceCaptureInline({
  phase,
  elapsedLabel,
  error,
  onConfirm,
  onRetry,
  onCancel,
}: VoiceCaptureInlineProps) {
  const reduceMotion = useReducedMotion();

  const recording = phase === "recording";
  const transcribing = phase === "transcribing";
  const denied = phase === "error" && error === "denied";

  const label = recording
    ? "Recording"
    : transcribing
      ? "Transcribing"
      : "Voice input";

  const body = recording
    ? "Recording your answer. Tap the check when you're done."
    : transcribing
      ? "Turning your words into text."
      : denied
        ? "Microphone access is blocked. Enable it in your browser settings, then tap the mic again."
        : "I didn't catch that. Want to try again?";

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="mt-[18px]"
    >
      {/* status card */}
      <div className="mb-3 rounded-2xl border border-surface-lavender-300 bg-white px-[18px] py-[14px] shadow-[0_4px_16px_rgba(34,30,68,0.05)]">
        <div className="mb-2 flex items-center gap-2">
          <span
            className={[
              "h-[7px] w-[7px] rounded-full",
              recording
                ? "bg-[#EF4444] animate-voice-blink"
                : transcribing
                  ? "bg-brand-violet animate-voice-blink"
                  : "bg-foreground/30",
            ].join(" ")}
          />
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
            {label}
          </span>
        </div>
        <p className="text-[15px] leading-normal text-foreground/80">{body}</p>
      </div>

      {/* control row */}
      <div className="flex items-center gap-3.5 rounded-[18px] border border-brand-violet/45 bg-white py-2 pl-[18px] pr-2 shadow-[0_0_0_4px_rgba(88,82,245,0.08),0_4px_16px_rgba(34,30,68,0.05)]">
        {recording || transcribing ? (
          <span className="flex shrink-0 items-center gap-[9px]">
            <span
              className={[
                "h-[9px] w-[9px] rounded-full animate-voice-blink",
                recording ? "bg-[#EF4444]" : "bg-brand-violet",
              ].join(" ")}
            />
            <span className="text-[13px] font-semibold tabular-nums text-foreground">
              {elapsedLabel}
            </span>
          </span>
        ) : null}
        <div className="min-w-0 flex-1 overflow-hidden">
          <Waveform active={recording && !reduceMotion} />
        </div>
        {phase === "error" && !denied ? (
          <button
            type="button"
            onClick={onRetry}
            className="flex h-9 shrink-0 cursor-pointer items-center rounded-full bg-brand-violet px-4 text-[13px] font-medium text-white transition-colors hover:bg-brand-violet-end"
          >
            Try again
          </button>
        ) : null}
        <CancelButton onClick={onCancel} />
        {recording ? <ConfirmButton onClick={onConfirm} /> : null}
      </div>

      {recording ? (
        <p className="mt-2.5 px-1 text-center text-[11px] text-foreground/45">
          Tap the check to turn your recording into text. You can edit it before sending.
        </p>
      ) : null}
    </motion.div>
  );
}
