"use client";

import { useState } from "react";

type Qa = {
  q: string;
  a: React.ReactNode;
};

const left: Qa[] = [
  {
    q: "Is this a will, or something more?",
    a: (
      <>
        <p>
          Both. The will is one piece. The rest is the living plan around
          it — your asset inventory, the people you protect, the day-of
          instructions your family will need to actually find and act on.
        </p>
      </>
    ),
  },
  {
    q: "Are the legal documents valid?",
    a: (
      <p>
        Yes. Templates are attorney-reviewed and state-specific. In V1 we
        cover North Carolina; additional states roll out one at a time, each
        with attorney sign-off.
      </p>
    ),
  },
  {
    q: "What about family land or heirs property?",
    a: (
      <p>
        Heirs property risk surfaces automatically when you mention family
        land. You&rsquo;ll see plain-language guidance and the specific
        documents that prevent forced partition sale.
      </p>
    ),
  },
  {
    q: "How much does it cost?",
    a: (
      <p>
        Under $50 to start. The plan isn&rsquo;t how we make money — we earn
        on the asset recovery and dissemination work that comes later, when
        your family needs it.
      </p>
    ),
  },
];

const right: Qa[] = [
  {
    q: "How do you know when something has happened?",
    a: (
      <p>
        We don&rsquo;t act on any single signal. Multiple independent
        sources — your own check-ins, trusted contacts, public records —
        have to converge, and every action has a 72-hour grace window that
        you or your people can reverse.
      </p>
    ),
  },
  {
    q: "Does an AI write my will?",
    a: (
      <p>
        No. The legal language comes from attorney-vetted templates.
        AI handles only the conversation that gathers your information —
        it never touches the legal core.
      </p>
    ),
  },
  {
    q: "Is my information safe?",
    a: (
      <p>
        Encrypted in transit and at rest, MFA on every account, full audit
        log on every read and write. We&rsquo;re building toward SOC 2.
      </p>
    ),
  },
  {
    q: "Who is this built for?",
    a: (
      <p>
        Black American families first. The product, the language, and the
        partnerships are built around how our families actually plan,
        grieve, and pass things on — not retrofitted from a generic tool.
      </p>
    ),
  },
];

function Item({
  qa,
  isOpen,
  onToggle,
}: {
  qa: Qa;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-surface-lavender-300">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="cursor-pointer w-full text-left py-6 flex items-start justify-between gap-6 group"
      >
        <span className="text-lg md:text-xl font-medium text-foreground group-hover:text-brand-indigo transition-colors">
          {qa.q}
        </span>
        <span
          aria-hidden
          className={`shrink-0 mt-1 text-xl text-brand-indigo transition-transform duration-200 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {isOpen && (
        <div className="pb-6 pr-10 text-base md:text-lg text-foreground/75 leading-relaxed space-y-3">
          {qa.a}
        </div>
      )}
    </div>
  );
}

function Column({ items, base }: { items: Qa[]; base: number }) {
  const [openIdx, setOpenIdx] = useState<number | null>(base === 0 ? 0 : null);
  return (
    <div>
      {items.map((qa, i) => (
        <Item
          key={qa.q}
          qa={qa}
          isOpen={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? null : i)}
        />
      ))}
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm font-medium uppercase tracking-widest text-surface-dusty">
          Questions
        </p>
        <h2 className="mt-6 text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight max-w-3xl leading-tight">
          The things people ask, before they trust us with this.
        </h2>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
          <Column items={left} base={0} />
          <Column items={right} base={1} />
        </div>
      </div>
    </section>
  );
}
