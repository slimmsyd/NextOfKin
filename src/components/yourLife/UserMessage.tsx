"use client";

import { motion, useReducedMotion } from "framer-motion";

export function UserMessage({ text }: { text: string }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end"
    >
      <p className="max-w-[80%] bg-brand-indigo text-white rounded-2xl rounded-tr-md px-4 py-3 text-[15px] leading-[1.55] whitespace-pre-wrap">
        {text}
      </p>
    </motion.div>
  );
}
