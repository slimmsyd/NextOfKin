type StatusTone = "indigo" | "green" | "neutral";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
  /** Adds a soft pulse to the dot (e.g. "Live", "Listening"). */
  pulse?: boolean;
  className?: string;
};

const DOT: Record<StatusTone, string> = {
  indigo: "bg-brand-indigo",
  green: "bg-emerald-500",
  neutral: "bg-foreground/40",
};

/**
 * Small inline status chip: a colored dot + uppercase tracked label.
 * Indigo/green/neutral only — stays inside the cool brand palette.
 */
export function StatusPill({
  label,
  tone = "indigo",
  pulse = false,
  className,
}: StatusPillProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full bg-foreground/4 px-2.5 py-1",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span aria-hidden className="relative flex h-1.5 w-1.5">
        {pulse ? (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${DOT[tone]}`}
          />
        ) : null}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />
      </span>
      <span className="text-[10.5px] font-medium uppercase tracking-[0.18em] text-foreground/60">
        {label}
      </span>
    </span>
  );
}
