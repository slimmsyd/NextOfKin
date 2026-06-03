# NextOfKin

> AI-native estate planning and legacy operating system, built by OnCode Software Solutions for Black American families. North Carolina, V1.

**Source of truth for product decisions:** `PlatformDocuments/Extra_Kin_Design_Context.docx`. When this file and the design doc disagree, the design doc wins — update CLAUDE.md to match.

---

## What we are building

A continuous, agentic estate operating system, not a snapshot will generator. Five layers, only the integrated whole is the product:

1. **Intake & document generation** — conversational capture, deterministic templates.
2. **Continuous living state** — quarterly check-ins, event-driven reconciliation.
3. **Multi-signal death detection** — heartbeat, attestation, obituary, public records, SSDMF.
4. **Post-death dissemination** — pre-authorized routing on verified death only.
5. **Asset recovery & education** — NAUPA, NAIC, state-specific plain-language guidance.

The wedge is the full stack integrated. Competitors are strong in one or two layers and absent in the rest.

## Who it serves

Black American families. **Primary user persona: the founder's mother.** Every product decision is tested against whether it serves her. Distribution flows through Black-owned funeral homes, HBCU alumni networks, Black-led credit unions, and Black financial media — not direct-to-consumer ads.

---

## Non-negotiable architectural rules

These exist because they are how the product stays trustworthy. Do not relax them without an ADR.

1. **The LLM never touches the legal core.** Legal facts come from a structured rules database. Document language comes from attorney-vetted templates with deterministic data binding. The LLM lives only in the conversation layer, the education/RAG layer, and the optional wishes sections of generated documents.

2. **The structured profile is the single source of truth.** The conversation fills it. The document engine reads it. Detection and dissemination act on it. Schema correctness on day one prevents an eighteen-month rewrite.

3. **No dissemination action ever fires on a single signal.** Multi-signal convergence is required, plus a 72-hour grace window on every action, plus full audit log, plus reversibility within the grace window. Always design toward false negative. A false positive disseminates a living person's will — catastrophic.

4. **State law is a deterministic layer.** Every query takes a `state_code`. Architecturally multi-state; only North Carolina is populated in V1. Adding a state = ~6–8 weeks including attorney review.

5. **The right pane is the source of truth; the conversation is the interview.** Every agent response is graded on whether the structured profile reflects reality after the turn.

6. **Cultural specificity is a feature.** Heirs property risk surfaces automatically when family land is mentioned. Communal trustees and oral-tradition patterns are first-class. Not a marketing layer.

---

## V1 scope (this is what we are building right now)

**In:**
- Auth, user profile, MFA
- Phase 1: Welcome + consent
- Phase 2: Identity foundation (form-based, 7 fields, ~10–15 min)
- Phase 3: Chapter loop — **real estate and financial accounts only**, conversational with live profile pane
- Phase 4: People layer — **beneficiaries and executor only**
- Phase 5: Review + gap surface
- Full data model for all entities (some empty in V1)
- Profile summary export (one-page, shareable)

**Out (do not build):**
- ❌ Document generation (no will, no POA, no advance directive yet) — V1.5
- ❌ Death detection — V2
- ❌ Dissemination — V2
- ❌ Asset recovery integrations — V2
- ❌ Channel partnerships — V2

V1 users: the founder's mother + four other families in the founder's network. Not a public launch.

If a request implies V1.5 or V2 work, flag it and ask before building.

---

## Tech stack (as installed)

