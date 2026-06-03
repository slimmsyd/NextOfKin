// Deterministic interview-flow engine for the "Recommended next questions"
// chips. One shared primitive (`nextProbe`) drives BOTH Ava's next question and
// the chips, so the chips stay aligned with what Ava just asked WITHOUT reading
// her free-form prose (see PlatformDocuments plan + grilling session).
//
// Pure, no IO, no LLM. The chips themselves are deterministic; only Ava's
// wording is the model's. The probe is gentle and high-value-only: it never
// walks every nullable field (that would violate the "user has nothing more to
// add" completion rule). The long tail of fields defers to Phase 5 gaps.
//
// CANON: chips are questions the user asks Ava. They never suggest document
// generation (V1.5) or advice, and carry no em-dashes.

import type { ChapterId } from "@/lib/yourLife/chapters";
import type { ChapterState } from "@/lib/yourLife/loadChapterState";
import { heirsPropertyRisk } from "@/lib/yourLife/heuristics";

export type ProbeKind = "field" | "another_asset" | "done_check" | "open";

/**
 * The single most useful next thing to learn.
 * - `topic` is the CHIP_COPY lookup key (a field-ish name or a kind).
 * - `ask` is a short natural phrase injected into Ava's reply prompt so she asks
 *   about the same thing the chips are about. Empty = let Ava close/continue
 *   naturally (no steer).
 */
export type Probe = { kind: ProbeKind; topic: string; ask: string };

export type Suggestion = { id: string; label: string; text: string };

export type ToolCall = { name: string; args: Record<string, unknown> };

// ---------- effective-asset helpers (merge this-turn capture over the record) ----------

type EffAsset = {
  acquisitionSource: string | null;
  titleStatus: string | null;
  deedRecorded: boolean | null;
  estimatedValue: string | number | null;
  createdAt: number;
};

function present(v: unknown): boolean {
  return v !== null && v !== undefined && v !== "";
}

/** Has this property still got a high-value gap worth one gentle question? */
function realEstateGap(a: EffAsset): boolean {
  const inheritedTitleGap =
    a.acquisitionSource === "inherited" &&
    (!present(a.titleStatus) || a.deedRecorded === null);
  return (
    inheritedTitleGap ||
    !present(a.acquisitionSource) ||
    !present(a.estimatedValue)
  );
}

/** The first (highest-priority) missing field on a property, as a probe topic. */
function realEstateFieldTopic(a: EffAsset, isNew: boolean): string | null {
  // 1) Heirs-property: inherited land with unclear/unrecorded title (rule #6).
  if (
    a.acquisitionSource === "inherited" &&
    (!present(a.titleStatus) ||
      a.deedRecorded === null ||
      heirsPropertyRisk({
        acquisitionSource: a.acquisitionSource,
        titleStatus: typeof a.titleStatus === "string" ? a.titleStatus : null,
        deedRecorded: a.deedRecorded,
      }))
  ) {
    return "title_status";
  }
  // 2) A newly named asset: the most natural and important next question is who
  //    it should go to. This is what Ava asks unprompted, so leading with it
  //    keeps her question and the chips aligned. Only fires the turn the asset
  //    is first named (isNew) so it doesn't loop (we have no recipient field to
  //    mark answered).
  if (isNew) return "recipient";
  // 3) How they came to own it (cheap; gates the heirs check).
  if (!present(a.acquisitionSource)) return "acquisition_source";
  // 4) Rough value.
  if (!present(a.estimatedValue)) return "estimated_value";
  return null;
}

function assetFromExisting(a: ChapterState["assets"][number]): EffAsset {
  return {
    acquisitionSource: a.acquisitionSource,
    titleStatus: a.titleStatus,
    deedRecorded: a.deedRecorded,
    estimatedValue: a.estimatedValue,
    createdAt: a.createdAt.getTime(),
  };
}

/** Merge a captured upsert_asset call over the existing row it updates (if any). */
function effectiveCaptured(
  call: ToolCall,
  existing: ChapterState["assets"],
): EffAsset {
  const args = call.args;
  const base =
    typeof args.id === "string"
      ? existing.find((e) => e.id === args.id)
      : undefined;
  const eff: EffAsset = base
    ? assetFromExisting(base)
    : {
        acquisitionSource: null,
        titleStatus: null,
        deedRecorded: null,
        estimatedValue: null,
        createdAt: Number.MAX_SAFE_INTEGER, // brand-new = most recent
      };
  if (present(args.acquisition_source))
    eff.acquisitionSource = String(args.acquisition_source);
  if (present(args.title_status)) eff.titleStatus = String(args.title_status);
  if (typeof args.deed_recorded === "boolean")
    eff.deedRecorded = args.deed_recorded;
  if (args.estimated_value !== undefined && args.estimated_value !== null)
    eff.estimatedValue = args.estimated_value as number;
  return eff;
}

// ---------- probe selection ----------

function probe(kind: ProbeKind, topic: string, ask: string): Probe {
  return { kind, topic, ask };
}

const REAL_ESTATE_ASK: Record<string, string> = {
  title_status:
    "whether the deed or title to that property is clear and in their name",
  recipient: "who they would like this to go to",
  acquisition_source: "how they came to own that property",
  estimated_value: "roughly what that property is worth",
  another_asset: "whether there is any other property or land",
  open: "what they own, like their home or any family land",
};

