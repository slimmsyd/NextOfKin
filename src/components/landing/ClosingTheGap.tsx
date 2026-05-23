const stats = [
  {
    figure: "70%",
    body: "of Black Americans don't have a will or estate plan in place",
    source: "Federal Reserve · 2022",
  },
  {
    figure: "$28B",
    body: "in family land lost each generation through heirs property",
    source: "USDA · Center for Heirs' Property Preservation",
  },
  {
    figure: "18mo",
    body: "the average time families spend in probate without a plan",
    source: "EstateExec · 2024 probate study",
  },
  {
    figure: "$70K",
    body: "the average cost in fees, taxes, and forgotten assets",
    source: "EstateExec · 2024 probate study",
  },
];

export function ClosingTheGap() {
  return (
    <section className="px-4 md:px-6 py-0">
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-surface-dusty rounded-3xl px-8 md:px-16 lg:px-24 py-20 md:py-28 lg:py-32">
          <h2 className="font-serif font-normal text-4xl md:text-6xl lg:text-7xl text-foreground text-center leading-[1.05] tracking-tight max-w-4xl mx-auto">
            Closing the gap in generational
            <br className="hidden md:inline" /> estate planning
          </h2>

          <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 lg:gap-12">
            {stats.map((s) => (
              <div key={s.figure} className="flex flex-col">
                <p className="font-serif italic font-normal text-7xl md:text-8xl lg:text-9xl text-[#F4ECC9] leading-[0.85] tracking-tight">
                  {s.figure}
                </p>
                <p className="mt-6 text-base md:text-lg text-foreground leading-snug max-w-[24ch]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 pt-6 border-t border-foreground/15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 lg:gap-12">
            {stats.map((s) => (
              <p
                key={s.source}
                className="text-xs text-foreground/55 tracking-wide"
              >
                {s.source}
              </p>
            ))}
          </div>
        </div>

        <p className="mt-14 text-center text-xs font-medium uppercase tracking-[0.35em] text-foreground/60">
          A holistic service for your family
        </p>
      </div>
    </section>
  );
}
