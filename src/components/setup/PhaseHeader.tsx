import type { ReactNode } from "react";

type PhaseHeaderProps = {
  phase: number;
  phaseLabel: string;
  totalPhases?: number;
  /** Left side, before phase label — e.g. setup back control. */
  back?: ReactNode;
  /** Right side: either a step indicator (provide step/stepCount) or any node via rightSlot. */
  step?: number;
  stepCount?: number;
  rightSlot?: ReactNode;
  /** Show the thin progress bar below the header. Defaults to true when step/stepCount are provided. */
  showProgress?: boolean;
};

export function PhaseHeader({
  phase,
  phaseLabel,
  totalPhases = 6,
  back,
  step,
  stepCount,
  rightSlot,
  showProgress,
}: PhaseHeaderProps) {
  const hasStep = typeof step === "number" && typeof stepCount === "number";
  const progressVisible = showProgress ?? hasStep;
  const progressPct = hasStep ? (step! / stepCount!) * 100 : 0;

  return (
    <header className="w-full border-b border-surface-lavender-300 bg-surface-lavender-100/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {back}
          <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70 truncate">
            Phase {phase} of {totalPhases}
            <span aria-hidden className="mx-2 text-foreground/30">
              ·
            </span>
            <span className="text-brand-indigo">{phaseLabel}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {rightSlot}
          {!rightSlot && hasStep ? (
            <p className="text-[11px] md:text-xs font-medium uppercase tracking-[0.18em] text-foreground/55">
              Step {step} of {stepCount}
            </p>
          ) : null}
        </div>
      </div>
      <div
        aria-hidden
        className="h-px w-full bg-gradient-to-r from-transparent via-brand-indigo/20 to-transparent"
      />
      {progressVisible ? (
        <div aria-hidden className="h-0.5 w-full bg-surface-lavender-300">
          <div
            className="h-full bg-brand-indigo transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      ) : null}
    </header>
  );
}
