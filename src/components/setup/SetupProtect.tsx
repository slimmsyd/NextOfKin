import Link from "next/link";
import { VoiceNarrator } from "@/components/voice";

function MessageIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4 text-brand-indigo"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

type OptionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function OptionCard({ icon, title, description }: OptionCardProps) {
  return (
    <Link
      href="/about-you"
      className="group cursor-pointer w-full flex items-center gap-4 bg-white border border-surface-lavender-300 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-left hover:border-brand-indigo/40 hover:bg-surface-lavender-200/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/40"
    >
      <span
        aria-hidden
        className="w-10 h-10 rounded-full bg-brand-indigo/10 text-brand-indigo flex items-center justify-center shrink-0"
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[17px] font-semibold text-foreground">
          {title}
        </span>
        <span className="block text-sm text-foreground/60 mt-0.5">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className="text-foreground/30 group-hover:text-brand-indigo transition-colors shrink-0"
      >
        <ChevronRight />
      </span>
    </Link>
  );
}

export function SetupProtect() {
  return (
    <section className="w-full max-w-2xl mx-auto px-6 md:px-10 py-14 md:py-24">
      <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] text-foreground leading-[1.05] tracking-tight">
        Let&rsquo;s{" "}
        <span className="italic text-brand-indigo">protect</span> what you share
        with me.
      </h1>

      <p className="mt-6 md:mt-8 text-foreground/75 text-[17px] md:text-lg leading-[1.6] max-w-[36ch]">
        We&rsquo;ll send you a code each time you sign in. That way only you can
        see what&rsquo;s here.
      </p>

      <VoiceNarrator scene="protect" className="mt-4" />

      <div className="mt-10 md:mt-12 space-y-3">
        <OptionCard
          icon={<MessageIcon />}
          title="Send me a code"
          description="Easiest. We'll text the number you give us."
        />
        <OptionCard
          icon={<EnvelopeIcon />}
          title="Send me an email"
          description="Prefer email? We'll send the code there."
        />
      </div>

      <div className="mt-16 md:mt-20 pt-6 border-t border-surface-lavender-300 flex items-center gap-2 text-sm text-foreground/60">
        <LockIcon />
        <span>Your information is encrypted on our end and yours.</span>
      </div>
    </section>
  );
}
