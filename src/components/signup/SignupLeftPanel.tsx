import Image from "next/image";
import Link from "next/link";

function LogoMark() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-5 h-5 text-brand-indigo"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="9" cy="12" rx="4.5" ry="6.5" transform="rotate(-30 9 12)" />
      <ellipse cx="15" cy="12" rx="4.5" ry="6.5" transform="rotate(-30 15 12)" />
    </svg>
  );
}

export function SignupLeftPanel() {
  return (
    <div className="relative w-full h-full min-h-[420px] md:min-h-screen bg-paper-cream overflow-hidden">
      {/* Full-bleed illustration */}
      <Image
        src="/illustrations/signup-stairs-hearts.png"
        alt="Hand-drawn illustration of figures on stairs passing hearts to one another"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover object-[center_35%] select-none pointer-events-none"
      />

      {/* Light scrims for text legibility — short and low-opacity so the
          illustration stays visible across the whole panel. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-20 md:h-28 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(244, 232, 193, 0.55) 0%, rgba(244, 232, 193, 0) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 md:h-36 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(244, 232, 193, 0.6) 0%, rgba(244, 232, 193, 0) 100%)",
        }}
      />

      {/* Wordmark, top-left */}
      <Link
        href="/"
        className="absolute top-8 left-8 md:top-10 md:left-12 lg:top-12 lg:left-16 z-10 inline-flex items-center gap-2 text-base font-semibold text-foreground cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-paper-cream rounded-sm"
      >
        <LogoMark />
        <span>NextOfKin</span>
      </Link>

      {/* Editorial italic headline, bottom-left */}
      <p className="absolute bottom-8 left-8 right-8 md:bottom-10 md:left-12 md:right-12 lg:bottom-12 lg:left-16 lg:right-20 z-10 font-serif italic text-foreground/90 text-xl md:text-2xl lg:text-[1.75rem] leading-[1.25] max-w-md">
        Make sure what you built gets to the people you love.
      </p>
    </div>
  );
}
