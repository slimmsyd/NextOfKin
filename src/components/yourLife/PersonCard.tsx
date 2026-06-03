import type { PersonView } from "./types";

// A captured person under "Who You Protect" (right pane). Styled to match the
// lavender card system used by the asset/family cards.
export function PersonCard({
  person,
  receivesLabel,
}: {
  person: PersonView;
  receivesLabel: string | null;
}) {
  return (
    <div className="rounded-xl border border-surface-lavender-300 bg-white px-5 py-4">
      <p className="text-sm font-medium text-foreground truncate">
        {person.fullName}
      </p>
      {person.relationship ? (
        <p className="text-[13px] text-foreground/55 capitalize">
          {person.relationship}
        </p>
      ) : null}
      {receivesLabel ? (
        <p className="mt-2 text-[13px] text-foreground/70">
          Receives <span className="text-foreground">{receivesLabel}</span>
        </p>
      ) : null}
    </div>
  );
}
