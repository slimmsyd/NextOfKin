const have = [
  "Real estate and family land",
  "Bank and brokerage accounts",
  "Retirement and pension",
  "Life insurance policies",
  "Vehicles and personal property",
  "Digital accounts and assets",
  "Business interests",
  "Heirlooms and stories",
];

const protect = [
  "Spouse or partner",
  "Children and grandchildren",
  "Parents and elders",
  "Siblings and chosen family",
  "Communal trustees",
  "Religious and civic communities",
  "Causes you've supported",
  "Yourself, while you're still here",
];

export function WhatWeProtect() {
  return (
    <section
      id="what-we-protect"
      className="px-6 md:px-12 py-24 md:py-32"
    >
      <div className="max-w-7xl mx-auto">
        <p className="text-sm font-medium uppercase tracking-widest text-surface-dusty">
          What we protect
        </p>
        <h2 className="mt-6 text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight max-w-3xl leading-tight">
          Everything you&rsquo;ve built. Everyone you carry.
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest text-brand-indigo">
              What you have
            </h3>
            <ul className="mt-6 space-y-4 border-t border-surface-lavender-300">
              {have.map((item) => (
                <li
                  key={item}
                  className="pt-4 text-lg md:text-xl text-foreground border-b border-surface-lavender-300 pb-4"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium uppercase tracking-widest text-brand-indigo">
              Who you protect
            </h3>
            <ul className="mt-6 space-y-4 border-t border-surface-lavender-300">
              {protect.map((item) => (
                <li
                  key={item}
                  className="pt-4 text-lg md:text-xl text-foreground border-b border-surface-lavender-300 pb-4"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
