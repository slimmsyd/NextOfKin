# NextOfKin · Home Page V1 — Handoff Package

This folder contains the V1 of the NextOfKin home page, ready to hand off.

## What you get

- **`nextofkin-home-v1.html`** — A single self-contained HTML file with the entire home page bundled inline. Open it in any modern browser to preview. Works offline (with a note about fonts — see below).
- **`README.md`** — This document.

The unbundled source (React components, design system tokens, raw HTML scaffold) lives in `/mockups`, `/assets`, and `/colors_and_type.css` of the project. Pull from there if you want to fork the components or re-compose the page.

---

## Section order

The page reads top-to-bottom in this order:

| # | Section | Notes |
|---|---------|-------|
| 1 | **Hero** | Indigo inset card · floating pill nav · 5 estate-OS folder cards peeking up. *"Make sure what you built gets to the people you love."* |
| 2 | **Trusted by** | Logo strip — currently placeholder wordmarks (Meridian, Holloway, Westbrook, ATELIER, Stanton, Avalon Trust) until real partner marks are signed |
| 3 | **Closing the gap** | Big serif percentage stats on dusty lavender (70% · $28B · 18mo · $70K) |
| 4 | **What we do** | Image accordion — 3 cards (a complete picture / legal documents / day-of plan), hover to expand |
| 5 | **This was built for us** | Two horizontal scroll rows pairing pull-quote cards with video thumbnail cards (DeKalb County · Morganza · PBS · NYT · Atlantic · NPR) |
| 6 | **How it works** | Interactive form preview — 4 chained questions that land on "Your recommended plan" |
| 7 | **What we protect** | Two-column lists, no icons (what you have / who you protect) |
| 8 | **We don't stop at the will** | Dark indigo editorial · 4 serif-italic actions (search, notify, memorialize, give) |
| 9 | **FAQ** | Two-column · 8 questions · rich answers with bullet lists. First Q open by default |
| 10 | **Closing CTA** | Indigo card · *"Your family is worth a plan"* |
| 11 | **Footer** | Newsletter strip · 4 link columns · social · legal disclaimer |

---

## Drop-zones requiring real assets

The page renders with placeholders for any user-supplied content. Each `<image-slot>` element accepts a drag-and-dropped image at runtime and persists it. Replace these before launch:

| ID | What to drop in |
|----|-----------------|
| `s1-thumb` through `s6-thumb` | YouTube thumbnails for the 6 video stories in "This was built for us" |

There are also several spots in markup that need real attribution before publishing:

- **Partner logos** in the Trusted-by strip — swap placeholder wordmarks for real partner marks once signed
- **Stat sources** in section 3 — currently labeled "Federal Reserve · 2022", "USDA · Center for Heirs' Property", "EstateExec · 2024". Verify exact citations before launch.
- **Quote attribution** in "This was built for us" — quotes are plausible placeholders modeled after each video. Replace with verified pulls from the actual reporting.
- **Video URLs** — every video card has `href="#"`. Replace with the real YouTube URL before launch.

---

## Brand & design system

- **Type**: Inter (sans, weights 400/500/600/700) + Instrument Serif (italic accent, occasionally roman for editorial heads)
- **Primary**: deep indigo `#3B35C3`, violet gradient `#5852F5 → #7B61FF`
- **Accents**: pale lavender surfaces (`#F8F7FF`, `#F4F1FF`, `#F0EFFF`), dusty lavender (`#ADA8CE`), near-black (`#0A0A0F`)
- **No tan / cream / warm-neutral surfaces** — those were tried and rejected; brand is strictly the cool indigo-violet family with the deep-black dark-mode section
- **Folder peek** — pastel surfaces (lavender, mint, blush, ivory, neutral) used only on the hero folder cards. They sit against the dark indigo card so they read as a row of physical file folders

---

## Known issues / TODO

- **Webfont bundling** — the offline bundler couldn't fetch 10 .woff2 files from fonts.gstatic.com during bundling (404s). The bundled file loads fonts at runtime if there's a network connection; offline it falls back to Georgia/system sans. For production, host the .woff2 files locally and reference them with `@font-face`.
- **Pricing section** — removed from main flow. Lives in `/mockups` as `Section07Pricing` (inside `HomeSectionsV1.jsx`) if it returns.
- **Trust section** ("Your information stays yours") — removed from main flow. Same location: `Section08Trust`.
- **Hero color variants** — Twilight Bloom and Aubergine are designed and live in `/mockups` (`Section00HeroTwilight.jsx`, `Section00HeroAubergine.jsx`). Indigo is currently in the export.
- **"We don't stop at the will" variants** — V2 (light timeline) and V3 (dark product peek) are designed and live in `/mockups`. V1 (dark editorial) is currently in the export.

---

## Composition

The home page is composed by `mockups/home-page-v1.html`, which loads these component files in order:

```
mockups/
├── Section00Hero.jsx              · Hero (indigo, folders, new copy)
├── Section02LogoStripV2.jsx       · Trusted-by logo strip
├── Section03StatsV2.jsx           · Closing the gap (big serif stats)
├── Section02WhatWeDoV2.jsx        · Image accordion (3 cards)
├── Section03BuiltForUsV2.jsx      · Two-row scrolling video + quote pairs
├── Section04HowItWorksV2.jsx      · Interactive form preview
└── HomeSectionsV1.jsx             · Sections 05/06/09/10 + Footer
```

Each section is a self-contained React component exported to `window` so the composition file can pick and arrange them.

---

*A service of OnCode Software Solutions · Built in Raleigh, NC*
