import Link from "next/link";
import { HeroCardArc } from "./HeroCardArc";
import type { LandingCta } from "@/lib/landing-cta";

const trustItems = [
  {
    label: "About an hour to start",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <path
          d="M3 8.5l3 3 7-7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "NC attorney-reviewed",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <path
          d="M8 1.5L2.5 3.5v4c0 3 2.5 5.5 5.5 7 3-1.5 5.5-4 5.5-7v-4L8 1.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Cancel anytime",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5" aria-hidden>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 5v3.5l2 1.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function Hero({ cta }: { cta: LandingCta }) {
  return (
    <section>
      <div
        className="relative pt-32 md:pt-40 lg:pt-44 pb-24 md:pb-32 lg:pb-40 text-white overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #2A2599 0%, #3B35C3 20%, #4A42D8 42%, #6B5FE8 62%, #9B83FF 80%, #D8CFFF 93%, #F8F7FF 100%)",
        }}
      >
        {/* atmospheric haze — soft white cloud blobs through the middle band */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-[35%] h-[60%] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 28% 40%, rgba(255,255,255,0.22) 0%, transparent 62%), radial-gradient(ellipse 48% 38% at 78% 55%, rgba(255,255,255,0.20) 0%, transparent 65%), radial-gradient(ellipse 75% 32% at 50% 78%, rgba(255,255,255,0.32) 0%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />
        {/* warm violet glow at top */}
        <div
          aria-hidden
          className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(155,131,255,0.45) 0%, transparent 72%)",
          }}
        />

        {/* === Centered content === */}
        <div className="relative z-10 px-6 md:px-10 lg:px-16 text-center max-w-5xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 text-xs md:text-sm text-white/95">
            <span
              aria-hidden
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            />
            Available now in North Carolina · Built for our families
          </span>

          <h1 className="mt-8 font-semibold tracking-[-0.015em] leading-[1.05] text-3xl md:text-5xl lg:text-6xl">
            Make sure what you built
            <br />
            gets to the{" "}
            <span className="font-serif font-normal italic text-[#D8CFFF]">
              people you love
            </span>
            <span className="text-white">.</span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            NextOfKin is the legacy planning service built for our families.
            Organize your life, prepare the documents your family will need,
            and create a plan for the day they need it most.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <Link
              href={cta.href}
              className="cursor-pointer inline-flex items-center gap-2 px-7 py-3.5 bg-white text-foreground rounded-full font-medium shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:bg-surface-lavender-200 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-brand-indigo"
            >
              {cta.label}
              <span aria-hidden>&rarr;</span>
            </Link>
            <Link
              href="#how-it-works"
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-3.5 text-white/90 hover:text-white transition-colors duration-200"
            >
              See how it works
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs md:text-sm text-white/55">
            {trustItems.map((t) => (
              <li key={t.label} className="flex items-center gap-2">
                <span className="text-white/45">{t.icon}</span>
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        {/* === 3D card arc (client component, framer-motion) === */}
        <div className="relative z-10 mt-12 md:mt-16 lg:mt-20 px-4">
          <HeroCardArc />
        </div>
      </div>
    </section>
  );
}