function realEstateProbe(
  state: ChapterState,
  capturedThisTurn: ToolCall[],
): Probe {
  // Completion signalled this turn -> gently test for "anything more".
  if (
    capturedThisTurn.some(
      (c) => c.name === "confirm_chapter_complete" || c.name === "defer_chapter",
    )
  ) {
    return probe("done_check", "done_check", "");
  }

  const upserts = capturedThisTurn.filter((c) => c.name === "upsert_asset");

  // (a) Recency: an asset touched THIS turn wins (tracks the latest exchange).
  if (upserts.length) {
    const lastCall = upserts[upserts.length - 1];
    const eff = effectiveCaptured(lastCall, state.assets);
    const isNew = typeof lastCall.args.id !== "string";
    const topic = realEstateFieldTopic(eff, isNew);
    if (topic) return probe("field", topic, REAL_ESTATE_ASK[topic]);
    return probe("another_asset", "another_asset", REAL_ESTATE_ASK.another_asset);
  }

  // (b) Else: most-recently-created existing asset that still has a gap. Not new,
  // so the recipient question (which only leads for a freshly named asset) is skipped.
  const gapped = [...state.assets]
    .reverse()
    .map(assetFromExisting)
    .find(realEstateGap);
  if (gapped) {
    const topic = realEstateFieldTopic(gapped, false);
    if (topic) return probe("field", topic, REAL_ESTATE_ASK[topic]);
  }

  // (c) No gaps / no captures.
  if (state.assets.length === 0) {
    return probe("open", "open", REAL_ESTATE_ASK.open);
  }
  return probe("another_asset", "another_asset", REAL_ESTATE_ASK.another_asset);
}

/**
 * The single most useful next topic for this chapter, given the pre-turn state
 * and what was captured this turn. Real estate uses the gentle gap walk above;
 * other chapters (financial) set their probe explicitly in their script, so this
 * is only a safe fallback for them.
 */
export function nextProbe(args: {
  chapter: ChapterId;
  state: ChapterState;
  capturedThisTurn: ToolCall[];
}): Probe {
  if (args.chapter === "real_estate") {
    return realEstateProbe(args.state, args.capturedThisTurn);
  }
  // Generic fallback (financial script overrides this per branch).
  return args.state.assets.length === 0
    ? probe("open", "open", "")
    : probe("another_asset", "another_asset", "");
}

const OPEN_ASK: Record<ChapterId, string> = {
  real_estate: REAL_ESTATE_ASK.open,
  financial_accounts: "what accounts they have, like checking or retirement",
};

/** The blank-start probe for a chapter (used for the opening chips on first paint). */
export function openingProbe(chapter: ChapterId): Probe {
  return probe("open", "open", OPEN_ASK[chapter] ?? "");
}

// ---------- chip copy (authored data, founder voice; no em-dashes) ----------
// byTopic[topic] is the ranked [clarify, guide, why] set for a probe topic.
// `next` is the chapter-level slot-4 "what's left" chip. `fallback` guarantees
// at least 2 chips for any unmapped topic.

type ChapterCopy = {
  byTopic: Record<string, string[]>;
  next: string;
  fallback: string[];
};

const CHIP_COPY: Record<ChapterId, ChapterCopy> = {
  real_estate: {
    byTopic: {
      open: [
        "What counts as property here?",
        "What if I rent instead of own?",
        "Where do most people start?",
      ],
      title_status: [
        "What is heirs property?",
        "What if the deed isn't in my name?",
        "Why does a clear title matter for my family?",
      ],
      recipient: [
        "What if I want more than one person to have it?",
        "Can I name a backup person?",
        "What if I'm not sure who should get it?",
      ],
      acquisition_source: [
        "Why does how I got it matter?",
        "What if it came to me a few ways?",
        "Could this affect my heirs?",
      ],
      estimated_value: [
        "Why does the value matter?",
        "What if I don't know the value?",
        "Can I give a rough estimate?",
      ],
      another_asset: [
        "What counts as property?",
        "Does land I don't live on count?",
        "What about a place I co-own?",
      ],
      done_check: [
        "Can I add more later?",
        "Summarize what we have so far",
      ],
    },
    next: "What is still left to cover?",
    fallback: ["What is an estate?", "What is still left to cover?"],
  },
  financial_accounts: {
    byTopic: {
      open: [
        "What accounts should I include?",
        "Does a 401(k) count?",
        "What about a pension?",
      ],
      account_type: [
        "What types of accounts count?",
        "Does a pension count?",
        "What about a CD or money market?",
      ],
      another_account: [
        "What accounts should I include?",
        "Does my checking account matter?",
        "What about a retirement account from an old job?",
      ],
      beneficiary_named: [
        "What is a beneficiary?",
        "What if I haven't named anyone?",
        "Why does naming a beneficiary matter?",
      ],
      done_check: [
        "Can I add an account later?",
        "Summarize what we have so far",
      ],
    },
    next: "What is still left to cover?",
    fallback: ["What is an estate?", "What is still left to cover?"],
  },
};

/**
 * Turn a probe into 2-4 chips: the ranked topic set (clarify, guide, why) plus
 * the chapter-level "what's left" chip, deduped and capped. `__fallback`
 * guarantees at least 2.
 */
export function chipsForProbe(
  probeArg: Probe,
  chapter: ChapterId,
  count = 4,
): Suggestion[] {
  const copy = CHIP_COPY[chapter];
  const base = copy.byTopic[probeArg.topic] ?? copy.fallback;
  const texts = [...base];
  // Append the chapter-level "what's left" chip, except when already closing.
  if (probeArg.topic !== "done_check") texts.push(copy.next);

  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const text of texts) {
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: `${probeArg.topic}-${out.length}`, label: text, text });
    if (out.length >= Math.max(2, Math.min(4, count))) break;
  }
  return out;
}
