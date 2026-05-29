import { US_STATES } from "@/components/aboutYou/states";
import type { IdentityView, SidebarSection } from "./types";

function CheckIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-3 h-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function stateLabel(code: string): string {
  return US_STATES.find((s) => s.value === code)?.label ?? code;
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || "·";
}

type YourLifeSidebarProps = {
  identity: IdentityView;
  sections: SidebarSection[];
  phase?: number;
  totalPhases?: number;
  phaseTitle?: string;
};

export function YourLifeSidebar({
  identity,
  sections,
  phase = 3,
  totalPhases = 6,
  phaseTitle = "Your life",
}: YourLifeSidebarProps) {
  const doneCount = sections.filter((s) => s.state === "done").length;
  const hasActive = sections.some((s) => s.state === "active");
  const progressPct = sections.length
    ? Math.round(((doneCount + (hasActive ? 0.5 : 0)) / sections.length) * 100)
    : 0;
  const activeLabel = sections.find((s) => s.state === "active")?.label;

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-surface-lavender-200 border-r border-surface-lavender-300 px-5 py-6">
      <p className="font-serif text-lg text-foreground">NextOfKin</p>

      {/* Phase meter */}
      <div className="mt-6 rounded-xl border border-surface-lavender-300 bg-white/60 p-4">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
          Phase {phase} of {totalPhases}
        </p>
        <p className="mt-1 text-[15px] font-medium text-foreground">
          {phaseTitle}
        </p>
        <div
          aria-hidden
          className="mt-3 h-1 w-full rounded-full bg-surface-lavender-300"
        >
          <div
            className="h-full rounded-full bg-brand-indigo transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {activeLabel ? (
          <p className="mt-2 text-[11px] text-foreground/55">{activeLabel}</p>
        ) : null}
      </div>

      {/* Section nav */}
      <nav className="mt-6">
        <ol className="space-y-1">
          {sections.map((section, i) => {
            const n = i + 1;
            const isActive = section.state === "active";
            return (
              <li key={section.label}>
                <div
                  className={`flex items-center gap-3 rounded-lg px-2.5 py-2 ${
                    isActive
                      ? "bg-white border border-surface-lavender-300"
                      : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className={`font-serif italic text-[13px] leading-none w-3.5 ${
                      section.state === "locked"
                        ? "text-foreground/30"
                        : "text-brand-indigo"
                    }`}
                  >
                    {n}
                  </span>
                  <span
                    className={`flex-1 text-[13px] ${
                      section.state === "locked"
                        ? "text-foreground/40"
                        : isActive
                          ? "text-foreground font-medium"
                          : "text-foreground/80"
                    }`}
                  >
                    {section.label}
                  </span>
                  {section.state === "done" ? (
                    <span
                      aria-hidden
                      className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-indigo text-white"
                    >
                      <CheckIcon />
                    </span>
                  ) : section.state === "locked" ? (
                    <span aria-hidden className="text-foreground/30">
                      <LockIcon />
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex-1" />

      {/* User pill */}
      {identity ? (
        <div className="flex items-center gap-3 border-t border-surface-lavender-300 pt-4">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-indigo text-[12px] font-semibold text-white"
          >
            {initials(identity.firstName, identity.lastName)}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-medium text-foreground">
              {`${identity.firstName} ${identity.lastName}`.trim()}
            </p>
            <p className="truncate text-[11px] text-foreground/55">
              {stateLabel(identity.stateCode)}
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
