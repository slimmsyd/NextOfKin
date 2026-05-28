"use client";

import { useState } from "react";
import { Button } from "@/components/forms";
import { VoiceNarrator } from "@/components/voice";
import { acceptConsentAction } from "@/lib/setup/consent";

type LedgerItem = { title: string; body: string };

const PROMISE: LedgerItem[] = [
  {
    title: "We encrypt everything",
    body: "Your record is encrypted on our servers and on your device. Not even our team reads it.",
  },
  {
    title: "We never sell your data",
    body: "No advertising, no brokers, no partners. The product is paid for by you, not by your information.",
  },
  {
    title: "Nothing leaves without you",
    body: "We do not share with family, attorneys, or beneficiaries unless you explicitly direct us to.",
  },
  {
    title: "You can take it with you",
    body: "Export your full record as a portable document anytime. Close your account and we delete it.",
  },
];

const ASK: LedgerItem[] = [
  {
    title: "Tell us what is true",
    body: "Names, dates, accounts, as best you know them. We will help you reach the right detail later.",
  },
  {
    title: "Keep your sign-in safe",
    body: "Use a real phone number or an authenticator app. This is the lock on the cabinet.",
  },
  {
    title: "Update when life changes",
    body: "A marriage, a birth, a new home. A few minutes from you keeps the record honest.",
  },
];

function Ledger({
  heading,
  items,
  numberClass,
}: {
  heading: string;
  items: LedgerItem[];
  numberClass: string;
}) {
  return (
    <div>
      <h2 className="pb-3 border-b border-surface-lavender-300 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
        {heading}
      </h2>
      <ul>
        {items.map((item, i) => (
          <li
            key={item.title}
            className="grid grid-cols-[28px_1fr] gap-3 py-4 border-b border-surface-lavender-200 last:border-b-0"
          >
            <span
              aria-hidden
              className={`font-serif italic text-[18px] leading-none ${numberClass}`}
            >
              {i + 1}
            </span>
            <div>
              <p className="text-[15px] font-medium text-foreground">
                {item.title}
              </p>
              <p className="mt-1 text-[13.5px] leading-[1.55] text-foreground/60">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SetupConsent() {
  const [accepted, setAccepted] = useState(false);

  return (
    <section className="w-full max-w-3xl mx-auto px-6 md:px-10 py-12 md:py-20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
        Before we start
      </p>
      <h1 className="mt-4 font-serif text-3xl md:text-4xl lg:text-[2.85rem] text-foreground leading-[1.08] tracking-tight">
        What we{" "}
        <span className="italic text-brand-indigo">promise</span>, and what we{" "}
        <span className="italic text-brand-indigo">ask</span> back.
      </h1>

      <VoiceNarrator scene="consent" className="mt-4" />

      <div className="mt-10 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <Ledger
          heading="Our promise"
          items={PROMISE}
          numberClass="text-brand-indigo"
        />
        <Ledger
          heading="In return, we ask"
          items={ASK}
          numberClass="text-foreground/40"
        />
      </div>

      <form
        action={acceptConsentAction}
        className="mt-10 rounded-2xl border border-surface-lavender-300 bg-white p-5 md:p-6"
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-indigo cursor-pointer"
          />
          <span className="text-[14px] leading-[1.5] text-foreground/80">
            I&rsquo;ve read and accept how NextOfKin handles my information.
          </span>
        </label>

        <div className="mt-5 flex justify-end">
          <Button type="submit" variant="primary" disabled={!accepted}>
            I understand, let&rsquo;s continue
            <span aria-hidden>&rarr;</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
