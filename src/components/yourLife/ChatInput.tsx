"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useAudioRecorder } from "@/lib/yourLife/useAudioRecorder";
import type { Suggestion } from "@/lib/yourLife/interviewFlow";
import { RecommendedQuestions } from "./RecommendedQuestions";
import { VoiceCaptureInline } from "./VoiceCaptureInline";

type ChatInputProps = {
  disabled: boolean;
  onSubmit: (
    text: string,
    inputMethod: "voice" | "text",
    chipSource?: string | null,
  ) => void;
  suggestions?: Suggestion[];
};

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={`w-4 h-4 ${listening ? "text-brand-indigo" : "text-foreground/55"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

export function ChatInput({ disabled, onSubmit, suggestions }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [capturing, setCapturing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  // Tracks whether the pending text came from the mic (drives voice read-back of
  // binding fields). Flips to false the moment the user types manually.
  const voiceUsedRef = useRef(false);
  // Which recommended-question chip (if any) seeded the pending text. Flips to null
  // on manual edit. Captured per turn for chip tap-through analytics.
  const chipSourceRef = useRef<string | null>(null);

  // The mic opens the capture morph (below). The recorder captures audio and, on
  // confirm, transcribes it server-side; the text only lands in the composer when the
  // user confirms.
  const { phase, elapsed, error, start, stopAndTranscribe, cancel } =
    useAudioRecorder();

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(
      trimmed,
      voiceUsedRef.current ? "voice" : "text",
      chipSourceRef.current,
    );
    setValue("");
    voiceUsedRef.current = false;
    chipSourceRef.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Prefill (never auto-send): drop the question into the composer so the user
  // can edit it, then send. A picked question is typed, not voice.
  const pick = (text: string, chipId: string) => {
    voiceUsedRef.current = false;
    chipSourceRef.current = chipId;
    setValue(text);
    const el = textareaRef.current;
    if (el) {
      el.focus();
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = el.value.length;
      });
    }
  };

  // Open the capture morph and start recording. Intentionally NOT gated on
  // `disabled`/streaming. Voice is first-class, so the user can begin speaking their
  // answer while Ava is still finishing; send stays locked during streaming, so there
  // is no premature-submit race.
  const openCapture = () => {
    setCapturing(true);
    void start();
  };

  // Stop recording, transcribe, and drop the text into the composer (focused, never
  // auto-sent). Empty/failed transcription leaves the morph open in its error state.
  const handleConfirm = async () => {
    const captured = await stopAndTranscribe();
    if (!captured) return;
    voiceUsedRef.current = true;
    chipSourceRef.current = null;
    setCapturing(false);
    setValue((prev) => (prev ? `${prev} ${captured}` : captured));
    const el = textareaRef.current;
    if (el) {
      el.focus();
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = el.value.length;
      });
    }
  };

  const handleRetry = () => {
    void start();
  };

  const handleCancel = useCallback(() => {
    cancel();
    setCapturing(false);
  }, [cancel]);

  // Escape cancels an in-progress capture, even when focus is on a capture button.
  useEffect(() => {
    if (!capturing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [capturing, handleCancel]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="border-t border-surface-lavender-300 bg-surface-lavender-100 px-4 py-3"
    >
      {capturing ? (
        <VoiceCaptureInline
          phase={phase === "idle" ? "recording" : phase}
          elapsedLabel={elapsed}
          error={error}
          onConfirm={handleConfirm}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      ) : (
        <>
          {suggestions && suggestions.length > 0 && !disabled ? (
            <RecommendedQuestions suggestions={suggestions} onPick={pick} />
          ) : null}
          <div className="flex items-end gap-2 rounded-2xl bg-white border border-surface-lavender-300 focus-within:border-brand-indigo/40 px-3 py-2 transition-colors">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                voiceUsedRef.current = false;
                chipSourceRef.current = null;
                setValue(e.target.value);
              }}
              onKeyDown={onKeyDown}
              placeholder="Type or tap the mic"
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-[15px] leading-[1.5] py-1.5 placeholder:text-foreground/40 max-h-40"
              disabled={disabled}
            />
            <button
              type="button"
              onClick={openCapture}
              title="Tap to speak"
              className="p-2 rounded-full transition-colors hover:bg-surface-lavender-200 cursor-pointer"
              aria-label="Voice input"
            >
              <MicIcon listening={false} />
            </button>
            <button
              type="submit"
              disabled={!canSend}
              className={[
                "p-2 rounded-full transition-colors",
                canSend
                  ? "bg-brand-indigo text-white hover:bg-brand-violet cursor-pointer"
                  : "bg-surface-lavender-300 text-foreground/40 cursor-not-allowed",
              ].join(" ")}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </div>
          {suggestions && suggestions.length > 0 && !disabled ? (
            <p className="mt-2 px-1 text-center text-[11px] text-foreground/45">
              Tap a recommended question to drop it in, edit it, then send.
            </p>
          ) : null}
        </>
      )}
    </form>
  );
}
