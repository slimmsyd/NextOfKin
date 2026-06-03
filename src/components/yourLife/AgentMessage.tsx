"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Streamdown } from "streamdown";

type AgentMessageProps = {
  text: string;
  bucket: string | null;
};

export function AgentMessage({ text, bucket }: AgentMessageProps) {
  const prefersReduced = useReducedMotion();
  const isRefusal = bucket === "legal_advice" || bucket === "financial_advice";

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start"
    >
      <div
        className={[
          "max-w-[80%] rounded-2xl rounded-tl-md px-4 py-3 text-[15px] leading-[1.55] text-foreground bg-surface-lavender-200",
          isRefusal ? "border-l-2 border-l-amber-400 pl-3" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="prose prose-sm max-w-none [&>*]:my-0 [&>*+*]:mt-2">
          <Streamdown>{text}</Streamdown>
        </div>
      </div>
    </motion.div>
  );
}
