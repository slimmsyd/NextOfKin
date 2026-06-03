import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55 mt-8 mb-3 first:mt-0">
      {children}
    </h3>
  );
}
