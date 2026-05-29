import "server-only";

import { financialAccountsBrain } from "@/lib/yourLife/scripts/financialAccountsScript";
import { makeDeepSeekBrain } from "./deepseek";
import type { ChapterBrain } from "./types";

// Per-chapter brain registry. Swapping a script for a real model is a local
// change here — the route and client never need to know.
//
// V1: real estate runs on DeepSeek (the real agent); financial accounts stays
// on the deterministic script for now (this tranche proves the loop on one
// chapter). The scripted brain is wrapped to satisfy the async ChapterBrain.
const BRAINS: Record<string, ChapterBrain> = {
  real_estate: makeDeepSeekBrain("real_estate"),
  financial_accounts: async (state, userText) =>
    financialAccountsBrain(state, userText),
};

export function getBrain(chapterId: string): ChapterBrain | undefined {
  return BRAINS[chapterId];
}
