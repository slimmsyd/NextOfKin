import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "What we do", href: "#what-we-do" },
      { label: "What we protect", href: "#what-we-protect" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "OnCode Software", href: "#" },
      { label: "Built in Raleigh", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Heirs property guide", href: "#" },
      { label: "Estate planning 101", href: "#" },
      { label: "State guides", href: "#" },
      { label: "For funeral homes", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const social = ["Instagram", "LinkedIn", "X", "YouTube"];

export function Footer() {
  return (
    <footer className="bg-surface-deep text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 pb-16 border-b border-white/10">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-surface-dusty">
              Newsletter
            </p>
            <p className="mt-4 text-2xl md:text-3xl font-medium tracking-tight max-w-md leading-snug">
              Once a month. Plain language. Things that actually help your
              family.
            </p>
          </div>
          <form
            className="flex flex-col sm:flex-row gap-3 self-end"
            action="#"
            method="post"
          >
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-surface-lavender-200 transition-colors"
            />
            <button
              type="submit"
              className="px-7 py-3.5 rounded-full bg-white text-brand-indigo font-medium hover:bg-surface-lavender-200 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-xl font-semibold tracking-tight">Extra Kin</p>
            <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-xs">
              An estate operating system for the people you love.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-widest text-surface-dusty">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <p className="text-xs text-white/50 max-w-2xl leading-relaxed">
            Extra Kin is a service of OnCode Software Solutions · Built in
            Raleigh, NC. Extra Kin is not a law firm and does not provide
            legal advice. Legal templates are reviewed by licensed attorneys
            in each state we serve.
          </p>
          <ul className="flex gap-4">
            {social.map((s) => (
              <li key={s}>
                <Link
                  href="#"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {s}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
