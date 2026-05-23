const actions = [
  {
    verb: "search",
    body: "We scan unclaimed property databases, life insurance registries, and state treasurer holdings so your family doesn't have to.",
  },
  {
    verb: "notify",
    body: "On verified passing, we reach the people you named, in the way you wanted them reached, within hours, not months.",
  },
  {
    verb: "memorialize",
    body: "Obituaries, service details, and the stories you wanted told end up with the people who need them, not lost in a phone.",
  },
  {
    verb: "give",
    body: "Pre-authorized routing moves the right assets to the right people, on the right cadence, the moment your family can act.",
  },
];

export function DontStopAtTheWill() {
  return (
    <section className="bg-surface-deep text-white px-6 md:px-12 py-24 md:py-32 lg:py-40">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm font-medium uppercase tracking-widest text-surface-dusty">
          We don&rsquo;t stop at the will
        </p>
        <h2 className="mt-8 text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight max-w-4xl leading-tight">
          A will is one page. What your family actually needs is for someone
          to{" "}
          <span className="italic text-surface-lavender-200">search</span>,{" "}
          <span className="italic text-surface-lavender-200">notify</span>,{" "}
          <span className="italic text-surface-lavender-200">memorialize</span>,
          and{" "}
          <span className="italic text-surface-lavender-200">give</span>.
          Quietly, accurately, the day everything changes.
        </h2>

        <dl className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14">
          {actions.map((a) => (
            <div key={a.verb}>
              <dt className="text-3xl md:text-4xl font-medium italic text-surface-lavender-200 lowercase">
                {a.verb}
              </dt>
              <dd className="mt-4 text-base md:text-lg text-white/70 leading-relaxed max-w-md">
                {a.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
