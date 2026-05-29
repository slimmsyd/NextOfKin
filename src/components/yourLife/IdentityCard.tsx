import { MARITAL_STATUSES, US_STATES } from "@/components/aboutYou/states";
import type { IdentityView } from "./types";

function maritalLabel(value: string): string {
  return MARITAL_STATUSES.find((m) => m.value === value)?.label ?? value;
}

function stateLabel(code: string): string {
  return US_STATES.find((s) => s.value === code)?.label ?? code;
}

function formatDob(iso: string): string {
  // iso is YYYY-MM-DD; render without timezone drift.
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][m - 1];
  return `${month} ${d}, ${y}`;
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-foreground/55">{label}</dt>
      <dd className={muted ? "italic text-foreground/55" : "text-foreground text-right"}>
        {value}
      </dd>
    </div>
  );
}

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

  const displayName =
    identity.legalName?.trim() ||
    `${identity.firstName} ${identity.lastName}`.trim();

  return (
    <div className="rounded-xl border border-surface-lavender-300 bg-white px-5 py-4">
      <p className="text-[15px] font-semibold text-foreground">{displayName}</p>
      <dl className="mt-3 space-y-1.5 text-sm">
        {identity.dob ? <Row label="Born" value={formatDob(identity.dob)} /> : null}
        <Row label="State" value={stateLabel(identity.stateCode)} />
        {identity.maritalStatus ? (
          <Row label="Marital status" value={maritalLabel(identity.maritalStatus)} />
        ) : (
          <Row label="Marital status" value="Not yet captured" muted />
        )}
      </dl>
    </div>
  );
}
