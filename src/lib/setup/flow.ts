/** Post-signup intake routes in order (phase 1 welcome through early phase 2). */
export const SETUP_INTAKE_STEPS = [
  {
    path: "/setup",
    phase: 1,
    phaseLabel: "Welcome",
    step: 1,
    stepCount: 3,
  },
  {
    path: "/setup/consent",
    phase: 1,
    phaseLabel: "Consent",
    step: 2,
    stepCount: 3,
  },
  {
    path: "/setup/protect",
    phase: 1,
    phaseLabel: "Protect",
    step: 3,
    stepCount: 3,
  },
  {
    path: "/about-you",
    phase: 2,
    phaseLabel: "About you",
    showProgress: false,
  },
] as const;

export type SetupIntakeStep = (typeof SETUP_INTAKE_STEPS)[number];

export const SETUP_INTAKE_SIGNIN_HREF = "/signin";

export function getSetupIntakeStepIndex(pathname: string): number {
  return SETUP_INTAKE_STEPS.findIndex((step) => step.path === pathname);
}

export function getSetupIntakeStep(
  pathname: string,
): SetupIntakeStep | undefined {
  const index = getSetupIntakeStepIndex(pathname);
  if (index < 0) return undefined;
  return SETUP_INTAKE_STEPS[index];
}

export function getSetupIntakeBackHref(pathname: string): string {
  const index = getSetupIntakeStepIndex(pathname);
  if (index <= 0) {
    return SETUP_INTAKE_SIGNIN_HREF;
  }
  return SETUP_INTAKE_STEPS[index - 1]!.path;
}

export function isFirstSetupIntakeStep(pathname: string): boolean {
  return getSetupIntakeStepIndex(pathname) === 0;
}
