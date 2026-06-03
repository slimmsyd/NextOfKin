import "server-only";

import type { ChapterState } from "@/lib/yourLife/loadChapterState";
import type { ScriptedTurn } from "@/lib/yourLife/brains/types";
import type { Probe, ProbeKind } from "@/lib/yourLife/interviewFlow";

// The script knows exactly what it just asked, so it declares its own probe
// directly (no inference). `ask` is unused here (no model reply prompt); the
// topic seeds the chips. Keeps financial chips aligned for free.
function fp(kind: ProbeKind, topic: string): Probe {
  return { kind, topic, ask: "" };
}

// Deterministic scripted brain for the financial-accounts chapter. Same
// input/output contract as the real-estate brain (ChapterBrain), so a real
// Claude implementation can replace it later with no route/client changes.

const LEGAL_KEYWORDS = [
  "legally",
  "lawyer",
  "attorney",
  "legal",
  "will be valid",
  "probate",
];
const ADVICE_KEYWORDS = [
  "should i invest",
  "should i buy",
  "should i sell",
  "best investment",
  "which fund",
  "rollover advice",
  "good return",
  "market",
];

const PROVIDERS = [
  "fidelity",
  "vanguard",
  "schwab",
  "chase",
  "bank of america",
  "wells fargo",
  "citi",
  "capital one",
  "ally",
  "robinhood",
  "navy federal",
  "usaa",
];

type AccountType =
  | "account_401k"
  | "account_ira"
  | "account_brokerage"
  | "account_checking"
  | "account_savings";

function lc(s: string) {
  return s.toLowerCase();
}

function matchesAny(text: string, keywords: string[]) {
  const t = lc(text);
  return keywords.some((k) => t.includes(k));
}

const LEGAL_REFUSAL =
  "That's really a question for an attorney who knows your state's law. I can capture what's true about your accounts, and later we'll line you up with a real lawyer. Shall we keep going with what you have?";

const ADVICE_REFUSAL =
  "That's a money decision, and a financial advisor is far better at that than I am. My job is just to capture what you have and who it's meant for. Want to keep going on that, and we'll point you to someone for the advice side later?";

const ASK_MORE =
  "Got it, that's on your right now. Anything else, a retirement account, savings, or brokerage?";

const ASK_BENEFICIARY =
  "Good. For accounts like these, the people you name as beneficiaries usually receive them directly. Have you named anyone on these accounts?";

const CHAPTER_CLOSE =
  "That's a solid picture of your accounts. Next we'll talk about who you protect, the people you'd want these to reach. Ready when you are.";

/** Best-effort detection of an account type + institution from a message. */
function detectAccount(
  text: string,
): { accountType: AccountType; institution: string } | null {
  const t = lc(text);
  let accountType: AccountType | null = null;
  if (t.includes("401")) accountType = "account_401k";
  else if (t.includes("ira") || t.includes("roth")) accountType = "account_ira";
  else if (
    t.includes("broker") ||
    t.includes("stock") ||
    t.includes("invest") ||
    t.includes("mutual")
  )
    accountType = "account_brokerage";
  else if (t.includes("checking")) accountType = "account_checking";
  else if (t.includes("saving")) accountType = "account_savings";
  else if (t.includes("bank") || t.includes("account"))
    accountType = "account_checking";

  if (!accountType) return null;

  const provider = PROVIDERS.find((p) => t.includes(p));
  const institution = provider
    ? provider.replace(/\b\w/g, (c) => c.toUpperCase())
    : "Your account";
  return { accountType, institution };
}

const ACCOUNT_LABEL: Record<AccountType, string> = {
  account_401k: "401(k)",
  account_ira: "IRA",
  account_brokerage: "Brokerage",
  account_checking: "Checking",
  account_savings: "Savings",
};

export function financialAccountsBrain(
  state: ChapterState,
  lastUserMessage: string,
): ScriptedTurn {
  if (matchesAny(lastUserMessage, LEGAL_KEYWORDS)) {
    return {
      text: LEGAL_REFUSAL,
      toolCalls: [],
      bucket: "legal_advice",
      nextProbe: fp("another_asset", "another_account"),
    };
  }
  if (matchesAny(lastUserMessage, ADVICE_KEYWORDS)) {
    return {
      text: ADVICE_REFUSAL,
      toolCalls: [],
      bucket: "financial_advice",
      nextProbe: fp("another_asset", "another_account"),
    };
  }

  const userMessageCount = state.turns.filter((t) => t.role === "user").length;
  const detected = detectAccount(lastUserMessage);

  // Turns 1-2: capture an account if we can recognize one, then ask for more.
  if (userMessageCount <= 2) {
    if (detected) {
      const askingForMore = userMessageCount === 1;
      return {
        text: askingForMore ? ASK_MORE : ASK_BENEFICIARY,
        toolCalls: [
          {
            name: "add_financial_account",
            args: {
              institution: detected.institution,
              account_type: detected.accountType,
            },
          },
        ],
        bucket: "answer",
        nextProbe: askingForMore
          ? fp("another_asset", "another_account")
          : fp("field", "beneficiary_named"),
      };
    }
    // Couldn't recognize an account type — gently clarify.
    return {
      text: "No problem. What kind of account is it, checking, savings, a 401(k), an IRA, or a brokerage?",
      toolCalls: [],
      bucket: "clarify",
      nextProbe: fp("field", "account_type"),
    };
  }

  // Later turns: capture anything still recognizable, otherwise close.
  if (detected) {
    return {
      text: ASK_BENEFICIARY,
      toolCalls: [
        {
          name: "add_financial_account",
          args: {
            institution: detected.institution,
            account_type: detected.accountType,
          },
        },
      ],
      bucket: "answer",
      nextProbe: fp("field", "beneficiary_named"),
    };
  }

  return {
    text: CHAPTER_CLOSE,
    toolCalls: [
      { name: "confirm_chapter_complete", args: { chapter: "financial_accounts" } },
    ],
    bucket: "answer",
    nextProbe: fp("done_check", "done_check"),
  };
}

export { ACCOUNT_LABEL };
