"use client";

import { useState } from "react";
import {
  Button,
  Repeater,
  Select,
  StatusPill,
  TextInput,
} from "@/components/forms";
import {
  HOUSEHOLD_OPTIONS,
  SPOUSE_STATUSES,
} from "@/components/aboutYou/states";
import type { ProfileEdit } from "@/lib/setup/about-you";
import { AssetCard } from "./AssetCard";
import { IdentityCard } from "./IdentityCard";
import { PersonCard } from "./PersonCard";
import { SectionLabel } from "./SectionLabel";
import { SectionPlaceholder } from "./SectionPlaceholder";
import type { AssetView, FamilyView, IdentityView, PersonView } from "./types";

type ProfilePaneProps = {
  identity: IdentityView;
  family: FamilyView;
  assets: AssetView[];
  people: PersonView[];
  lastAddedId: string | null;
  onFieldChange: (
    assetId: string,
    field: "label" | "location",
    value: string,
  ) => void | Promise<void>;
  onProfileSave: (patch: ProfileEdit) => void | Promise<void>;
};

function householdLabel(value: string): string {
  return HOUSEHOLD_OPTIONS.find((h) => h.value === value)?.label ?? value;
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

function FamilyCard({
  family,
  onSave,
}: {
  family: FamilyView;
  onSave: (patch: ProfileEdit) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const [spouse, setSpouse] = useState("");
  const [children, setChildren] = useState<string[]>([]);
  const [household, setHousehold] = useState("");

  function startEditing() {
    setSpouse(family?.spouseName ?? "");
    setChildren(family?.dependentNames ?? []);
    setHousehold(family?.household ?? "");
    setSaved(false);
    setEditing(true);
  }

  async function handleSave() {
    setBusy(true);
    await onSave({
      spouseName: spouse,
      dependentNames: children,
      household,
    });
    setBusy(false);
    setEditing(false);
    setSaved(true);
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-surface-lavender-300 bg-white px-5 py-4 space-y-4">
        <TextInput
          label="Spouse / partner full name"
          value={spouse}
          onChange={(e) => setSpouse(e.target.value)}
        />
        <div>
          <label className="block text-sm text-foreground/70 mb-2">
            Children or dependents
          </label>
          <Repeater
            items={children}
            addLabel="Add a child or dependent"
            onAdd={() => setChildren((c) => [...c, ""])}
            onRemove={(i) => setChildren((c) => c.filter((_, idx) => idx !== i))}
            renderItem={(item, i) => (
              <input
                type="text"
                value={item}
                onChange={(e) =>
                  setChildren((c) =>
                    c.map((v, idx) => (idx === i ? e.target.value : v)),
                  )
                }
                placeholder="Full name"
                className="w-full h-9 px-2 text-[13px] bg-transparent text-foreground placeholder:text-foreground/40 outline-none"
                aria-label={`Dependent ${i + 1} name`}
              />
            )}
          />
        </div>
        <Select
          label="Who else is in your household?"
          value={household}
          placeholder="Select"
          options={HOUSEHOLD_OPTIONS}
          onChange={(e) => setHousehold(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setEditing(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={busy}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  const hasData =
    family &&
    (family.spouseName ||
      family.dependentNames.length > 0 ||
      family.household);

  return (
    <div className="rounded-xl border border-surface-lavender-300 bg-white px-5 py-4">
      <div className="flex items-start justify-between gap-2">
        <dl className="flex-1 space-y-1.5 text-sm">
          {!hasData ? (
            <p className="italic text-foreground/55">Not captured yet</p>
          ) : null}
          {family?.spouseName ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-foreground/55">Spouse / partner</dt>
              <dd className="text-foreground text-right">{family.spouseName}</dd>
            </div>
          ) : null}
          {family && family.dependentNames.length > 0 ? (
            <div className="flex items-start justify-between gap-3">
              <dt className="text-foreground/55">Children</dt>
              <dd className="text-foreground text-right">
                {family.dependentNames.join(", ")}
              </dd>
            </div>
          ) : null}
          {family?.household ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-foreground/55">Household</dt>
              <dd className="text-foreground text-right">
                {householdLabel(family.household)}
              </dd>
            </div>
          ) : null}
        </dl>
        <div className="flex items-center gap-2">
          {saved ? <StatusPill label="Saved" tone="green" /> : null}
          <button
            type="button"
            onClick={startEditing}
            aria-label="Edit family details"
            className="cursor-pointer inline-flex items-center justify-center h-9 w-9 -mr-2 -mt-1 rounded-md text-foreground/45 hover:text-brand-indigo hover:bg-surface-lavender-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo/40"
          >
            <PencilIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfilePane({
  identity,
  family,
  assets,
  people,
  lastAddedId,
  onFieldChange,
  onProfileSave,
}: ProfilePaneProps) {
  const hasFamily =
    family &&
    (family.spouseName ||
      family.dependentNames.length > 0 ||
      family.household);
  const partnered =
    identity?.maritalStatus != null &&
    SPOUSE_STATUSES.has(identity.maritalStatus);
  const showFamily = Boolean(hasFamily) || partnered;

  return (
    <aside className="w-full h-full bg-surface-lavender-200 border-l border-surface-lavender-300 px-6 py-6 md:px-8 md:py-8 overflow-y-auto">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-foreground/70">
          Your Profile
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[12px] text-foreground/55">
          <span
            aria-hidden
            className="block w-1.5 h-1.5 rounded-full bg-emerald-500"
          />
          Live
        </span>
      </header>

      <SectionLabel>About You</SectionLabel>
      <IdentityCard identity={identity} onSave={onProfileSave} />

      {showFamily ? (
        <>
          <SectionLabel>Family</SectionLabel>
          <FamilyCard family={family} onSave={onProfileSave} />
        </>
      ) : null}

      <SectionLabel>What You Own</SectionLabel>
      {assets.length > 0 ? (
        assets.map((a) => (
          <AssetCard
            key={a.id}
            asset={a}
            justAdded={a.id === lastAddedId}
            onFieldChange={onFieldChange}
          />
        ))
      ) : (
        <SectionPlaceholder>
          We&rsquo;ll start filling this in as you tell me what you have.
        </SectionPlaceholder>
      )}

      <SectionLabel>Who You Protect</SectionLabel>
      {people.length > 0 ? (
        <div className="space-y-3">
          {people.map((p) => {
            const receivesLabel =
              (p.receivesAssetId &&
                assets.find((a) => a.id === p.receivesAssetId)?.label) ||
              p.receivesAssetLabel ||
              null;
            return (
              <PersonCard key={p.id} person={p} receivesLabel={receivesLabel} />
            );
          })}
        </div>
      ) : (
        <SectionPlaceholder>
          We&rsquo;ll get here after we cover what you have.
        </SectionPlaceholder>
      )}

      <SectionLabel>Wishes &amp; Stories</SectionLabel>
      <SectionPlaceholder>
        We&rsquo;ll come back to this at the end.
      </SectionPlaceholder>
    </aside>
  );
}
