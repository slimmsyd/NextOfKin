# Onboarding success spec — the agent interview

What a great agent-driven intake turn looks like, and why. The canon: **the
right pane (the Profile) is the source of truth; the conversation is the
interview.** For that to be true every turn, capture must be *guaranteed*,
*reflected live*, and *truthfully acknowledged*. Terms: see `CONTEXT.md`.

## The turn loop

1. Message arrives (typed, or voice transcribed in-browser). The client tags it
   with `inputMethod` (`voice` | `text`).
2. Route persists the user turn, marks the chapter `active`, loads the Profile.
3. **Extraction call** (single job): emits tool calls for what was stated this
   turn. Capture-early; null for the unstated; update existing rows by id.
4. Route executes the tool calls via `validateAndApply` (auth/RLS) and streams
   `tool-output-available` → the pane upserts the row **that turn**.
5. **Reply call** (single job): warm prose that acknowledges *only* what was
   actually captured, and reads back binding fields captured by voice.
6. Reply streams to the left pane (and TTS). Agent turn persisted.

Two model calls per turn. The split is deliberate: a single chatty call narrates
intent ("let me record that") without acting. Separating capture from
conversation makes capture reliable and acknowledgment honest.

## Per-turn success criteria

- **Capture fires** whenever the user states a fact (no silent misses).
- **Pane reflects it that turn** (not after reload).
- **Reply is truthful** — acknowledges what was recorded, never promises a record
  that didn't happen.
- **Concise & warm** — 1-3 sentences, plain language, no em-dashes, never
  re-asks what's already answered or on the record.
- **Honest unknowns** — unmentioned fields stay null; nothing is invented.
- **No duplicates** — a thing mentioned twice updates one row (entity resolution
  by id).

## Trust model (hybrid)

- Default: **silent live capture** — the row appears, Ava acknowledges briefly,
  the user can edit via the pencil. Trust = watching the record build.
- **Read-back** only for **binding fields** (legal names, dollar amounts, account
  identifiers, beneficiary identities, dates of birth) and only when captured by
  **voice** (where digits/names garble). Woven into the reply, no extra turn. A
  correction next turn updates the same row by id.

## Conversation rules

- Plain, warm, unhurried; a trusted person, not a form.
- Framed around the people they love and what they've built; never clinical about
  death; acknowledge emotional weight briefly, then move on.
- Education on demand only (define a term in one sentence if asked, then proceed).
- Refuse legal/financial advice and defer to a real professional; do not advise.
- Gently name heirs-property risk on inherited family land; never lecture.
- On real distress, slow down and offer to pause.

## Completion

A chapter completes when **the user has nothing more to add** (never "all fields
filled"). Ava captures what's volunteered, prompts once for the obvious gap, then
calls `confirm_chapter_complete` and warmly names the next section. Missing
optional details become **gaps** surfaced in Phase 5, never mid-chapter blockers.

## Edge rules

- **Cross-chapter identity:** a side comment ("I live in Virginia") never silently
  overwrites identity (`state_code` drives the deterministic legal layer). It
  becomes a confirmation/gap.
- **Rental:** if a captured property turns out to be rented (not owned), it is
  removed/soft-deleted (not an estate asset).
- **Model error/timeout:** the brain returns a safe clarify turn; the route never
  crashes.

## Deferred (named, not built here)

Full provenance (`source_turn_id`, `capture_method`, `confidence`, `confirmed`) +
a visible pending→confirmed state; async reconciliation pass (Phase 5 catch-net);
multi-turn conversation evals; DeepSeek on the financial chapter.

## How we verify

- Single-turn extraction evals (`evals/`) stay green for the four failure modes.
- Live walk: stating a home creates a card that turn; restating updates it; a
  voice-captured value is read back; "what's an estate?" gets a one-line answer;
  an advice question is declined; no em-dashes; dev terminal logs extracted +
  applied tools.
