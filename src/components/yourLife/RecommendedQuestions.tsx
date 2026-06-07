"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { Suggestion } from "@/lib/yourLife/interviewFlow";

// "Recommended next questions" dock — sits just above the composer. Adopts the
// design in DesignSystem/source/chat-app.jsx (dock variant) using our tokens +
// Poppins. Tapping a chip prefills the composer (handled by the parent's
// onPick); it never sends on its own.

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" />
    </svg>
  );
}

type RecommendedQuestionsProps = {
  suggestions: Suggestion[];
  onPick: (text: string, id: string) => void;
};

export function RecommendedQuestions({
  suggestions,
  onPick,
}: RecommendedQuestionsProps) {
  const reduceMotion = useReducedMotion();
  if (suggestions.length === 0) return null;

  // Re-key on the set so a fresh batch remounts and re-runs the staggered entrance.
  const setKey = suggestions.map((s) => s.id).join("|");

  return (
    <div className="px-1 pt-1 pb-2.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
        <SparkIcon className="w-3 h-3 text-brand-violet" />
        Recommended next questions
      </div>
      <div key={setKey} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {suggestions.map((s, i) => (
          <motion.button
            key={s.id}
            type="button"
            onClick={() => onPick(s.text, s.id)}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.36, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }
            }
            className="group flex items-start gap-2.5 rounded-[14px] border border-brand-violet/20 bg-white px-3.5 py-3 text-left text-[13.5px] leading-snug text-foreground shadow-[0_1px_2px_rgba(34,30,68,0.04)] transition-colors cursor-pointer hover:border-brand-violet hover:bg-surface-lavender-300"
          >
            <span className="mt-px flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] bg-brand-violet/10">
              <SparkIcon className="w-3 h-3 text-brand-violet" />
            </span>
            <span className="flex-1">{s.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
