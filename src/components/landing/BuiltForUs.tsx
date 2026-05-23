"use client";

import { useSyncExternalStore } from "react";
import Marquee from "react-fast-marquee";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
}

type QuoteCard = {
  type: "quote";
  quote: string;
  name: string;
  source: string;
  initials: string;
};

type VideoCard = {
  type: "video";
  title: string;
  source: string;
  // Optional. Leave "" to hide the duration chip. YouTube oEmbed doesn't
  // expose duration; fill these in manually when you want them shown.
  duration: string;
  // Paste the 11-char id from the YouTube URL (e.g. youtu.be/<id> or ?v=<id>).
  // Leave "" to keep the gradient placeholder until you have a real link.
  youtubeId: string;
  // Full watch URL. Opens in a new tab when the card is clicked.
  href: string;
};

type Card = QuoteCard | VideoCard;

const row1: Card[] = [
  {
    type: "quote",
    quote:
      "My great-grandfather bought this land after he was freed. Now we don't even know who owns it.",
    name: "The Brooks family",
    source: "Featured in “Goodbye, Morganza”",
    initials: "TB",
  },
  {
    type: "video",
    title:
      "Lost Inheritance: How Black Farmers Are Losing Their Land Through Heirs' Property",
    source: "Union of Concerned Scientists",
    duration: "",
    youtubeId: "sYX7WkyyLoo",
    href: "https://www.youtube.com/watch?v=sYX7WkyyLoo",
  },
  {
    type: "quote",
    quote:
      "Heirs property is the leading cause of involuntary land loss for Black Americans.",
    name: "Estate planning expert",
    source: "Quoted in PBS NewsHour",
    initials: "Ep",
  },
  {
    type: "video",
    title: "3 Estate Planning Mistakes That Cost Families THOUSANDS",
    source: "The Estate Planning Guys",
    duration: "",
    youtubeId: "Gi-aWsnpo-c",
    href: "https://www.youtube.com/watch?v=Gi-aWsnpo-c",
  },
  {
    type: "quote",
    quote:
      "Half of American adults will die without a will. Their families pay the cost for years.",
    name: "Investigative report",
    source: "Probate journalism · 2024",
    initials: "Ir",
  },
  {
    type: "video",
    title:
      "Where's The Will? The Importance of Advance Directives & Estate Planning in Black Communities",
    source: "SHARE Cancer Support",
    duration: "",
    youtubeId: "C2fW551mj4A",
    href: "https://www.youtube.com/watch?v=C2fW551mj4A",
  },
  {
    type: "video",
    title: "What REALLY Happens When Someone Dies Without A Will?",
    source: "The Estate Planning Guys",
    duration: "",
    youtubeId: "0j8ZROHjsnM",
    href: "https://www.youtube.com/watch?v=0j8ZROHjsnM",
  },
];

const row2: Card[] = [
  {
    type: "video",
    title: "How Property Law Is Used to Appropriate Black Land",
    source: "VICE News",
    duration: "",
    youtubeId: "ls3P_FicO7I",
    href: "https://www.youtube.com/watch?v=ls3P_FicO7I",
  },
  {
    type: "quote",
    quote:
      "Black families have lost an estimated ninety percent of the land they once owned.",
    name: "The Atlantic",
    source: "Long-form reporting",
    initials: "TA",
  },
  {
    type: "video",
    title:
      "Black Wealth Lost in Probate, Tax Sales & Improper Planning! Estate Planning Questions Answered",
    source: "Shaheedah Hill",
    duration: "",
    youtubeId: "GUZ42wza4pk",
    href: "https://www.youtube.com/watch?v=GUZ42wza4pk",
  },
  {
    type: "quote",
    quote:
      "The legal system wasn't designed with us in mind. Our families have to design around it.",
    name: "Heir interviewed",
    source: "NPR Code Switch",
    initials: "Hi",
  },
  {
    type: "video",
    title: "The Importance Of Estate Planning For Black Americans",
    source: "MS NOW",
    duration: "",
    youtubeId: "8LY3t7FN2p0",
    href: "https://www.youtube.com/watch?v=8LY3t7FN2p0",
  },
  {
    type: "video",
    title: "What REALLY Happens When You Die Without a Will?",
    source: "Michael Ruger · Greenbush Financial",
    duration: "",
    youtubeId: "9UqRjPd3Z2c",
    href: "https://www.youtube.com/watch?v=9UqRjPd3Z2c",
  },
];

