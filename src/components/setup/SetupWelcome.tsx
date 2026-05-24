"use client";

import { useEffect, useState } from "react";
import { LinkButton } from "@/components/forms";
import { useVoiceScene } from "@/components/voice";

function LockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4 text-brand-indigo"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function SetupWelcome({ firstName }: { firstName: string }) {
  const { status, audioRef, payload, skip, play } = useVoiceScene("welcome");
  const [revealed, setRevealed] = useState(0);
  const error = status === "error" ? "Couldn't load the welcome audio." : null;

  // Drive text reveal off audio.currentTime via the alignment table. The rAF
  // loop is started/stopped by the audio's own play/pause/ended events so it
  // also restarts when the user resumes via the "Tap to hear" affordance.
  useEffect(() => {
    if (!payload || !audioRef.current) return;
    const audio = audioRef.current;
    const endTimes = payload.alignment.endTimes;
    let raf = 0;
    let running = false;

    const tick = () => {
      const t = audio.currentTime;
      let lo = 0;
      let hi = endTimes.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (endTimes[mid] <= t) lo = mid + 1;
        else hi = mid;
      }
      setRevealed(lo);
      if (running) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    };

    audio.addEventListener("play", start);
    audio.addEventListener("playing", start);
    audio.addEventListener("pause", stop);
    audio.addEventListener("ended", stop);

    if (!audio.paused) start();

    return () => {
      stop();
      audio.removeEventListener("play", start);
      audio.removeEventListener("playing", start);
      audio.removeEventListener("pause", stop);
      audio.removeEventListener("ended", stop);
    };
  }, [payload, audioRef]);

  const done = status === "ended" || status === "error";
  const fullText = payload?.text ?? "";
  // When Skip is hit or audio errors, render the full text immediately.
  const visibleText = done ? fullText : fullText.slice(0, revealed);
  const needsGesture = status === "needsGesture";

  return (
    <section className="w-full max-w-2xl mx-auto px-6 md:px-10 py-14 md:py-24">
      <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] text-foreground leading-[1.05] tracking-tight">
        Hi {firstName},{" "}
        <span className="italic text-brand-indigo">welcome.</span>
      </h1>

      <div
        className="mt-10 md:mt-12 text-foreground/80 text-[17px] md:text-lg leading-[1.7] min-h-[7em]"
        aria-live="polite"
        aria-busy={!done}
      >
        <p>
          {visibleText}
          {!done && payload ? (
            <span
              aria-hidden
              className="inline-block w-[2px] h-[1em] -mb-[0.15em] ml-[2px] bg-brand-indigo align-baseline animate-pulse"
            />
          ) : null}
        </p>
        {!payload && !error ? (
          <p className="opacity-0" aria-hidden>
            &nbsp;
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {needsGesture ? (
          <button
            type="button"
            onClick={play}
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-indigo/30 text-brand-indigo text-sm font-medium hover:bg-brand-indigo/5 transition-colors"
          >
            <PlayIcon />
            Tap to hear the welcome
          </button>
        ) : null}
        {payload && !done ? (
          <button
            type="button"
            onClick={skip}
            className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm text-foreground/55 hover:text-foreground hover:bg-foreground/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/40"
            aria-label="Skip the welcome audio and show the full text"
          >
            Skip
            <span aria-hidden>&rsaquo;&rsaquo;</span>
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-[#B23B3B]">{error}</p>
      ) : null}

      <div className="mt-12 md:mt-14 flex flex-col sm:flex-row sm:items-center gap-4">
        <LinkButton href="/setup/protect" variant="primary" disabled={!done}>
          Continue
          <span aria-hidden>&rarr;</span>
        </LinkButton>
        <p
          className={`text-sm text-foreground/55 transition-opacity duration-300 ${
            done ? "opacity-100" : "opacity-0"
          }`}
        >
          Next, we&rsquo;ll set up how you sign in.
        </p>
      </div>

      <div className="mt-16 md:mt-20 pt-6 border-t border-surface-lavender-300 flex items-center gap-2 text-sm text-foreground/60">
        <LockIcon />
        <span>Your information is encrypted on our end and yours.</span>
      </div>
    </section>
  );
}
