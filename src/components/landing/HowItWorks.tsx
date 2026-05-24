"use client";

import Link from "next/link";
import { useState } from "react";

type TriageAnswer = "Yes" | "No";
type RecommendationKind =
  | "will_review"
  | "trust_conversation"
  | "beneficiary_check"
  | "healthcare_wishes"
  | "trusted_contact";

type TriageQuestion = {
  id:
    | "dependents"
    | "real_estate"
    | "beneficiary_accounts"
    | "trusted_person"
    | "healthcare_person";
  prompt: string;
  yesReason: string;
  recommendations: RecommendationKind[];
};

type TriageRecommendation = {
  kind: RecommendationKind;
  title: string;
  body: string;
  reasons: string[];
};

const questions: TriageQuestion[] = [
  {
    id: "dependents",
    prompt: "Do you have children under 18 or anyone who depends on you?",
    yesReason: "Because you said you have children or dependents.",
    recommendations: ["will_review", "trusted_contact"],
  },
  {
    id: "real_estate",
    prompt: "Do you own a home, land, or family land?",
    yesReason: "Because you said you own home or land.",
    recommendations: ["trust_conversation", "will_review"],
  },
  {
    id: "beneficiary_accounts",
    prompt: "Do you have life insurance, retirement, or named-beneficiary accounts?",
    yesReason:
      "Because you said you have accounts that may already name a beneficiary.",
    recommendations: ["beneficiary_check"],
  },
  {
    id: "trusted_person",
    prompt: "Is there someone you trust to handle accounts or paperwork if something happened?",
    yesReason:
      "Because you said there is someone you trust to handle important details.",
    recommendations: ["trusted_contact"],
  },
  {
    id: "healthcare_person",
    prompt: "Is there someone you trust to speak with doctors if you could not?",
    yesReason:
      "Because you said there is someone you trust for healthcare decisions.",
    recommendations: ["healthcare_wishes"],
  },
];

const recommendationOrder: RecommendationKind[] = [
  "will_review",
  "trust_conversation",
  "beneficiary_check",
  "healthcare_wishes",
  "trusted_contact",
];

const recommendationCopy: Record<
  RecommendationKind,
  Omit<TriageRecommendation, "reasons">
> = {
  will_review: {
    kind: "will_review",
    title: "A will may be useful to review",
    body: "This is where families often name who should receive property, who should handle the estate, and who should care for minor children.",
  },
  trust_conversation: {
    kind: "trust_conversation",
    title: "A trust conversation may be worth having",
    body: "Home, land, and family land can raise probate, privacy, and heirs-property questions that deserve a careful review.",
  },
  beneficiary_check: {
    kind: "beneficiary_check",
    title: "Beneficiary designations may need checking",
    body: "Some accounts can pass by the names already on file, so the intake should compare those names against your wishes.",
  },
  healthcare_wishes: {
    kind: "healthcare_wishes",
    title: "Healthcare wishes may need documenting",
    body: "Your plan should make it easier for your people to know who can speak up and what you would want.",
  },
  trusted_contact: {
    kind: "trusted_contact",
    title: "Executor/trusted contact choices need naming",
    body: "NextOfKin should help you name the people your family can rely on, then keep those roles clear in your profile.",
  },
};

const starterRecommendation: TriageRecommendation = {
  kind: "trusted_contact",
  title: "Start with a basic profile and trusted contacts",
  body: "The first useful step is still simple: gather your core details, name the people you trust, and see what gaps show up in intake.",
  reasons: [
    "Because you did not flag a specific planning need in this preview.",
  ],
};

function getRecommendations(answers: TriageAnswer[]): TriageRecommendation[] {
  const reasonsByKind = new Map<RecommendationKind, string[]>();

  answers.forEach((answer, index) => {
    if (answer !== "Yes") return;
    const question = questions[index];
    if (!question) return;

    question.recommendations.forEach((kind) => {
      const reasons = reasonsByKind.get(kind) ?? [];
      reasons.push(question.yesReason);
      reasonsByKind.set(kind, reasons);
    });
  });

  const recommendations = recommendationOrder
    .filter((kind) => reasonsByKind.has(kind))
    .map((kind) => ({
      ...recommendationCopy[kind],
      reasons: reasonsByKind.get(kind) ?? [],
    }));

  return recommendations.length > 0 ? recommendations : [starterRecommendation];
}

export function HowItWorks() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<TriageAnswer[]>([]);

  const isDone = step >= questions.length;
  const total = questions.length;
  const recommendations = getRecommendations(answers);

  const pick = (answer: TriageAnswer) => {
    setAnswers([...answers, answer]);
    setStep(step + 1);
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
          Answer a few questions and see the kinds of gaps intake may surface.
          This preview is not legal advice, and nothing here gets stored.
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
                {questions[step]?.prompt}
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
          </div>

          <p className="mt-8 md:mt-10 text-center text-xs md:text-sm text-foreground/50 max-w-2xl mx-auto px-4">
            We don&rsquo;t store your answers from this preview. The real
            intake is private, encrypted, and pauseable anytime.
          </p>
        </>
      ) : (
        <div className="mt-14 md:mt-16 max-w-4xl mx-auto bg-surface-lavender-300 rounded-3xl px-6 py-12 md:px-12 md:py-16">
          <div className="text-center">
            <p className="text-[11px] md:text-xs font-medium uppercase tracking-[0.18em] text-brand-violet">
              What your plan may need
            </p>
            <h3 className="mt-4 font-serif font-normal text-2xl md:text-4xl text-foreground leading-tight max-w-2xl mx-auto">
              A few areas may be worth reviewing in intake.
            </h3>
            <p className="mt-5 md:mt-6 text-base md:text-lg text-foreground/70 leading-relaxed max-w-xl mx-auto">
              These are careful flags, not legal advice. The real intake will
              confirm what applies before anything becomes part of your profile.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-3 text-left">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.kind}
                className="rounded-2xl bg-white/70 border border-white px-5 py-5 md:px-6 md:py-6"
              >
                <h4 className="text-base md:text-lg font-semibold text-foreground leading-snug">
                  {recommendation.title}
                </h4>
                <p className="mt-2 text-sm md:text-base text-foreground/70 leading-relaxed">
                  {recommendation.body}
                </p>
                <ul className="mt-4 space-y-2">
                  {recommendation.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="text-xs md:text-sm text-foreground/55 leading-relaxed"
                    >
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs md:text-sm text-foreground/50">
            This preview is not legal advice and does not store your answers.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="cursor-pointer inline-flex items-center justify-center px-7 py-3.5 bg-brand-indigo text-white rounded-full font-medium hover:bg-brand-violet transition-colors"
            >
              Start your plan
            </Link>
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
