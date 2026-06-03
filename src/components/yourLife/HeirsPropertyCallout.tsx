function WarningIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4 mt-0.5 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function HeirsPropertyCallout() {
  return (
    <div className="mt-3 flex gap-2 text-[13px] text-amber-700">
      <WarningIcon />
      <p className="leading-snug">
        This may be heirs property. We&rsquo;ll talk through what that means and what to do.
      </p>
    </div>
  );
}
