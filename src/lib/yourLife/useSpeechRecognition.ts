"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionAlternative = { transcript: string };
type SpeechRecognitionResult = {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
};
type SpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
};
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const SILENCE_TIMEOUT_MS = 8000;

type UseSpeechRecognitionResult = {
  supported: boolean;
  listening: boolean;
  interim: string;
  start: () => void;
  stop: () => void;
};

/**
 * Web Speech API hook. Returns `supported: false` on browsers without it
 * (Firefox today, plus older Safari/Edge). On supported browsers, exposes a
 * toggle plus the latest interim transcript so the input can render gray
 * preview text while the user is speaking.
 */
export function useSpeechRecognition(
  onFinal: (text: string) => void,
): UseSpeechRecognitionResult {
  const [supported] = useState<boolean>(() => getCtor() !== null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const stop = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  const resetSilence = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(stop, SILENCE_TIMEOUT_MS);
  }, [stop]);

  const start = useCallback(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    if (recRef.current) return;

    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interimText = "";
      let finalText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0]?.transcript ?? "";
        if (r.isFinal) finalText += t;
        else interimText += t;
      }
      if (interimText) setInterim(interimText);
      if (finalText) {
        setInterim("");
        onFinalRef.current(finalText.trim());
      }
      resetSilence();
    };
    rec.onerror = () => stop();
    rec.onend = () => stop();

    recRef.current = rec;
    setListening(true);
    setInterim("");
    resetSilence();
    try {
      rec.start();
    } catch {
      stop();
    }
  }, [resetSilence, stop]);

  // Cleanup on unmount or tab blur
  useEffect(() => {
    const onBlur = () => stop();
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("blur", onBlur);
      stop();
    };
  }, [stop]);

  return { supported, listening, interim, start, stop };
}
