"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  getSetupIntakeBackHref,
  getSetupIntakeStep,
  isFirstSetupIntakeStep,
} from "@/lib/setup/flow";
import { PhaseHeader } from "@/components/setup/PhaseHeader";
import { SetupBackButton } from "@/components/setup/SetupBackButton";

type SetupIntakeShellProps = {
  children: ReactNode;
  /** Optional header right slot (e.g. auto-save badge on about-you). */
  rightSlot?: ReactNode;
};

export function SetupIntakeShell({ children, rightSlot }: SetupIntakeShellProps) {
  const pathname = usePathname();
  const step = getSetupIntakeStep(pathname);

  if (!step) {
    return <>{children}</>;
  }

  const backHref = getSetupIntakeBackHref(pathname);
  const isFirst = isFirstSetupIntakeStep(pathname);

  return (
    <main className="min-h-screen bg-surface-lavender-100 flex flex-col">
      <PhaseHeader
        phase={step.phase}
        phaseLabel={step.phaseLabel}
        step={"step" in step ? step.step : undefined}
        stepCount={"stepCount" in step ? step.stepCount : undefined}
        showProgress={"showProgress" in step ? step.showProgress : undefined}
        rightSlot={rightSlot}
        back={
          <SetupBackButton
            leaveHref={backHref}
            confirmTitle={isFirst ? "Leave for now?" : "Go back?"}
          />
        }
      />
      <div className="flex-1 flex items-start md:items-center">{children}</div>
    </main>
  );
}
