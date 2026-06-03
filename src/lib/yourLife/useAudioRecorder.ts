"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Microphone capture for the Your Life intake. V1 is record-then-transcribe: tap to
// record, tap again to stop, we POST the audio to /api/your-life/transcribe and get
// text back. The hook owns the MediaStream lifecycle and GUARANTEES track teardown
// (a leaked mic track leaves the OS recording indicator on).
//
// SEAM: evolve to live word-by-word streaming later (ElevenLabs realtime or Deepgram
// over a WebSocket), which would stream partial transcripts as the user speaks and
// replace this record-then-send flow. Do NOT pre-build it. See ADR-002.

export type RecorderPhase = "idle" | "recording" | "transcribing" | "error";
export type RecorderError = "denied" | "other";

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

type UseAudioRecorderResult = {
  phase: RecorderPhase;
  elapsed: string;
  error: RecorderError | null;
  start: () => Promise<void>;
  stopAndTranscribe: () => Promise<string>;
  cancel: () => void;
};

export function useAudioRecorder(): UseAudioRecorderResult {
  const [phase, setPhase] = useState<RecorderPhase>("idle");
  const [error, setError] = useState<RecorderError | null>(null);
  const [seconds, setSeconds] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const teardown = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      try {
        recorderRef.current.stop();
      } catch {
        // Recorder already stopped; nothing to do.
      }
    }
    recorderRef.current = null;
    releaseStream();
    chunksRef.current = [];
  }, [releaseStream]);

  const start = useCallback(async () => {
    setError(null);
    setSeconds(0);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      const denied =
        e instanceof DOMException &&
        (e.name === "NotAllowedError" || e.name === "SecurityError");
      setError(denied ? "denied" : "other");
      setPhase("error");
      return;
    }
    streamRef.current = stream;
    chunksRef.current = [];
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorderRef.current = recorder;
    recorder.start();
    setPhase("recording");
    tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stopAndTranscribe = useCallback(async (): Promise<string> => {
    const recorder = recorderRef.current;
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    // Flush the recorder and assemble the blob.
    const blob = await new Promise<Blob>((resolve) => {
      if (!recorder || recorder.state === "inactive") {
        resolve(new Blob(chunksRef.current, { type: "audio/webm" }));
        return;
      }
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      };
      try {
        recorder.stop();
      } catch {
        resolve(new Blob(chunksRef.current, { type: "audio/webm" }));
      }
    });

    // Release the mic the moment we have the audio.
    recorderRef.current = null;
    releaseStream();

    if (blob.size === 0) {
      setError("other");
      setPhase("error");
      return "";
    }

    setPhase("transcribing");
    try {
      const form = new FormData();
      form.append("file", blob, "answer.webm");
      const res = await fetch("/api/your-life/transcribe", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`transcribe ${res.status}`);
      const data = (await res.json()) as { text?: string };
      const text = (data.text ?? "").trim();
      if (!text) {
        setError("other");
        setPhase("error");
        return "";
      }
      setPhase("idle");
      return text;
    } catch {
      setError("other");
      setPhase("error");
      return "";
    }
  }, [releaseStream]);

  const cancel = useCallback(() => {
    teardown();
    setError(null);
    setSeconds(0);
    setPhase("idle");
  }, [teardown]);

  // Guaranteed teardown on unmount (releases the mic track).
  useEffect(() => teardown, [teardown]);

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return {
    phase,
    elapsed: `${mm}:${ss}`,
    error,
    start,
    stopAndTranscribe,
    cancel,
  };
}
