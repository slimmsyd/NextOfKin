export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

const VARIANTS: Record<
  AutoSaveStatus,
  { label: string; dot: string; text: string }
> = {
  idle: {
    label: "",
    dot: "bg-foreground/30",
    text: "text-foreground/60",
  },
  saving: {
    label: "Saving…",
    dot: "bg-brand-violet animate-pulse",
    text: "text-foreground/70",
  },
  saved: {
    label: "Saved",
    dot: "bg-emerald-500",
    text: "text-foreground/60",
  },
  error: {
    label: "Save failed",
    dot: "bg-[#B23B3B]",
    text: "text-[#B23B3B]",
  },
};

export function AutoSaveBadge({ status }: { status: AutoSaveStatus }) {
  const v = VARIANTS[status];
  if (status === "idle") return null;
  return (
    <span
      aria-live="polite"
      className={`inline-flex items-center gap-2 text-[12px] font-medium ${v.text}`}
    >
      <span aria-hidden className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />
      {v.label}
    </span>
  );
}
