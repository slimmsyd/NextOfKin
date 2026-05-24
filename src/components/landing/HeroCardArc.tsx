"use client";

import {
  motion,
  useTime,
  useTransform,
  type MotionValue,
} from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// 3D arc (Creovine-style) — cards flow continuously left through the arc,
// exit the left edge invisibly, and re-enter from the right edge.
//
// Geometry is parameterised by a single `angle` per card (degrees). All visual
// properties are continuous functions of angle, fitted to the Creovine
// reference snapshot. A global `offset` decreases over time; each card's
// instantaneous angle = wrap(baseAngle + offset). Wrap point (±HALF_CYCLE)
// sits in the invisible zone, so the teleport is unseen.
// ─────────────────────────────────────────────────────────────────────────────

type CardVariant = "lavender" | "lavender-deep" | "dark";

type HeroCardData = {
  tag: string;
  title: string;
  desc: string;
  variant: CardVariant;
  icon: React.ReactNode;
  stat?: { value: string; label: string; barPct?: number };
  chips?: string[];
};

const iconClass = "w-4 h-4";

const Icons = {
  identity: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  land: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <path
        d="M4 11l8-6 8 6v9H4v-9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 20v-5h4v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3 19c0-2.8 2.7-5 6-5s6 2.2 6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 19c0-1.6.5-3 1.5-4 2.7 0 4.5 1.6 4.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  papers: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <path
        d="M6 3h8l4 4v14H6V3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M9 12h6M9 16h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  accounts: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <path
        d="M3 10l9-5 9 5v2H3v-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 12v7M9 12v7M15 12v7M19 12v7M3 20h18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <path
        d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const cards: HeroCardData[] = [
  {
    tag: "Identity",
    title: "Built on who you are.",
    desc: "ID, address, contacts. Captured once, used everywhere.",
    variant: "lavender",
    icon: Icons.identity,
    stat: { value: "10 min", label: "to start", barPct: 100 },
  },
  {
    tag: "Land",
    title: "Family land, named clearly.",
    desc: "Deeds tracked. Heirs-property risk flagged.",
    variant: "dark",
    icon: Icons.land,
    chips: ["Deed", "Parcel", "NC"],
  },
  {
    tag: "People",
    title: "Name who you protect.",
    desc: "Beneficiaries and executor, defined once.",
    variant: "lavender",
    icon: Icons.people,
    stat: { value: "1", label: "source of truth" },
  },
  {
    tag: "Papers",
    title: "What your family will need.",
    desc: "Organized, encrypted, releasable when it matters.",
    variant: "lavender-deep",
    icon: Icons.papers,
    chips: ["Will", "IDs", "Policies"],
  },
  {
    tag: "Accounts",
    title: "Every account, in one place.",
    desc: "Banks, IRAs, 401(k)s — each with a named heir.",
    variant: "dark",
    icon: Icons.accounts,
    stat: { value: "90%", label: "covered", barPct: 90 },
  },
  {
    tag: "North Carolina",
    title: "Attorney-reviewed for NC.",
    desc: "State law is deterministic. Not guessed.",
    variant: "lavender",
    icon: Icons.shield,
    chips: ["NC", "v1"],
  },
];

const cardStyles: Record<
  CardVariant,
  {
    bg: string;
    title: string;
    desc: string;
    pillBg: string;
    pillText: string;
    iconBg: string;
    iconText: string;
    statValue: string;
    statLabel: string;
    barTrack: string;
    barFill: string;
    chipBg: string;
    chipText: string;
  }
> = {
  lavender: {
    bg: "#F0ECFF",
    title: "#1E0A6B",
    desc: "#5B3FCF",
    pillBg: "#E0D9FF",
    pillText: "#3C1FA8",
    iconBg: "#E0D9FF",
    iconText: "#3C1FA8",
    statValue: "#3C1FA8",
    statLabel: "#5B3FCF",
    barTrack: "rgba(60,31,168,0.12)",
    barFill: "#3C1FA8",
    chipBg: "#E0D9FF",
    chipText: "#3C1FA8",
  },
  "lavender-deep": {
    bg: "#E8E0FF",
    title: "#1A0858",
    desc: "#4A30B8",
    pillBg: "#D4C8FF",
    pillText: "#2D158F",
    iconBg: "#D4C8FF",
    iconText: "#2D158F",
    statValue: "#2D158F",
    statLabel: "#4A30B8",
    barTrack: "rgba(45,21,143,0.14)",
    barFill: "#2D158F",
    chipBg: "#D4C8FF",
    chipText: "#1A0858",
  },
  dark: {
    bg: "#1A0F3A",
    title: "#FFFFFF",
    desc: "#9080CC",
    pillBg: "#2D1F6E",
    pillText: "#B8A8FF",
    iconBg: "#2D1F6E",
    iconText: "#B8A8FF",
    statValue: "#B8A8FF",
    statLabel: "#9080CC",
    barTrack: "rgba(184,168,255,0.16)",
    barFill: "#B8A8FF",
    chipBg: "#2D1F6E",
    chipText: "#B8A8FF",
  },
};

function HeroCardInner({ card }: { card: HeroCardData }) {
  const s = cardStyles[card.variant];
  return (
    <div
      className="w-[148px] min-h-[200px] rounded-[14px] flex flex-col"
      style={{
        background: s.bg,
        padding: "13px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-md"
          style={{ background: s.iconBg, color: s.iconText }}
          aria-hidden
        >
          {card.icon}
        </span>
        <span
          className="text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-[3px] rounded-full"
          style={{ background: s.pillBg, color: s.pillText }}
        >
          {card.tag}
        </span>
      </div>

      <div
        className="mt-2 text-[14px] font-bold leading-[1.25]"
        style={{ color: s.title }}
      >
        {card.title}
      </div>

      <div className="mt-1 text-[10px] leading-[1.5]" style={{ color: s.desc }}>
        {card.desc}
      </div>

      {card.chips && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.chips.map((chip) => (
            <span
              key={chip}
              className="text-[9px] font-semibold px-[7px] py-[2px] rounded-full"
              style={{ background: s.chipBg, color: s.chipText }}
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {card.stat && (
        <div className="mt-auto pt-2 flex flex-col gap-1">
          {card.stat.barPct !== undefined && (
            <div
              className="h-[3px] rounded-[2px] overflow-hidden"
              style={{ background: s.barTrack }}
            >
              <div
                className="h-full rounded-[2px]"
                style={{ width: `${card.stat.barPct}%`, background: s.barFill }}
              />
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-[20px] font-extrabold leading-none"
              style={{ color: s.statValue }}
            >
              {card.stat.value}
            </span>
            <span
              className="text-[9px] font-medium"
              style={{ color: s.statLabel }}
            >
              {card.stat.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Arc geometry (curve-fitted to Creovine reference) ──────────────────────

const CARD_W = 148;
const CARD_H = 200;
const CYCLE_SPAN = 96; // total angular range of the cyclic carousel
const HALF_CYCLE = CYCLE_SPAN / 2;
const VISIBLE_FULL = 41; // |angle| < this → fully visible (per base curve)
const FADE_END = 48; // |angle| >= this → invisible

// Base angles for the 6 cards, evenly distributed across the visible arc.
const baseAngles = [-40, -24, -8, 8, 24, 40];

// Wrap an angle into [-HALF_CYCLE, HALF_CYCLE].
function wrap(a: number) {
  const m = ((a + HALF_CYCLE) % CYCLE_SPAN + CYCLE_SPAN) % CYCLE_SPAN;
  return m - HALF_CYCLE;
}

// Horizontal arc position (px). Fitted: x ≈ 10.72·θ − 0.00167·θ³.
function arcX(angle: number) {
  return 10.72 * angle - 0.00167 * angle * angle * angle;
}

// Vertical perspective rise (px). Edge cards sit slightly higher.
function arcY(angle: number) {
  return -30 + 0.0146 * angle * angle;
}

// Scale falls off with angle: center ≈ 1.0, ±41° ≈ 0.79.
function arcScale(angle: number) {
  return 1 - 0.000125 * angle * angle;
}

// Opacity: base curve to ±41, linear fade to 0 by ±48, then invisible.
function arcOpacity(angle: number) {
  const a = Math.abs(angle);
  if (a >= FADE_END) return 0;
  if (a > VISIBLE_FULL) {
    const base = 1 - 0.00014 * VISIBLE_FULL * VISIBLE_FULL;
    return base * (1 - (a - VISIBLE_FULL) / (FADE_END - VISIBLE_FULL));
  }
  return 1 - 0.00014 * angle * angle;
}

// z-index: closer to center sits on top.
function arcZ(angle: number) {
  return Math.round(100 - Math.abs(angle));
}

function ArcCard({
  card,
  baseAngle,
  offset,
}: {
  card: HeroCardData;
  baseAngle: number;
  offset: MotionValue<number>;
}) {
  const angle = useTransform(offset, (o) => wrap(baseAngle + o));
  // Bake card-centering offsets into x/y so element's `top:50%; left:50%`
  // anchor lands on the card's center, not its top-left corner.
  const x = useTransform(angle, (a) => arcX(a) - CARD_W / 2);
  const y = useTransform(angle, (a) => arcY(a) - CARD_H / 2);
  const rotateY = useTransform(angle, (a) => a);
  const scale = useTransform(angle, arcScale);
  const opacity = useTransform(angle, arcOpacity);
  const zIndex = useTransform(angle, arcZ);

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        x,
        y,
        rotateY,
        scale,
        opacity,
        zIndex,
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
      }}
    >
      <HeroCardInner card={card} />
    </motion.div>
  );
}

const DURATION_MS = 45000; // one full cycle

export function HeroCardArc() {
  const time = useTime();
  // offset linearly decreases from 0 to -CYCLE_SPAN, then jumps back to 0.
  // Jump happens at a wrap boundary where every card is already wrapped,
  // so the modular arithmetic absorbs the snap.
  const offset = useTransform(
    time,
    (t) => -((t % DURATION_MS) / DURATION_MS) * CYCLE_SPAN,
  );

  return (
    <div
      className="relative mx-auto w-full max-w-[900px] h-[280px]"
      style={{
        perspective: "1200px",
        perspectiveOrigin: "50% 40%",
      }}
      aria-hidden
    >
      {cards.map((card, i) => (
        <ArcCard
          key={card.tag}
          card={card}
          baseAngle={baseAngles[i]}
          offset={offset}
        />
      ))}
    </div>
  );
}
