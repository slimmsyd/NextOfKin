import type { ReactNode } from "react";

export function SectionPlaceholder({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-surface-lavender-300 bg-white/50 px-4 py-4 italic text-sm text-foreground/55">
      {children}
    </p>
  );
}
