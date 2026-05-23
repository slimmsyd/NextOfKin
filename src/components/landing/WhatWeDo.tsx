"use client";

import Link from "next/link";
import { useState } from "react";

type Card = {
  step: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  motif: "intake" | "documents" | "network";
};

const cards: Card[] = [
  {
    step: "Step one",
    title: "A complete picture of your life",
    body: "Your home, your accounts, your insurance, your wishes, your people — all in one place. Built through a guided conversation that walks alongside you. Pause anytime. Pick up where you left off.",
    cta: { label: "See how the intake works", href: "#how-it-works" },
    motif: "intake",
  },
  {
    step: "Step two",
    title: "The legal documents your family needs",
    body: "Attorney-reviewed will, healthcare directive, and durable power of attorney — generated from your profile, valid in your state, kept current as your life changes.",
    cta: { label: "See the documents we generate", href: "#what-we-protect" },
    motif: "documents",
  },
  {
    step: "Step three",
    title: "A plan for the day your family needs it",
    body: "Who to call. What they'll find. How to reach the accounts. The instructions your family needs the day everything changes — not buried in a filing cabinet.",
    cta: { label: "See the day-of playbook", href: "#dont-stop" },
    motif: "network",
  },
];

function Motif({ kind }: { kind: Card["motif"] }) {
  if (kind === "intake") {
    return (
      <svg
        viewBox="0 0 240 240"
        className="w-2/3 max-w-[280px] h-auto opacity-80"
        aria-hidden
      >
        <rect
          x="60"
          y="60"
          width="120"
          height="120"
          rx="6"
          transform="rotate(45 120 120)"
          fill="rgba(155,131,255,0.55)"
        />
        <circle cx="50" cy="60" r="3" fill="rgba(255,255,255,0.7)" />
        <circle cx="190" cy="50" r="2" fill="rgba(255,255,255,0.6)" />
        <circle cx="200" cy="180" r="2.5" fill="rgba(255,255,255,0.6)" />
        <circle cx="55" cy="190" r="2" fill="rgba(255,255,255,0.5)" />
        <path
          d="M30 100 l8 0 m-4 -4 l0 8"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M210 130 l8 0 m-4 -4 l0 8"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === "documents") {
    return (
      <svg
        viewBox="0 0 240 240"
        className="w-2/3 max-w-[220px] h-auto opacity-80"
        aria-hidden
      >
        <path
          d="M70 150 L120 90 L170 150 L170 200 L70 200 Z"
          fill="rgba(255,255,255,0.18)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
        />
        <path
          d="M70 150 L120 90 L170 150"
          stroke="rgba(155,131,255,0.7)"
          strokeWidth="2"
          fill="none"
        />
        <rect
          x="108"
          y="160"
          width="24"
          height="40"
          fill="rgba(155,131,255,0.45)"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 240 240"
      className="w-2/3 max-w-[240px] h-auto opacity-80"
      aria-hidden
    >
      <line
        x1="60"
        y1="80"
        x2="180"
        y2="80"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
      <line
        x1="60"
        y1="80"
        x2="120"
        y2="170"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
      <line
        x1="180"
        y1="80"
        x2="120"
        y2="170"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.5"
      />
      <circle cx="60" cy="80" r="14" fill="rgba(155,131,255,0.6)" />
      <circle cx="180" cy="80" r="14" fill="rgba(155,131,255,0.6)" />
      <circle cx="120" cy="170" r="14" fill="rgba(155,131,255,0.6)" />
      <circle cx="60" cy="80" r="4" fill="white" opacity="0.9" />
      <circle cx="180" cy="80" r="4" fill="white" opacity="0.9" />
      <circle cx="120" cy="170" r="4" fill="white" opacity="0.9" />
    </svg>
  );
}

function ServiceCard({
  card,
  isActive,
  onActivate,
  onDeactivate,
}: {
  card: Card;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
      className={`group relative rounded-3xl overflow-hidden flex flex-col min-h-[440px] md:min-h-[520px] text-white text-left transition-[box-shadow,transform] duration-300 ${
        isActive
          ? "ring-2 ring-brand-violet shadow-[0_20px_40px_-15px_rgba(88,82,245,0.35)]"
          : "ring-1 ring-white/0 hover:shadow-[0_15px_30px_-15px_rgba(10,10,15,0.3)]"
      }`}
      style={{
        background:
          "linear-gradient(180deg, #8E89B8 0%, #4A4488 45%, #1F1A4D 100%)",
      }}
      aria-expanded={isActive}
    >
      <span
        className={`absolute top-6 left-6 md:top-7 md:left-7 text-[11px] md:text-xs uppercase tracking-[0.18em] text-white/85 z-10 transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
      >
        {card.step}
      </span>

      <div className="flex-1 flex items-center justify-center px-6 pt-12 pb-2">
        <Motif kind={card.motif} />
      </div>

      <div className="relative p-6 md:p-8 lg:p-10">
        <h3 className="text-xl md:text-2xl lg:text-[1.6rem] font-semibold leading-[1.2] tracking-tight max-w-md">
          {card.title}
        </h3>
        {isActive && (
          <>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-white/75 leading-relaxed max-w-md">
              {card.body}
            </p>
            <Link
              href={card.cta.href}
              className="mt-6 md:mt-7 inline-flex items-center gap-2 text-sm md:text-base text-white hover:text-white/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {card.cta.label}
              <span aria-hidden>&rarr;</span>
            </Link>
          </>
        )}
      </div>
    </button>
  );
}

export function WhatWeDo() {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIndex = hovered ?? 0;

  return (
    <section
      id="what-we-do"
      className="px-6 md:px-12 py-24 md:py-32 bg-surface-lavender-100"
    >
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-[11px] md:text-xs font-medium uppercase tracking-[0.18em] text-surface-dusty">
          A holistic service for your family
        </p>
        <h2 className="mt-5 md:mt-6 text-center font-serif font-normal tracking-tight text-4xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl mx-auto">
          One service for the three things every family needs.
        </h2>

        <div
          className="mt-14 md:mt-20 grid grid-cols-1 md:[grid-template-columns:var(--cols)] gap-4 md:gap-5 transition-[grid-template-columns] duration-500 ease-out"
          style={
            {
              "--cols": cards
                .map((_, i) => (i === activeIndex ? "2fr" : "1fr"))
                .join(" "),
            } as React.CSSProperties
          }
        >
          {cards.map((card, i) => (
            <ServiceCard
              key={i}
              card={card}
              isActive={i === activeIndex}
              onActivate={() => setHovered(i)}
              onDeactivate={() => setHovered(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
