"use client";

import type { ReactNode } from "react";

type Tone = "indigo" | "inherit";

type WaitlistTriggerLinkProps = {
  children: ReactNode;
  className?: string;
  tone?: Tone;
};

export function WaitlistTriggerLink({
  children,
  className,
  tone = "indigo",
}: WaitlistTriggerLinkProps) {
  const toneCls =
    tone === "indigo"
      ? "text-brand-indigo hover:text-brand-violet"
      : "text-inherit hover:opacity-80";

  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("waitlist:open"));
      }}
      className={[
        "cursor-pointer underline underline-offset-2 decoration-1 font-medium",
        "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/40 rounded-sm",
        toneCls,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
