import { AGENT_NAME } from "@/lib/voice/agent";

type AvaIndicatorProps = {
  /** True while the agent's voice is actively playing — drives the waveform. */
  speaking: boolean;
  className?: string;
};

// Six bars with staggered delays so the waveform reads as organic, not synced.
const BAR_DELAYS = ["0ms", "120ms", "240ms", "120ms", "300ms", "60ms"];

/**
 * The agent ("Ava") identity chip: an indigo→violet gradient avatar — the one
 * place a gradient avatar appears — plus a small waveform that animates while
 * the voice is speaking, and a status label.
 */
export function AvaIndicator({ speaking, className }: AvaIndicatorProps) {
  return (
    <div
      className={[
        "inline-flex items-center gap-3 rounded-full border border-surface-lavender-300 bg-white/70 py-1.5 pl-1.5 pr-4 backdrop-blur-sm",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-brand-violet to-brand-violet-end font-serif text-[15px] italic text-white"
      >
        {AGENT_NAME.charAt(0)}
      </span>

      <span aria-hidden className="flex h-3.5 items-center gap-[3px]">
        {BAR_DELAYS.map((delay, i) => (
          <span
            key={i}
            className={`w-[2.5px] rounded-full bg-brand-indigo/70 ${
              speaking ? "animate-waveform" : ""
            }`}
            style={{
              height: "100%",
              transformOrigin: "center",
              transform: speaking ? undefined : "scaleY(0.3)",
              animationDelay: delay,
            }}
          />
        ))}
      </span>

      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/60">
        {speaking ? `${AGENT_NAME} is speaking` : AGENT_NAME}
      </span>
    </div>
  );
}
