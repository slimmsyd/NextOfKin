"use client";

import { HOUSEHOLD_OPTIONS } from "@/components/aboutYou/states";
import { AssetCard } from "./AssetCard";
import { IdentityCard } from "./IdentityCard";
import { SectionLabel } from "./SectionLabel";
import { SectionPlaceholder } from "./SectionPlaceholder";
import type { AssetView, FamilyView, IdentityView } from "./types";

type ProfilePaneProps = {
  identity: IdentityView;
  family: FamilyView;
  assets: AssetView[];
  lastAddedId: string | null;
  onFieldChange: (
    assetId: string,
    field: "label" | "location",
    value: string,
  ) => void | Promise<void>;
};

function householdLabel(value: string): string {
  return HOUSEHOLD_OPTIONS.find((h) => h.value === value)?.label ?? value;
}

function FamilyCard({ family }: { family: NonNullable<FamilyView> }) {
  return (
    <div className="rounded-xl border border-surface-lavender-300 bg-white px-5 py-4">
      <dl className="space-y-1.5 text-sm">
        {family.spouseName ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-foreground/55">Spouse / partner</dt>
            <dd className="text-foreground text-right">{family.spouseName}</dd>
          </div>
        ) : null}
        {family.dependentNames.length > 0 ? (
          <div className="flex items-start justify-between gap-3">
            <dt className="text-foreground/55">Children</dt>
            <dd className="text-foreground text-right">
              {family.dependentNames.join(", ")}
            </dd>
          </div>
        ) : null}
        {family.household ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-foreground/55">Household</dt>
            <dd className="text-foreground text-right">
              {householdLabel(family.household)}
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

export function ProfilePane({
  identity,
  family,
  assets,
  lastAddedId,
  onFieldChange,
}: ProfilePaneProps) {
  const hasFamily =
    family &&
    (family.spouseName ||
      family.dependentNames.length > 0 ||
      family.household);
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
      <IdentityCard identity={identity} />

      {hasFamily ? (
        <>
          <SectionLabel>Family</SectionLabel>
          <FamilyCard family={family} />
        </>
      ) : null}

      <SectionLabel>What You Have</SectionLabel>
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
      <SectionPlaceholder>
        We&rsquo;ll get here after we cover what you have.
      </SectionPlaceholder>

      <SectionLabel>Wishes &amp; Stories</SectionLabel>
      <SectionPlaceholder>
        We&rsquo;ll come back to this at the end.
      </SectionPlaceholder>
    </aside>
  );
}
