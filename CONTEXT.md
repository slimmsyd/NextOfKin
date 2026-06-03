# Glossary

Canonical domain language for NextOfKin. Terms only — no implementation detail.

## Profile (the record)
The structured representation of what the user owns, who they love, and their
wishes. **The single source of truth.** The right pane renders it; the document
engine reads it; detection and dissemination act on it.

## Transcript
The stored conversation turns. An **audit log**, not working memory — the model
does not "remember" from the transcript; it works from the Profile.

## Chapter
One conversational sub-section of the intake (e.g. *real estate*, *financial
accounts*). Belongs to the "What you have" section. Has a goal, the asset types
it covers, and a completion state.

## Binding field
A captured value that will bind a legal document or a money/identity decision:
**legal names, dollar amounts, account identifiers, beneficiary identities, dates
of birth.** Binding fields get an explicit **read-back** when captured by voice;
all other values are captured silently and remain editable.

## Read-back
Ava restating a captured **binding field** in her reply so the user can confirm or
correct it (e.g. "I've put your home at three-twenty, tell me if I misheard").
Woven into the normal reply, not a separate step.

## Capture
Recording a stated fact into the Profile via a tool call. **Capture-early:** a row
is created as soon as a thing is identifiable; unknown fields stay null (never
invented) and are refined later by id.

## Gap
A field the Profile is missing or hasn't confirmed. Gaps are surfaced in the
review step (Phase 5), never used to block or pressure the user mid-chapter.
