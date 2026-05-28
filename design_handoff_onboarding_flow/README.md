# Handoff: Kinnected Onboarding Flow (v1)

## Overview
This handoff contains the visual design for the first-run onboarding flow of **Kinnected / NextOfKin** — six screens covering the journey from account creation to the first conversation with the in-app agent.

The aesthetic is intentionally a **departure** from the current live indigo/violet brand. It pushes toward a private-wealth / editorial direction: cream paper, deep ink, hairline borders, Instrument Serif italic for accents, brand indigo used as a single restrained accent rather than the primary surface. Think Carlyle / private trust office, not consumer SaaS.

## About the Design Files
**These files are design references, not production code.**

The components in `source/` are written as inline-styled React components rendered through `<script type="text/babel">` Babel-in-the-browser, intended to faithfully show the look and behavior of each screen. They are **not** meant to be dropped into the Next.js codebase as-is.

The task for the implementing developer (or Claude Code agent) is to **recreate these screens in the existing Next.js + Tailwind v4 codebase**, using the project's established patterns:
- App Router pages under `src/app/...`
- Tailwind utility classes (the project uses Tailwind v4's `@theme inline` token system in `globals.css`)
- The form primitives that already exist at `@/components/forms`
- The `PhaseHeader` component already at `@/components/setup/PhaseHeader.tsx`
- Supabase auth + Prisma data layer (already wired)

The HTML files show intent; the codebase has the plumbing.

## Fidelity
**High-fidelity.** Final colors, type, spacing, and component behavior are decided. The developer should match the visual design pixel-closely while routing through the existing codebase's primitives where they exist (forms, server actions, voice scenes, etc.).

## Screen-to-route mapping

| # | Screen | Existing route | What changes | Component file |
|---|--------|---------------|--------------|----------------|
| 01 | Sign up | `/signup` (`src/app/signup/page.tsx`) | Visual redesign of `SignupForm` + `SignupLeftPanel`. Keeps form fields & `signupAction` server action. | `source/OnbScreens1.jsx` → `ScreenSignup` |
| 02 | Welcome | `/setup` (`src/app/setup/page.tsx`) | Visual redesign of `SetupWelcome`. Adds the "Ava is speaking" voice indicator. Keeps `useVoiceScene` hook. | `source/OnbScreens1.jsx` → `ScreenWelcome` |
| 03 | Consent | **NEW route** `/setup/consent` | New step in the flow — two-column promise/ask. Insert between welcome and protect. | `source/OnbScreens1.jsx` → `ScreenConsent` |
| 04 | Protect | `/setup/protect` (`src/app/setup/protect/page.tsx`) | Visual redesign of `SetupProtect`. Adds "Recommended" pill on SMS and a phone-verified confirmation row beneath options. | `source/OnbScreens2.jsx` → `ScreenProtect` |
| 05 | About you | `/about-you` (`src/app/about-you/page.tsx`) | Visual redesign of `AboutYouForm`. Adds left-rail question index with progress checkmarks. Keeps debounced localStorage autosave. | `source/OnbScreens2.jsx` → `ScreenAbout` |
| 06 | Your life | **NEW route** `/your-life` (replaces minimal `/start`) | New three-pane app shell: phase-aware sidebar, agent conversation, live profile pane. Requires backend for agent transcript + profile entity store. | `source/OnbScreens2.jsx` → `ScreenLife` |

> The existing `PhaseHeader` at `src/components/setup/PhaseHeader.tsx` is close in concept but needs the visual update shown in `OnbPhaseHeader` (hairline progress bar, small-caps `Phase 01 / 06 · WELCOME` typography, optional `rightSlot` for `AutoSaveBadge` / `StatusPill`).

---

## Design Tokens

All values below are EXACT and ready to add to `src/app/globals.css` under `@theme inline`.

### Colors

```css
/* Surfaces — the cream paper palette */
--color-paper:        #F4EFE6;   /* primary background */
--color-paper-deep:   #EDE6D7;   /* panel / sidebar / "ledger" surfaces */
--color-card:         #FCFAF5;   /* card / form surface */

/* Ink — the type stack */
--color-ink:          #13131A;   /* primary text, primary CTA fill */
--color-ink-soft:     #5C5A5A;   /* body / supporting */
--color-ink-faint:    #8E8B85;   /* captions, meta, small-caps labels */

/* Hairlines */
--color-hairline:        rgba(19,19,26,0.10);  /* card borders */
--color-hairline-soft:   rgba(19,19,26,0.06);  /* dividers */

/* Brand accent — used SPARINGLY */
--color-brand-indigo:    #3B35C3;            /* `brand-indigo-700` from existing tokens */
--color-brand-indigo-tint: rgba(59,53,195,0.06);

/* Notary accent */
--color-gold:        #A98032;   /* "saved" dot, attorney-reviewed pill, ✓ on completed steps */

/* Status */
--color-success:     #10B981;
```

### Type

```
font-sans:   Inter (existing in repo, served via next/font)
font-serif:  Instrument Serif (existing in repo, served via next/font)
```

| Use | Family | Size | Weight | Line-height | Tracking |
|-----|--------|------|--------|-------------|----------|
| Display lg (Welcome H1) | Inter | 64px | 500 | 1.02 | -0.03em |
| Display md (Protect H1) | Inter | 52px | 500 | 1.04 | -0.025em |
| Display sm (About H1, Consent H1) | Inter | 46–48px | 500 | 1.05 | -0.025em |
| Italic accent (in display) | Instrument Serif | inherit | 400 italic | inherit | -0.01em |
| Body lg | Inter | 17–18px | 400 | 1.6–1.7 | normal |
| Body | Inter | 15–16px | 400 | 1.55 | normal |
| Caption | Inter | 13.5px | 400 | 1.55 | normal |
| Eyebrow / label | Inter | 11px | 500 | 1.55 | 0.18–0.22em uppercase |
| Number index (in serif italic) | Instrument Serif | 14–22px | 400 italic | 1 | -0.02em |

### Spacing & layout
- Base scale: existing Tailwind 4px grid.
- **Page gutter** on flow screens: `96px` horizontal, ~`56px` vertical above the H1.
- **Card padding**: `20–24px` on small grouped cards, `32–36px` on larger ones.
- **Form field height** (`OnbInput`): `14px 16px` padding inside, 10px radius.
- **Pill button**: `14px 28px` padding (lg) or `11px 22px` (md), radius `999px`.

### Radius
| Token | px | Used for |
|-------|----|----------|
| `radius-sm` | 4 | small inline tags |
| `radius-md` | 10 | inputs |
| `radius-lg` | 12 | inline panels (spouse / dependents blocks) |
| `radius-xl` | 14 | option cards (Protect screen) |
| `radius-2xl` | 16–18 | full-bleed cards / right pane on "Your life" |
| `radius-pill` | 999 | every CTA, every status pill |

### Shadows
```css
/* CTA — primary */
0 1px 0 rgba(255,255,255,0.06) inset, 0 6px 18px rgba(19,19,26,0.18)

/* Selected option card on Protect */
0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 28px rgba(19,19,26,0.06)
```

### Motion
- Hover scale on primary CTA: `transform: scale(1.02)` over 200ms ease.
- Progress bar fill: `transition: width 500ms cubic-bezier(0.16,1,0.3,1)`.
- No bouncy / showy animation anywhere in this flow — the tone is settled.

---

## Component Specs

### `OnbPhaseHeader`
A sticky-feel header that frames every flow screen except `01 Sign up` (which has its own split-panel layout).

- Layout: 3-column flex — wordmark · "Phase N of M · LABEL" · rightSlot (step counter or status pill).
- Background: `rgba(244,239,230,0.92)` + `backdrop-filter: blur(8px)`.
- Border-bottom: `1px solid var(--color-hairline)`.
- Padding: `18px 36px`.
- The "Phase N / M" string uses uppercase tracked 11px, with a tiny 4px indigo dot between phase number and phase label.
- A hairline 1px progress strip sits below the divider; its filled portion is `var(--color-ink)`.
- API:
  ```ts
  interface PhaseHeaderProps {
    phase: number;          // 1..6
    phaseLabel: string;     // 'Welcome', 'Consent', etc.
    totalPhases?: number;   // default 6
    step?: number;
    stepCount?: number;
    rightSlot?: ReactNode;  // AutoSaveBadge | StatusPill | etc.
    progress?: number;      // 0..1 override
  }
  ```
- The existing `src/components/setup/PhaseHeader.tsx` is close — update its tokens to match, swap the indigo progress fill to `var(--color-ink)`, and refresh the typography to match the spec.

### `OnbButton`
Primary CTA = solid ink pill with cream text and an arrow. The existing `Button` in `@/components/forms` should gain a new variant (or a new `tone="ink"` prop) that produces this look — do not replace the existing indigo variant, the indigo CTA is still used on the marketing site.

```tsx
// Primary (default in this flow)
background: var(--color-ink);
color: var(--color-card);
padding: 14px 28px;            // lg
border-radius: 9999px;
border: 1px solid var(--color-ink);
font-size: 14px;
font-weight: 500;
display: inline-flex; gap: 10px; align-items: center;

// Secondary / ghost
background: transparent;
color: var(--color-ink);
border: 1px solid var(--color-hairline);
```

### `OnbInput` / `OnbSelect`
- Outer `<div>` with `padding: 14px 16px`, radius 10, background `--color-card`, border `--color-hairline`.
- Label sits above the input as an uppercase 11px tracked eyebrow, with an optional gold "· SAVED" suffix flush-right.
- No focus ring is shown in mocks — use a subtle 2px outline at `var(--color-ink)` for keyboard focus.

### `OnbStatusPill`
Small inline pill — 6px colored dot + uppercase tracked text — for `Encrypted`, `Autosaved`, `Live`, etc.

```tsx
padding: 5px 10px;
background: rgba(19,19,26,0.04);
border-radius: 9999px;
font-size: 10.5px;
letter-spacing: 0.18em;
text-transform: uppercase;
color: var(--color-ink-soft);
```

### `OnbFooter`
Quiet 11px tracked uppercase line at the very bottom of each flow screen, with a lock glyph on the left and "NC · V1 · ATTORNEY-REVIEWED" on the right.

---

## Screens — detailed notes

### 01 · Sign up
- Two-column layout. Left = cream-deep editorial panel; right = focused 3-field form.
- Left panel: vertical-stripe ledger texture (`repeating-linear-gradient`), wordmark top-left, eyebrow "EST. 2025 · NORTH CAROLINA" top-right, Instrument Serif italic 60px headline at the bottom, two status pills below (`Attorney-reviewed` gold, `Encrypted end-to-end` green).
- Right column: small eyebrow "PHASE 01 / 06 · ACCOUNT", display heading "Begin your *record*." with italic accent, three inputs (first/last in a two-col grid, then email), and a row with sign-in link on the left and primary CTA on the right.
- **Keeps `signupAction` server action and the `SocialAuthButtons` flow** — those still belong on the form, just visually demoted (or moved into a collapsible "or continue with…" section). Talk to the team about whether SSO is V1 scope.

### 02 · Welcome
- `OnbPhaseHeader` with `phase=1 phaseLabel="Welcome" step=1 stepCount=4`, rightSlot = `Encrypted` status pill.
- Centered content max-width 680px.
- Above the headline: an "Ava is speaking" voice indicator — a pill that contains a 34px gradient avatar (the only place the indigo→violet gradient still lives in this flow), six tiny animated bars suggesting waveform, and a small tracked uppercase label.
- Headline: "Hi {firstName}, *welcome*." — italic accent on "welcome".
- Two paragraphs of body copy.
- Single ink CTA + a 13px caption "About 12 minutes · pause anytime".
- Voice integration: use the existing `useVoiceScene("welcome")` hook from `@/components/voice`. The avatar's waveform should animate while `status === "playing"` and freeze otherwise.

### 03 · Consent (NEW)
- New route: `src/app/setup/consent/page.tsx`. Add this between `/setup` and `/setup/protect`.
- `OnbPhaseHeader` with `phase=1 phaseLabel="Consent" step=2 stepCount=4`.
- Headline: "What we *promise*, and what we *ask* back." — both accents in serif italic indigo.
- Two-column ledger grid (1.1fr 1fr):
  - **Left column** "Our promise" with 4 numbered items (`01–04` in serif italic indigo).
  - **Right column** "In return, we ask" with 3 numbered items (`01–03` in serif italic gold).
  - Each row: 36px grid for the number, then title (16px / 500 weight / -0.005em tracking) + 13.5px description.
  - Rows separated by `1px solid var(--color-hairline-soft)`; column header has full `var(--color-hairline)` underline.
- Below the asks column: a single `Accept` checkbox in a 12px-radius card with ink-filled checkbox (white check), then the primary CTA "I understand, let's continue".
- **Persistence**: write a `user_consents` row on accept — minimum fields are user id, version string ("v1.0"), timestamp, IP. Treat acceptance as a hard gate to proceed.

Promise text (use verbatim):
1. **We encrypt everything** — Your record is encrypted on our servers and on your device. Not even our team reads it.
2. **We never sell your data** — No advertising, no brokers, no partners. The product is paid for by you, not by your information.
3. **Nothing leaves without you** — We do not share with family, attorneys, or beneficiaries unless you explicitly direct us to.
4. **You can take it with you** — Export your full record as a portable document anytime. Close your account and we delete it.

Ask text (use verbatim):
1. **Tell us what is true** — Names, dates, accounts. Best as you know them — we will help you reach the right detail later.
2. **Keep your sign-in safe** — Use a real phone number or authenticator app. This is the lock on the cabinet.
3. **Update when life changes** — A marriage, a birth, a new home. A few minutes from you keeps the record honest.

### 04 · Protect
- `OnbPhaseHeader` with `phase=1 phaseLabel="Protect" step=3 stepCount=4`.
- Headline: "Let's *protect* what you share with me."
- Two option cards (text message + authenticator app). The recommended option has:
  - `border: 1px solid var(--color-ink)` (vs hairline on the other).
  - A "RECOMMENDED" pill in solid ink next to the title — uppercase 9.5px tracked 0.18em.
  - Icon background `var(--color-brand-indigo-tint)`.
- After a user picks SMS, render the inline phone-verified confirmation strip beneath:
  - Subtle gray bg, a green check chip on the left, "Phone verified · +1 (704) ••• 4127" text, "Change" link on the right.
- The existing `OptionCard` link to `/about-you` should now link to `/about-you` (unchanged) once the user has confirmed a method.

### 05 · About you
- `OnbPhaseHeader` with `phase=2 phaseLabel="About you"`, with `progress={0.42}` explicit override and rightSlot = `Autosaved · 12s ago` pill.
- Two-column grid (0.95fr 1.6fr) — left rail editorial sidebar, right column form.
- **Left rail** shows the same numbered Instrument Serif italic index used in Consent. Each row: `[01] Legal name [✓]`. Completed = ink text + gold check. Incomplete = ink-faint text, no check.
- **Right column** form layout:
  - Single Legal name input (full-width)
  - Two-col grid: Date of birth · State of residence
  - Single Marital status select
  - **Grouped block — Spouse / Partner** (12px radius, hairline border, `--color-card` bg): uppercase eyebrow header + 3 nested inputs.
  - **Grouped block — Children & dependents**: eyebrow header + count chip on right + a dashed-border "Add a child or dependent" button with a small indigo `+` glyph.
  - Single "Anyone else who depends on you?" select.
- Footer row: "4 of 7 complete" caption left; "Back" ghost button + "Save & continue" primary CTA on the right.
- Reuse the existing `AboutYouForm` autosave logic (debounced localStorage write under `nok_about_you`).
- The existing `Repeater` component in `@/components/forms` is what should back the dependents block — restyle to the dashed-add-row aesthetic.

### 06 · Your life (NEW shell)
- New route: `src/app/your-life/page.tsx`. This is the post-setup app shell where Phase 3 begins.
- Three-pane grid: `236px 1fr 460px` over a `900px` minimum viewport height.
- **Left pane** — app sidebar on the `--color-paper-deep` surface:
  - Wordmark
  - "Phase 03 / 06 · Your life" meter card with 38% progress bar and "12 of 31 prompts answered".
  - Section nav with 6 rows (You · Family · Your life · What you own · Who you protect · Your wishes). Done = gold ✓; active = card with hairline border + indigo italic number; locked = ink-faint + tiny lock glyph.
  - At the bottom: user avatar pill with name + city.
- **Middle pane** — conversation:
  - Header: 40px gradient avatar, "Ava · your agent" + listening status with green pulse dot, plus an `Autosaved` pill and a `Pause` button on the right.
  - Messages list: agent messages = card on `--color-card` with hairline border, top-left corner cut to 4px radius (the "speech bubble" cue); user messages = ink fill on the right, cream text, top-right corner 4px.
  - **Extracted-facts inline panel**: when the agent confirms something, it renders an inset card inside its own message — `rgba(59,53,195,0.05)` bg, `var(--color-brand-indigo-tint)` border — listing key/value pairs. This is the bridge between conversation and the live profile pane.
  - Date dividers: tracked uppercase 10.5px with hairlines on either side.
- **Right pane** — the live profile:
  - Header: "YOUR RECORD" eyebrow, "The Reynolds household" h-mark, `Live` green status pill.
  - `ProfileBlock` sections for each completed phase (You / Family / Your life). Each block has a tracked uppercase header with an underline, then a dl grid of `dt: small caption / dd: 13px medium`.
  - The currently-active section gets a "Building…" indigo eyebrow on the right.
  - At the bottom, a `--color-paper-deep` "Coming up" panel with a dashed border previewing the next phase.
- **Composer** at the bottom of middle pane: pill input with `kbd` showing "space" to speak, a circular mic button, and a circular ink send button. 18px padding above the input; a small hint line below: "Press Esc to skip a question. Ava remembers everything you say."

---

## Backend / state requirements

The visual design assumes the following data shape — please confirm with the existing Prisma schema before implementing:

| Concept | Where surfaced | Notes |
|---|---|---|
| `user.firstName` | Welcome, About you, Your life sidebar | Already on `User` model. |
| `user_consents.v1_accepted_at` | Consent (gate) | **NEW** — add a model. |
| `mfa_method` enum: `sms` \| `totp` \| null | Protect | Whichever the user chose. |
| `about_you` JSON | About you, Profile pane | Already exists in localStorage; needs to land on the server. |
| `conversation_turn[]` | Your life · middle pane | **NEW** — message rows with `role: 'agent' \| 'user'`, `body`, `extracted_facts: jsonb`. |
| `record.sections[]` | Your life · right pane | Phase 3 begins building this from extracted facts. **NEW**. |

---

## Interactions & Behavior
- **Sign up "Next"**: existing `signupAction`, then redirect to `/setup` (welcome).
- **Welcome "Let's begin"**: redirect to `/setup/consent`.
- **Consent "I understand…"**: write consent row, redirect to `/setup/protect`.
- **Protect option click**: redirect to `/setup/protect/sms` or `/setup/protect/totp` (sub-flows not designed yet) → confirm → redirect to `/about-you`.
- **About you "Save & continue"**: persist form, redirect to `/your-life`.
- **Your life composer "send"**: append turn, run extraction, animate new fact rows into the right profile pane.

## Assets
No bitmap assets needed for the flow itself — every glyph is inline SVG.

The wordmark logomark is the two overlapping rotated ellipses (`<ellipse>` × 2 at `-30deg`) seen in `OnbWordmark`. If the brand has an official lockup, swap it in there in one place.

## Files in this bundle
- `preview.html` — open in a browser to see all 6 screens stacked vertically.
- `source/OnbChrome.jsx` — `OnbWordmark`, `OnbPhaseHeader`, `OnbFooter`, `OnbDisplay`, `OnbButton`, `OnbInput`, `OnbSelect`, `OnbStatusPill`, and the `ONB` color/font token object.
- `source/OnbScreens1.jsx` — `ScreenSignup`, `ScreenWelcome`, `ScreenConsent`, plus the `Frame` wrapper and `ARTBOARD_W/H` constants used to size each screen on the design board (1280×860 — these are mock sizes, not production constraints).
- `source/OnbScreens2.jsx` — `ScreenProtect`, `ScreenAbout`, `ScreenLife` plus internal helpers `AgentMsg`, `UserMsg`, `ProfileBlock`.

## Implementation checklist
- [ ] Add the new color tokens to `globals.css` under `@theme inline`.
- [ ] Update `PhaseHeader` to match the new spec (ink progress bar, new typography, optional `progress` prop).
- [ ] Add an "ink" variant (or `tone="ink"`) to the existing `Button` in `@/components/forms`.
- [ ] Add `OnbStatusPill` as a shared component under `@/components/feedback` (or wherever pills live).
- [ ] Redesign `SignupForm` + `SignupLeftPanel` per Screen 01.
- [ ] Redesign `SetupWelcome` per Screen 02. Wire the voice waveform indicator to the existing `useVoiceScene` status.
- [ ] **NEW** route `/setup/consent` with `SetupConsent` component per Screen 03. Add `user_consents` Prisma model + server action.
- [ ] Redesign `SetupProtect` per Screen 04. Add the recommended pill + post-confirm inline strip.
- [ ] Redesign `AboutYouPage` + `AboutYouForm` per Screen 05. Add the left-rail index. Promote the localStorage autosave to a server action on submit.
- [ ] **NEW** route `/your-life` with the three-pane shell per Screen 06. This is the larger build — agent transcript model, extraction pipeline, profile sections store.
- [ ] Visual QA pass against `preview.html`.
