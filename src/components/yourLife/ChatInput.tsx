"use client";

import { useEffect, useRef, useState } from "react";

import { useSpeechRecognition } from "@/lib/yourLife/useSpeechRecognition";

type ChatInputProps = {
  disabled: boolean;
  onSubmit: (text: string) => void;
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

export function ChatInput({ disabled, onSubmit }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const onFinalTranscript = (text: string) => {
    setValue((prev) => (prev ? `${prev} ${text}` : text));
  };

  const { supported, listening, interim, start, stop } =
    useSpeechRecognition(onFinalTranscript);

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
    onSubmit(trimmed);
    setValue("");
    stop();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;
  const displayValue = listening && interim ? `${value} ${interim}`.trim() : value;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="border-t border-surface-lavender-300 bg-surface-lavender-100 px-4 py-3"
    >
      <div className="flex items-end gap-2 rounded-2xl bg-white border border-surface-lavender-300 focus-within:border-brand-indigo/40 px-3 py-2 transition-colors">
        <textarea
          ref={textareaRef}
          value={displayValue}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type or tap the mic"
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-[15px] leading-[1.5] py-1.5 placeholder:text-foreground/40 max-h-40"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => (listening ? stop() : start())}
          disabled={!supported}
          title={
            supported
              ? listening
                ? "Stop listening"
                : "Tap to speak"
              : "Voice input is not supported in this browser"
          }
          className={[
            "p-2 rounded-full transition-colors",
            supported
              ? listening
                ? "bg-brand-indigo/10"
                : "hover:bg-surface-lavender-200"
              : "opacity-40 cursor-not-allowed",
          ].join(" ")}
          aria-pressed={listening}
          aria-label="Voice input"
        >
          <MicIcon listening={listening} />
        </button>
        <button
          type="submit"
          disabled={!canSend}
          className={[
            "p-2 rounded-full transition-colors",
            canSend
              ? "bg-brand-indigo text-white hover:bg-brand-violet"
              : "bg-surface-lavender-300 text-foreground/40 cursor-not-allowed",
          ].join(" ")}
          aria-label="Send"
        >
          <SendIcon />
        </button>
      </div>
      {listening ? (
        <p className="mt-1.5 px-1 text-[11px] text-foreground/55">
          Listening… <span className="text-foreground/40">say what&rsquo;s true</span>
        </p>
      ) : null}
    </form>
  );
}
