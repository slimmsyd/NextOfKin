import type { IdentityView } from "./types";

const STATE_NAMES: Record<string, string> = {
  NC: "North Carolina",
  SC: "South Carolina",
  GA: "Georgia",
  VA: "Virginia",
  AL: "Alabama",
};

export function IdentityCard({ identity }: { identity: IdentityView }) {
  if (!identity) {
    return (
      <div className="rounded-xl border border-surface-lavender-300 bg-white px-5 py-4">
        <p className="italic text-sm text-foreground/55">
          We&rsquo;ll fill this in once you finish signing up.
        </p>
      </div>
    );
  }

  const fullName = `${identity.firstName} ${identity.lastName}`.trim();
  const stateName = STATE_NAMES[identity.stateCode] ?? identity.stateCode;

  return (
    <div className="rounded-xl border border-surface-lavender-300 bg-white px-5 py-4">
      <p className="text-[15px] font-semibold text-foreground">{fullName}</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-foreground/55">State</dt>
          <dd className="text-foreground">{stateName}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-foreground/55">Marital status</dt>
          <dd className="italic text-foreground/55">Not yet captured</dd>
        </div>
      </dl>
    </div>
  );
}