| Layer | Choice |
|---|---|
| Frontend | **Next.js 16.2.6** (App Router, Turbopack), React 19.2, TypeScript 5.9, Tailwind 4, shadcn/ui |
| Backend | Supabase (Postgres + Auth + RLS) via Prisma 7.x ORM with `@prisma/adapter-pg` driver. **Wired.** |
| Agent runtime | **DeepSeek** (`deepseek-chat`) via OpenAI-compatible endpoint, dropped into the Next.js `ChapterBrain` seam — **wired**. Provider-agnostic via env (`src/lib/yourLife/llm.ts`); Python is evals-only. V1 uses `api.deepseek.com` (**family-only**, PRC jurisdiction); moving to a Western zero-retention host + DPA is a hard gate before non-family users — see `PlatformDocuments/ADR-001-deepseek-agent.md` + `PRE-PUBLIC-LAUNCH-CHECKLIST.md`. Stays in the conversation/extraction layer only (rule #1). |
| Voice | **ElevenLabs** for narration (TTS, `/api/voice/[scene]`) and speech-to-text (**Scribe `scribe_v2`**, record-then-transcribe via `/api/your-life/transcribe`) — **wired**. One `ELEVENLABS_API_KEY`. STT is conversation-layer only (rule #1); family voice is logged by default (zero-retention is enterprise-only) — a hard gate before non-family users, see `PlatformDocuments/ADR-002-speech-to-text-provider.md` + `PRE-PUBLIC-LAUNCH-CHECKLIST.md`. Seam to evolve to live word-by-word streaming later. |
| Document engine | Attorney-reviewed templates + deterministic data binding — *V1.5* |
| Background jobs | n8n for cron + webhooks — *to be added when needed* |
| Email / SMS | Postmark or Resend + Twilio — *to be added when needed* |
| Hosting | Vercel |
| Security baseline | Encryption at rest + in transit, MFA, audit logging, SOC 2 (eventual) |

**Note:** the design doc lists Next.js 15; we installed Next.js 16 (latest stable). React 19 is now stable and Next 16 makes Turbopack the default. Treat this as a forward-compatible upgrade — APIs we care about (App Router, Server Components, Server Actions) are unchanged.

### Package manager

pnpm. Use `pnpm` for everything (`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm add ...`). Do not commit lockfiles from npm or yarn.

### Repo layout

```
src/app/        # App Router routes
src/            # everything else (components, lib, etc.)
public/         # static assets
PlatformDocuments/  # design context + future ADRs
```

Import alias: `@/*` → `./src/*`.

---

## Core data entities

Defined in detail in the design doc, summarized here so Claude does not invent shapes:

- **User** — profile, identity verification, contact methods, life events log
- **Asset** — type, institution, identifier, estimated value, beneficiary designations, supporting documents
- **Debt** — creditor, type, balance, payment terms
- **Beneficiary** — person or entity; per-asset or residual heir
- **Trusted Contact** — authorized to attest, receive info, or act as executor
- **Document** — generated or uploaded; type, version, jurisdiction, status
- **Check-in** — scheduled or triggered; cadence, trigger, response, outcome
- **Death Signal** — single data point; source, confidence, timestamp, verified status
- **Dissemination Action** — pre-authorized routing rule; trigger, recipient, payload, method
- **Life Event** — type, date, source, downstream effects

Every entity carries a `state_code`. Beneficiaries and trusted contacts are **defined once, referenced everywhere** — never inline-duplicated.

---

## UI rules

- **Split-pane intake** — conversation left, live structured profile right. Both views of the same database state.
- **Form vs. conversation by phase** — conversation when the answer depends on a story (chapter loop, people layer); form when the answer is a fact (signup, identity foundation).
- **Voice input is first-class**, not an afterthought. The target user is more comfortable speaking than typing.
- **No emoji. No anthropomorphizing the agent beyond an initial. No timer. No upsells during intake.**
- **Heirs property risk surfaces automatically** when family land is mentioned.
- Upcoming sections visible but dimmed — the user always knows what is ahead.
- **One visual system, two surfaces.** The marketing site and the intake app share the same design tokens, type, and rules below. There is no separate intake design system.

### Design tokens

Source of truth: `DesignSystem/nextofkin-home-v1.html` for the visual language; **this section** for what the code uses. When the mockup HTML and this list disagree, this list wins. Note: the mockup HTML uses Inter as its sans face; the implementation uses **Poppins** (sans) + **Instrument Serif** (editorial). Tokens are wired in `src/app/globals.css` via Tailwind 4 `@theme` and consumed as utilities (`bg-brand-indigo`, `text-surface-dusty`, etc.).

**Brand**
- `brand-indigo` `#3B35C3` — primary indigo: CTAs, indigo cards, brand surfaces
- `brand-violet` `#5852F5` — accent violet: gradient start, highlights
- `brand-violet-end` `#7B61FF` — gradient end only

**Surfaces (cool lavender scale)**
- `surface-lavender-100` `#F8F7FF` — page background tint
- `surface-lavender-200` `#F4F1FF` — section surface
- `surface-lavender-300` `#F0EFFF` — card surface
- `surface-dusty` `#ADA8CE` — muted text / hairline
- `surface-deep` `#0A0A0F` — near-black for dark editorial sections

**Folder peek pastels (hero only)**
- `peek-mint` `#F0FFF4`, `peek-blush` `#FFF5F5`, `peek-ivory` `#FAFAFB` (the lavender peek reuses `surface-lavender-200`)

**Signup illustration surface (single exception)**
- `paper-cream` `#F4E8C1` — scoped **only** to the left visual panel of `/signup` as the archival surface for the hand-drawn stairs/hearts illustration. Do not use anywhere else; the no-warm-neutrals rule below still holds for every other surface in the product.

**Type**
- **Two faces.** **Instrument Serif** (weight 400, roman + italic) is used for large section headlines and italic accent phrases. **Poppins** (weights 400/500/600/700, roman + italic) is used for body copy, eyebrows, nav, buttons, labels, and trust strip text. The accent pattern (e.g. "people you love", "what matters most", "We search") uses Instrument Serif italic — never Poppins italic for editorial accents.

**Rules**
- **No tan, cream, or warm-neutral surfaces** *(except the documented `paper-cream` exception above for the signup illustration surface)*. Brand is otherwise strictly the cool indigo-violet family — warm neutrals were tried and rejected.
- **Dark editorial sections are contextual, not a global mode.** The `surface-deep` background is used on specific sections (e.g. "We don't stop at the will"). Do **not** wire `prefers-color-scheme: dark` or a user dark-mode toggle — there is no global dark theme in V1.

### Form primitives standard

All product forms (signup, intake, profile edits) use the primitives in `src/components/forms/`. The spec below is the standard — match it exactly, do not invent new sizes per page. The signup form's tight, minimal feel is the look across the product.

**Imports**: `import { Button, LinkButton, TextInput, Select, DateInput, FieldLabel, Repeater, AutoSaveBadge } from "@/components/forms"`.

**Inputs (`TextInput`, `Select`, `DateInput`)**
- Shell: `h-[50px] px-4 text-[13px] bg-white rounded-lg border border-[#DFDFE4]`
- Placeholder: `text-foreground/50`
- Focus: `focus:outline-none focus:border-foreground/55 transition-colors`
- Error: border becomes `#B23B3B`, `aria-invalid="true"`, error text in `#B23B3B` 12px below the field

**Button**
- Sizes: `md` (default — `h-[44px] px-6 text-sm`) and `lg` (`h-[50px] px-8 text-[14px]`)
- Shape: always `rounded-full`, `font-medium`
- Variants:
  - `variant="primary"` (default) — filled. Use `tone="indigo"` (default, `bg-brand-indigo` → `bg-brand-violet` hover) for all primary CTAs including signup. `tone="ink"` (`bg-foreground` near-black) is available as an escape hatch but is not currently used in the product; signup previously used ink and was switched to indigo for brand consistency.
  - `variant="secondary"` — outlined. `bg-transparent border border-[#DFDFE4] text-foreground hover:bg-foreground/5`. Use for Back, dismiss, and similar tertiary actions.
- Disabled: `opacity-50`, `cursor-not-allowed`, `pointer-events-none` (handled by primitive)
- Focus ring: `focus-visible:ring-2` matched to variant

**`LinkButton`** wraps `next/link` with the same Button API. Use it for navigational buttons (e.g. `/setup`'s Continue). `disabled` prop intercepts clicks and removes from tab order.

**Field label**
- `text-sm text-foreground/70 mb-2`. Use the `label` prop on inputs to render via the standard `FieldLabel` automatically.

**Auto-save**
- `AutoSaveBadge` shows a small colored dot + status text. Wire it through `AutoSaveStatus` (`"idle" | "saving" | "saved" | "error"`). For pages with auto-save (e.g. `/about-you`), place it in `PhaseHeader`'s `rightSlot`.

If a page needs a button or input that doesn't fit this spec, that's a signal the spec is incomplete — extend the primitive, don't fork inline.

---

## Working principles

- Build the hard thing first. Intake conversation engine before signup polish. Skeleton before features.
- Test every decision against the founder's mother. If she would not understand it, struggle to use it, or distrust it — redesign.
- Attorney sign-off before any document template ships. Non-negotiable.
- Sub-$50 at entry. Monetize on post-death recovery success fees and B2B subsidies, not document pricing.
- Distribution is the company. Product is the credibility to start the channel conversation.

---

## How to work in this repo

- **Dev:** `pnpm dev` (Turbopack)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint`
- Before adding a dependency, ask: does it earn its weight against the V1 scope above?
- Before adding LLM calls to anything legal-adjacent, re-read rule #1.
- Before adding any code that could trigger an action on a "death signal," re-read rule #3.
- When in doubt about scope, the design doc is the source of truth.
