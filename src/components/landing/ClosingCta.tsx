import Link from "next/link";

export function ClosingCta() {
  return (
    <section id="cta" className="px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-7xl mx-auto">
        <div className="relative bg-brand-indigo rounded-3xl px-8 md:px-16 lg:px-24 py-20 md:py-28 lg:py-36 text-white overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-brand-violet to-brand-violet-end opacity-40 blur-3xl"
          />
          <p className="relative text-sm font-medium uppercase tracking-widest text-surface-lavender-200/80">
            Start
          </p>
          <h2 className="relative mt-6 text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
            Your family is worth a plan.
          </h2>
          <p className="relative mt-8 text-lg md:text-xl text-surface-lavender-200 max-w-xl leading-relaxed">
            About an hour, conversational, voice or typed. You can pause and
            come back. Nothing is final until you say so.
          </p>
          <div className="relative mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="cursor-pointer inline-flex items-center justify-center px-7 py-3.5 bg-white text-brand-indigo rounded-full font-medium hover:bg-surface-lavender-200 transition-colors"
            >
              Start your plan
            </Link>
            <Link
              href="#faq"
              className="cursor-pointer inline-flex items-center justify-center px-7 py-3.5 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
