"use client";

import { motion, useReducedMotion } from "framer-motion";

export function TypingIndicator() {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div
        className="inline-flex gap-1 px-3 py-2 rounded-2xl bg-surface-lavender-200"
        aria-label="Agent is typing"
      >
        <span className="block w-1.5 h-1.5 rounded-full bg-foreground/40" />
        <span className="block w-1.5 h-1.5 rounded-full bg-foreground/40" />
        <span className="block w-1.5 h-1.5 rounded-full bg-foreground/40" />
      </div>
    );
  }

  return (
    <div
      className="inline-flex gap-1 px-3 py-2 rounded-2xl bg-surface-lavender-200"
      aria-label="Agent is typing"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-foreground/50"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            repeat: Infinity,
            duration: 1.4,
            ease: "easeInOut",
            delay: i * 0.18,
          }}
        />
      ))}
    </div>
  );
}
