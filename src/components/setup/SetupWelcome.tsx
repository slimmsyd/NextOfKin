"use client";

import { LinkButton } from "@/components/forms";
import { AvaIndicator, VoiceNarrator, useVoice } from "@/components/voice";
import { SCENES } from "@/lib/voice/scenes";

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

export function SetupWelcome({ firstName }: { firstName: string }) {
  // Body text is sourced from the static scene definition, not from the TTS
  // payload. The user reads in <100ms; voice plays over the text when ready.
  const bodyText = SCENES.welcome.text;

  // Observe the shared voice state for the waveform. VoiceNarrator below is the
  // single trigger that starts playback; this component only reads status.
  const { currentScene, status } = useVoice();
  const speaking = currentScene === "welcome" && status === "playing";

  return (
    <section className="w-full max-w-2xl mx-auto px-6 md:px-10 py-14 md:py-24">
      <AvaIndicator speaking={speaking} className="mb-8" />

      <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] text-foreground leading-[1.05] tracking-tight">
        Hi {firstName},{" "}
        <span className="italic text-brand-indigo">welcome.</span>
      </h1>

      <div className="mt-10 md:mt-12 text-foreground/80 text-[17px] md:text-lg leading-[1.7]">
        <p>{bodyText}</p>
      </div>

      <VoiceNarrator scene="welcome" className="mt-6" />

      <div className="mt-12 md:mt-14 flex flex-col sm:flex-row sm:items-center gap-4">
        <LinkButton href="/setup/consent" variant="primary">
          Let&rsquo;s begin
          <span aria-hidden>&rarr;</span>
        </LinkButton>
        <p className="text-sm text-foreground/55">
          Next, what we promise and what we ask of you.
        </p>
      </div>

      <div className="mt-16 md:mt-20 pt-6 border-t border-surface-lavender-300 flex items-center gap-2 text-sm text-foreground/60">
        <LockIcon />
        <span>Your information is encrypted on our end and yours.</span>
      </div>
    </section>
  );
}
