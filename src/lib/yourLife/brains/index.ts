import "server-only";

import { nextTurn as realEstateBrain } from "@/lib/yourLife/scripts/realEstateScript";
import { financialAccountsBrain } from "@/lib/yourLife/scripts/financialAccountsScript";
import type { ChapterBrain } from "./types";

// Per-chapter brain registry. The chat route resolves the brain by chapter id;
// swapping a deterministic script for a real Claude implementation is a local
// change here — the route and client never need to know.
const BRAINS: Record<string, ChapterBrain> = {
  real_estate: realEstateBrain,
  financial_accounts: financialAccountsBrain,
};

export function getBrain(chapterId: string): ChapterBrain | undefined {
  return BRAINS[chapterId];
}
