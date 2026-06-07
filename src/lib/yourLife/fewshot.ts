import type { ChapterId } from "@/lib/yourLife/chapters";

// SYNTHETIC few-shot examples injected into the extraction prompt to lift capture
// on the real phrasings the onboarding analytics/harvest surface.
//
// HARD RULE: these are sent to the LLM provider (PRC, family-only V1), so they MUST
// be synthetic. Never paste a real person's name, number, or address here. Curate
// the PATTERN you saw, then write a fictional example of it. Keep the set small
// (every example is tokens on every turn).

const FEWSHOT: Record<ChapterId, Array<{ user: string; calls: string }>> = {
  real_estate: [
    {
      user: "We own our home over on Maple Street.",
      calls: 'upsert_asset(label: "Our home", location: "Maple Street")',
    },
    {
      user: "There's some family land my grandfather left us, not sure about the deed.",
      calls: 'upsert_asset(label: "Family land", acquisition_source: "inherited")',
    },
  ],
  financial_accounts: [
    {
      user: "I've got a 401k at Fidelity and some savings at Chase.",
      calls:
        'add_financial_account(institution: "Fidelity", account_type: "account_401k"); add_financial_account(institution: "Chase", account_type: "account_savings")',
    },
    {
      user: "I just want my mom Brenda to get everything.",
      calls: 'add_person(full_name: "Brenda", relationship: "mother")',
    },
  ],
};

// A prompt block of examples for a chapter (empty string if none).
export function fewshotBlock(chapterId: ChapterId): string {
  const examples = FEWSHOT[chapterId];
  if (!examples?.length) return "";
  const body = examples
    .map((e) => `Person: "${e.user}"\nYou emit: ${e.calls}`)
    .join("\n\n");
  return `\n\n--- EXAMPLES (synthetic, for shape only; emit tool calls like these) ---\n${body}`;
}
