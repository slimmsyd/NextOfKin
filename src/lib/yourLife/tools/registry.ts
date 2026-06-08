import type { AssetType } from "@prisma/client";
import type { ChapterId } from "@/lib/yourLife/chapters";
import type { ToolName } from "./index";

// Single source of truth for WHICH tools the model is offered in each chapter.
// Plain module (no `server-only`) so both the brain and the contract test import
// it. Guarded by tools/__tests__/contract.test.ts, which asserts this stays
// consistent with what the route can apply (toolSchemas) and what the evals
// mirror (agent-contract.json), and that every chapter can capture its assets.
//
// Both asset chapters are offered the FULL asset toolset (real estate +
// financial), so a person who lists mixed assets in one breath ("my home and my
// 401k") is captured no matter which chapter they are nominally in (rule #5).
// The chapter goal/probe steers the CONVERSATION; it does not gate capture.
const ASSET_PHASE_TOOLS: ToolName[] = [
  "upsert_asset",
  "add_financial_account",
  "add_other_asset",
  "flag_heirs_property_risk",
  "add_person",
  "confirm_chapter_complete",
  "defer_chapter",
];

export const OFFERED_TOOLS: Record<ChapterId, ToolName[]> = {
  real_estate: ASSET_PHASE_TOOLS,
  financial_accounts: ASSET_PHASE_TOOLS,
};

// Which Asset.type values each capture tool can produce. Drives the coverage
// invariant: every chapter must be offered a tool that can capture its asset
// types (so financial assets are not silently uncapturable).
export const TOOL_PRODUCES_ASSET_TYPES: Partial<Record<ToolName, AssetType[]>> = {
  upsert_asset: ["real_estate"],
  add_real_estate: ["real_estate"],
  add_financial_account: [
    "account_401k",
    "account_ira",
    "account_brokerage",
    "account_checking",
    "account_savings",
  ],
  add_other_asset: [
    "vehicle",
    "life_insurance",
    "annuity",
    "business_interest",
    "personal_property",
    "other",
  ],
};