function QuoteTile({ card }: { card: QuoteCard }) {
  return (
    <article className="shrink-0 w-[320px] md:w-[380px] bg-white rounded-2xl p-6 md:p-7 shadow-[0_8px_24px_-12px_rgba(10,10,15,0.12)] flex flex-col min-h-[220px] md:min-h-[240px]">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-brand-violet text-white text-xs font-semibold"
        >
          {card.initials}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">
            {card.name}
          </p>
          <p className="text-xs text-foreground/60 leading-tight mt-0.5 truncate">
            {card.source}
          </p>
        </div>
      </div>
      <p className="mt-4 text-base md:text-[17px] text-foreground/90 leading-snug">
        &ldquo;{card.quote}&rdquo;
      </p>
    </article>
  );
}

function VideoTile({ card }: { card: VideoCard }) {
  const reducedMotion = useReducedMotion();

  const hasMedia = card.youtubeId.length > 0;
  const embedSrc = hasMedia
    ? `https://www.youtube-nocookie.com/embed/${card.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${card.youtubeId}&controls=0&modestbranding=1&rel=0&playsinline=1&disablekb=1&iv_load_policy=3`
    : "";
  const posterSrc = hasMedia
    ? `https://i.ytimg.com/vi/${card.youtubeId}/maxresdefault.jpg`
    : "";

  return (
    <article
      className="shrink-0 w-[320px] md:w-[380px] rounded-2xl overflow-hidden relative flex flex-col justify-end min-h-[220px] md:min-h-[240px] text-white bg-[#0A0820]"
      style={
        hasMedia
          ? undefined
          : {
              background:
                "linear-gradient(180deg, #2A2455 0%, #15113A 60%, #0A0820 100%)",
            }
      }
    >
      {hasMedia && reducedMotion && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {hasMedia && !reducedMotion && (
        <iframe
          src={embedSrc}
          title={`${card.title}: silent preview`}
          aria-hidden
          tabIndex={-1}
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture"
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {hasMedia && (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"
        />
      )}

      {!hasMedia && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="w-8 h-8 text-white/15"
            fill="currentColor"
          >
            <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
          </svg>
        </div>
      )}

      <span
        aria-hidden
        className="absolute top-4 left-4 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-violet text-white shadow-[0_4px_12px_rgba(88,82,245,0.45)] pointer-events-none"
      >
        <svg viewBox="0 0 12 12" className="w-3 h-3 ml-0.5" fill="currentColor" aria-hidden>
          <path d="M2 1l9 5-9 5z" />
        </svg>
      </span>
      {card.duration && (
        <span className="absolute top-4 right-4 z-10 px-2 py-1 rounded bg-black/40 text-[11px] font-medium text-white/95 backdrop-blur-sm pointer-events-none">
          {card.duration}
        </span>
      )}

      <div className="relative z-10 p-5 md:p-6">
        <h3 className="text-sm md:text-base font-semibold leading-snug">
          {card.title}
        </h3>
        <p className="mt-1.5 text-xs text-white/65 leading-tight">
          {card.source}
        </p>
      </div>

      {hasMedia && (
        <a
          href={card.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch "${card.title}" on YouTube`}
          className="absolute inset-0 z-20"
        />
      )}
    </article>
  );
}

function Tile({ card }: { card: Card }) {
  return card.type === "quote" ? (
    <QuoteTile card={card} />
  ) : (
    <VideoTile card={card} />
  );
}

function MarqueeRow({
  items,
  direction,
}: {
  items: Card[];
  direction: "left" | "right";
}) {
  return (
    <Marquee
      direction={direction}
      pauseOnHover
      speed={40}
      autoFill
    >
      {items.map((card, i) => (
        <div key={i} className="mr-4 md:mr-5">
          <Tile card={card} />
        </div>
      ))}
    </Marquee>
  );
}

export function BuiltForUs() {
  return (
    <section
      id="built-for-us"
      className="py-24 md:py-32 bg-surface-lavender-200/60"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <p className="text-[11px] md:text-xs font-medium uppercase tracking-[0.18em] text-brand-violet">
          Why we built this
        </p>
        <h2 className="mt-5 md:mt-6 font-serif font-normal tracking-tight text-4xl md:text-6xl lg:text-7xl leading-[1.05]">
          This was built for us.
        </h2>
        <p className="mt-6 text-base md:text-lg text-foreground/65 max-w-2xl mx-auto leading-relaxed">
          The stories that shaped how this works.
        </p>
      </div>

      <div className="mt-14 md:mt-20 space-y-4 md:space-y-5">
        <MarqueeRow items={row1} direction="left" />
        <MarqueeRow items={row2} direction="right" />
      </div>
    </section>
  );
}
