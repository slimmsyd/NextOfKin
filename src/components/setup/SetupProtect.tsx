"use client";

import { useState, useTransition } from "react";
import { LinkButton } from "@/components/forms";
import { VoiceNarrator } from "@/components/voice";
import { setMfaMethodAction, type MfaChoice } from "@/lib/setup/mfa";

function MessageIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function AuthAppIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-3.5 h-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

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

type OptionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  recommended?: boolean;
  selected: boolean;
  onSelect: () => void;
};

function OptionCard({
  icon,
  title,
  description,
  recommended,
  selected,
  onSelect,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group cursor-pointer w-full flex items-center gap-4 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/40 ${
        selected
          ? "bg-surface-lavender-200/60 border border-brand-indigo shadow-[0_8px_28px_rgba(59,53,195,0.08)]"
          : "bg-white border border-surface-lavender-300 hover:border-brand-indigo/40 hover:bg-surface-lavender-200/40"
      }`}
    >
      <span
        aria-hidden
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          selected
            ? "bg-brand-indigo text-white"
            : "bg-brand-indigo/10 text-brand-indigo"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="block text-[17px] font-semibold text-foreground">
            {title}
          </span>
          {recommended ? (
            <span className="inline-flex items-center rounded-full bg-brand-indigo px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-white">
              Recommended
            </span>
          ) : null}
        </span>
        <span className="block text-sm text-foreground/60 mt-0.5">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${
          selected
            ? "bg-brand-indigo border-brand-indigo text-white"
            : "border-surface-dusty text-transparent"
        }`}
      >
        <CheckIcon />
      </span>
    </button>
  );
}

const METHOD_LABEL: Record<MfaChoice, string> = {
  sms: "Text message",
  totp: "Authenticator app",
};

export function SetupProtect({
  initialMethod = null,
}: {
  initialMethod?: MfaChoice | null;
}) {
  const [selected, setSelected] = useState<MfaChoice | null>(initialMethod);
  const [, startTransition] = useTransition();

  function choose(method: MfaChoice) {
    setSelected(method);
    startTransition(() => {
      void setMfaMethodAction(method);
    });
  }

  return (
    <section className="w-full max-w-2xl mx-auto px-6 md:px-10 py-14 md:py-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
        Two-factor authentication
      </p>
      <h1 className="mt-4 font-serif text-4xl md:text-5xl lg:text-[3.5rem] text-foreground leading-[1.05] tracking-tight">
        Let&rsquo;s{" "}
        <span className="italic text-brand-indigo">protect</span> what you share
        with me.
      </h1>

      <p className="mt-6 md:mt-8 text-foreground/75 text-[17px] md:text-lg leading-[1.6] max-w-[40ch]">
        Pick how you&rsquo;d like to confirm it&rsquo;s you. We&rsquo;ll ask once
        a month on this device, more often on new ones.
      </p>

      <VoiceNarrator scene="protect" className="mt-4" />

      <div className="mt-10 md:mt-12 space-y-3">
        <OptionCard
          icon={<MessageIcon />}
          title="Text message"
          description="We'll send a 6-digit code to your phone each time you sign in."
          recommended
          selected={selected === "sms"}
          onSelect={() => choose("sms")}
        />
        <OptionCard
          icon={<AuthAppIcon />}
          title="Authenticator app"
          description="Use 1Password, Authy, or Google Authenticator. Most secure option."
          selected={selected === "totp"}
          onSelect={() => choose("totp")}
        />
      </div>

      {selected ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-foreground/2.5 px-4 py-3">
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-indigo text-white shrink-0"
          >
            <CheckIcon />
          </span>
          <p className="flex-1 text-[13.5px] text-foreground/70">
            {METHOD_LABEL[selected]} selected. We&rsquo;ll finish setting this up
            when sign-in protection turns on.
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <LinkButton href="/about-you" variant="primary" disabled={!selected}>
          Continue
          <span aria-hidden>&rarr;</span>
        </LinkButton>
        {!selected ? (
          <p className="text-sm text-foreground/55">
            Choose an option to continue.
          </p>
        ) : null}
      </div>

      <div className="mt-16 md:mt-20 pt-6 border-t border-surface-lavender-300 flex items-center gap-2 text-sm text-foreground/60">
        <LockIcon />
        <span>Your information is encrypted on our end and yours.</span>
      </div>
    </section>
  );
}
