"use client";

import { useState } from "react";
import { Button, DateInput, Select, StatusPill, TextInput } from "@/components/forms";
import { MARITAL_STATUSES, US_STATES } from "@/components/aboutYou/states";
import type { ProfileEdit } from "@/lib/setup/about-you";
import type { IdentityView } from "./types";

function maritalLabel(value: string): string {
  return MARITAL_STATUSES.find((m) => m.value === value)?.label ?? value;
}

function stateLabel(code: string): string {
  return US_STATES.find((s) => s.value === code)?.label ?? code;
}

function formatDob(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const month = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ][m - 1];
  return `${month} ${d}, ${y}`;
}

function PencilIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
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

type IdentityCardProps = {
  identity: IdentityView;
  onSave: (patch: ProfileEdit) => void | Promise<void>;
};

export function IdentityCard({ identity, onSave }: IdentityCardProps) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const [legalName, setLegalName] = useState("");
  const [dob, setDob] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [marital, setMarital] = useState("");

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

  function startEditing() {
    if (!identity) return;
    setLegalName(
      identity.legalName?.trim() ||
        `${identity.firstName} ${identity.lastName}`.trim(),
    );
    setDob(identity.dob ?? "");
    setStateCode(identity.stateCode ?? "");
    setMarital(identity.maritalStatus ?? "");
    setSaved(false);
    setEditing(true);
  }

  async function handleSave() {
    setBusy(true);
    await onSave({
      legalName,
      dob,
      state: stateCode,
      maritalStatus: marital,
    });
    setBusy(false);
    setEditing(false);
    setSaved(true);
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-surface-lavender-300 bg-white px-5 py-4 space-y-4">
        <TextInput
          label="Legal name (as on your ID)"
          value={legalName}
          onChange={(e) => setLegalName(e.target.value)}
        />
        <DateInput label="Date of birth" value={dob} onChange={setDob} />
        <Select
          label="State of residence"
          value={stateCode}
          placeholder="Select a state"
          options={US_STATES}
          onChange={(e) => setStateCode(e.target.value)}
        />
        <Select
          label="Marital status"
          value={marital}
          placeholder="Select"
          options={MARITAL_STATUSES}
          onChange={(e) => setMarital(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setEditing(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={busy}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-surface-lavender-300 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[15px] font-semibold text-foreground">{displayName}</p>
        <div className="flex items-center gap-2">
          {saved ? <StatusPill label="Saved" tone="green" /> : null}
          <button
            type="button"
            onClick={startEditing}
            aria-label="Edit your details"
            className="cursor-pointer inline-flex items-center justify-center h-9 w-9 -mr-2 -mt-1 rounded-md text-foreground/45 hover:text-brand-indigo hover:bg-surface-lavender-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/40"
          >
            <PencilIcon />
          </button>
        </div>
      </div>
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
