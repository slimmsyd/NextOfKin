const partners = [
  {
    name: "meridian",
    glyph: "♦",
    className: "text-lg md:text-xl text-foreground/55 font-medium tracking-tight lowercase",
  },
  {
    name: "Holloway",
    glyph: "●",
    className: "text-lg md:text-xl text-foreground/55 font-semibold tracking-tight",
  },
  {
    name: "Westbrook",
    glyph: "",
    className: "text-lg md:text-xl text-foreground/55 font-serif italic tracking-tight",
  },
  {
    name: "ATELIER",
    glyph: "○",
    className: "text-xs md:text-sm text-foreground/55 font-medium tracking-[0.35em]",
  },
  {
    name: "Stanton",
    glyph: "",
    suffix: ".",
    className: "text-lg md:text-xl text-foreground/55 font-medium tracking-tight",
  },
  {
    name: "Avalon Trust",
    glyph: "▲",
    className: "text-lg md:text-xl text-foreground/55 font-medium tracking-tight",
  },
];

export function TrustedBy() {
  return (
    <section className="px-6 md:px-12 py-8 md:py-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-y-8 gap-x-6">
          <p className="md:col-span-1 text-sm text-surface-dusty leading-snug max-w-[14ch]">
            Trusted by advisors, estate firms, and family offices
          </p>
          <div className="md:col-span-6 flex flex-wrap items-center justify-around gap-x-8 gap-y-6 md:gap-x-12">
            {partners.map((p) => (
              <span key={p.name} className="inline-flex items-center gap-2">
                {p.glyph && (
                  <span aria-hidden className="text-foreground/40 text-sm">
                    {p.glyph}
                  </span>
                )}
                <span className={p.className}>
                  {p.name}
                  {p.suffix && (
                    <span className="text-foreground/40">{p.suffix}</span>
                  )}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
