import "server-only";

import type { ChapterState } from "@/lib/yourLife/loadChapterState";
import type { ScriptedTurn } from "@/lib/yourLife/brains/types";

const LEGAL_KEYWORDS = [
  "legally",
  "lawyer",
  "attorney",
  "law",
  "legal",
  "sue",
  "lawsuit",
  "will be valid",
];
const FINANCIAL_KEYWORDS = [
  "invest",
  "stock",
  "market",
  "should i buy",
  "should i sell",
  "best investment",
  "financial advice",
];
const PURCHASED_KEYWORDS = ["own", "bought", "purchased", "paid", "mortgage"];
const INHERITED_KEYWORDS = [
  "inherit",
  "grandfather",
  "grandmother",
  "passed down",
  "passed to me",
  "family land",
  "family property",
  "acres",
];
const DEED_UNKNOWN_KEYWORDS = [
  "not sure",
  "don't know",
  "do not know",
  "unclear",
  "his name",
  "her name",
  "still in",
];

function lc(s: string) {
  return s.toLowerCase();
}

function matchesAny(text: string, keywords: string[]) {
  const t = lc(text);
  return keywords.some((k) => t.includes(k));
}

const LEGAL_REFUSAL =
  "I hear you. That question is really for an attorney who knows your state's law. I can capture what's true about your situation, and later we'll line you up with a real lawyer who can answer that. Is it okay if we keep going with what you have?";

const FINANCIAL_REFUSAL =
  "That's a money question, and it's the kind of thing a financial advisor is much better at than I am. My job is to capture what you own and who you love. Want to keep going on that, and we'll point you to someone for the money side later?";

const OPENING =
  "Let's talk about where you live and any property in your family. Do you own your home?";

const HOME_FOLLOWUP =
  "Good. Got that on your right. Is there any other property, land, a second home, anything you've inherited?";

const DEED_QUESTION =
  "Do you know whose name is on the deed for that land right now?";

const HEIRS_NOTE =
  "Thanks for telling me. Land that was inherited but never had the deed updated has a name. It's called heirs property, and in North Carolina especially it shows up a lot in Black families. We'll come back to it when we get to what you'd want to happen with the land. For now, anything else you own?";

const CHAPTER_CLOSE =
  "We've got a solid picture of what you have. Next we'll talk about who you protect — the people you'd want this to go to. Ready when you are.";

/**
 * Deterministic scripted brain for the real-estate chapter.
 * Replaces the real model in the dev loop. Same input/output contract so
 * swapping in `streamText({ model: anthropic(...) })` later requires zero
 * client-side changes.
 */
export function nextTurn(
  state: ChapterState,
  lastUserMessage: string,
): ScriptedTurn {
  const userMessageCount = state.turns.filter((t) => t.role === "user").length;

  if (matchesAny(lastUserMessage, LEGAL_KEYWORDS)) {
    return { text: LEGAL_REFUSAL, toolCalls: [], bucket: "legal_advice" };
  }
  if (matchesAny(lastUserMessage, FINANCIAL_KEYWORDS)) {
    return { text: FINANCIAL_REFUSAL, toolCalls: [], bucket: "financial_advice" };
  }

  // Turn 1: user just answered the opening "do you own your home?"
  if (userMessageCount === 1) {
    if (matchesAny(lastUserMessage, INHERITED_KEYWORDS)) {
      return {
        text: HOME_FOLLOWUP,
        toolCalls: [
          {
            name: "add_real_estate",
            args: {
              label: "Inherited property",
              location: "Unknown",
              acquisition_source: "inherited",
              title_status: "unclear",
            },
          },
        ],
        bucket: "answer",
      };
    }

    if (matchesAny(lastUserMessage, PURCHASED_KEYWORDS)) {
      return {
        text: HOME_FOLLOWUP,
        toolCalls: [
          {
            name: "add_real_estate",
            args: {
              label: "Your home",
              location: state.user?.stateCode === "NC" ? "North Carolina" : "Your state",
              acquisition_source: "purchased",
              title_status: "jtwros",
              deed_recorded: true,
            },
          },
        ],
        bucket: "answer",
      };
    }

    // Vague answer — clarify before recording anything.
    return {
      text: "Got it. So just to be sure I have this right — do you own the place where you live? Could be solo, with a partner, or with family.",
      toolCalls: [],
      bucket: "clarify",
    };
  }

  // Turn 2: user is describing additional property
  if (userMessageCount === 2 && matchesAny(lastUserMessage, INHERITED_KEYWORDS)) {
    return {
      text: DEED_QUESTION,
      toolCalls: [
        {
          name: "add_real_estate",
          args: {
            label: "Family land",
            location: "Family land",
            acquisition_source: "inherited",
            title_status: "unclear",
            deed_recorded: false,
          },
        },
      ],
      bucket: "answer",
    };
  }

  // Turn 3: user said deed status is unknown — flag heirs property on most recent inherited asset
  if (userMessageCount === 3 && matchesAny(lastUserMessage, DEED_UNKNOWN_KEYWORDS)) {
    const inherited = [...state.assets]
      .reverse()
      .find((a) => a.acquisitionSource === "inherited");

    return {
      text: HEIRS_NOTE,
      toolCalls: inherited
        ? [
            {
              name: "flag_heirs_property_risk",
              args: {
                asset_id: inherited.id,
                reason: "unclear_title",
              },
            },
          ]
        : [],
      bucket: "answer",
    };
  }

  // Default: gentle close of the chapter.
  return {
    text: CHAPTER_CLOSE,
    toolCalls: [
      {
        name: "confirm_chapter_complete",
        args: { chapter: "real_estate" },
      },
    ],
    bucket: "answer",
  };
}

export const REAL_ESTATE_OPENING = OPENING;
