"use client";

import { AssetCard } from "./AssetCard";
import { IdentityCard } from "./IdentityCard";
import { SectionLabel } from "./SectionLabel";
import { SectionPlaceholder } from "./SectionPlaceholder";
import type { AssetView, IdentityView } from "./types";

type ProfilePaneProps = {
  identity: IdentityView;
  assets: AssetView[];
  lastAddedId: string | null;
  onFieldChange: (
    assetId: string,
    field: "label" | "location",
    value: string,
  ) => void | Promise<void>;
};

export function ProfilePane({
  identity,
  assets,
  lastAddedId,
  onFieldChange,
}: ProfilePaneProps) {
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
