"use client";

import { useState } from "react";

const questions = [
  "Do you have children under 18?",
  "Do you own a home or land?",
  "Do you have life insurance or retirement accounts?",
  "Have you named who would speak for you in the hospital?",
];

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<("Yes" | "No")[]>([]);

  const isDone = step >= questions.length;
  const total = questions.length;

  const pick = (answer: "Yes" | "No") => {
    setAnswers([...answers, answer]);
    setStep(step + 1);
  };

  const next = () => {
    if (step < total) setStep(step + 1);
  };

  const reset = () => {
    setStep(0);
    setAnswers([]);
  };

  return (
    <section
      id="how-it-works"
      className="px-6 md:px-12 py-24 md:py-32 bg-surface-lavender-100"
    >
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-[11px] md:text-xs font-medium uppercase tracking-[0.18em] text-surface-dusty">
          How it works
        </p>
        <h2 className="mt-5 md:mt-6 font-serif font-normal tracking-tight text-4xl md:text-6xl lg:text-7xl leading-[1.05] max-w-3xl mx-auto">
          Build your plan in less than an hour.
        </h2>
        <p className="mt-6 md:mt-8 text-base md:text-lg text-foreground/70 max-w-xl mx-auto leading-relaxed">
          Answer a few questions and we&rsquo;ll guide you to the plan your
          family needs. This is what the first hour with NextOfKin feels like.
        </p>
      </div>

      {!isDone ? (
        <>
          <div className="mt-14 md:mt-16 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              {questions.map((_, i) => {
                const active = i === step;
                const past = i < step;
                return (
                  <span
                    key={i}
                    aria-hidden
                    className={`rounded-full transition-all duration-300 ${
                      active
                        ? "w-7 h-2 bg-brand-violet"
                        : past
                          ? "w-2 h-2 bg-brand-violet/45"
                          : "w-2 h-2 bg-surface-dusty/45"
                    }`}
                  />
                );
              })}
            </div>
            <p className="text-xs md:text-sm text-foreground/55">
              Question {step + 1} of {total}
            </p>
          </div>

          <div className="mt-8 md:mt-10 max-w-4xl mx-auto relative">
            <div className="bg-surface-lavender-300 rounded-3xl px-6 py-16 md:px-12 md:py-24 min-h-[320px] flex flex-col items-center justify-center">
              <h3 className="font-serif font-normal text-2xl md:text-4xl text-foreground text-center max-w-2xl leading-tight">
                {questions[step]}
              </h3>
              <div className="mt-10 md:mt-12 flex items-center gap-4">
                {(["Yes", "No"] as const).map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => pick(label)}
                    className="cursor-pointer min-w-[112px] md:min-w-[140px] px-6 py-4 md:py-5 rounded-2xl bg-surface-lavender-200 hover:bg-white text-foreground font-semibold text-base md:text-lg transition-colors shadow-[0_2px_8px_-2px_rgba(59,53,195,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-surface-lavender-300"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              aria-label="Skip to next question"
              onClick={next}
              className="cursor-pointer hidden md:inline-flex absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 items-center justify-center w-12 h-12 rounded-full bg-white text-foreground shadow-[0_4px_16px_-4px_rgba(10,10,15,0.15)] hover:shadow-[0_6px_20px_-4px_rgba(10,10,15,0.22)] hover:text-brand-violet transition-all"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>

          <p className="mt-8 md:mt-10 text-center text-xs md:text-sm text-foreground/50 max-w-2xl mx-auto px-4">
            We don&rsquo;t store your answers from this preview. The real
            intake is private, encrypted, and pauseable anytime.
          </p>
        </>
      ) : (
        <div className="mt-14 md:mt-16 max-w-3xl mx-auto bg-surface-lavender-300 rounded-3xl px-6 py-12 md:px-12 md:py-16 text-center">
          <p className="text-[11px] md:text-xs font-medium uppercase tracking-[0.18em] text-brand-violet">
            Your recommended plan
          </p>
          <h3 className="mt-4 font-serif font-normal text-2xl md:text-4xl text-foreground leading-tight max-w-2xl mx-auto">
            A full estate plan you and your family can actually follow.
          </h3>
          <p className="mt-5 md:mt-6 text-base md:text-lg text-foreground/70 leading-relaxed max-w-xl mx-auto">
            We&rsquo;ll walk you through it the rest of the way — about an
            hour, all conversational, voice or typed.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#cta"
              className="cursor-pointer inline-flex items-center justify-center px-7 py-3.5 bg-brand-indigo text-white rounded-full font-medium hover:bg-brand-violet transition-colors"
            >
              Start your plan
            </a>
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer inline-flex items-center justify-center px-7 py-3.5 text-foreground/70 hover:text-foreground rounded-full font-medium transition-colors"
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
