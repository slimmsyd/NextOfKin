"use client";

import { motion, useReducedMotion } from "framer-motion";

import { heirsPropertyRisk } from "@/lib/yourLife/heuristics";
import { HeirsPropertyCallout } from "./HeirsPropertyCallout";
import { InlineEditableField } from "./InlineEditableField";
import type { AssetView } from "./types";

function HomeIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4 text-brand-indigo"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

function LandIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="w-4 h-4 text-amber-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v6" />
      <path d="M8 6c0 2 1 4 4 4s4-2 4-4" />
      <path d="M3 16c5-3 13-3 18 0" />
      <path d="M3 20c5-3 13-3 18 0" />
    </svg>
  );
}

function ownershipLabel(s: string | null): string {
  switch (s) {
    case "sole":
      return "Sole";
    case "jtwros":
      return "Joint with right of survivorship";
    case "tenancy_in_common":
      return "Tenancy in common";
    case "undivided_fractional":
      return "Undivided fractional";
    case "no_recorded_deed":
      return "No recorded deed";
    case "unclear":
      return "Unclear";
    default:
      return "We'll check";
  }
}

type AssetCardProps = {
  asset: AssetView;
  justAdded: boolean;
  onFieldChange: (
    assetId: string,
    field: "label" | "location",
    value: string,
  ) => void | Promise<void>;
};

export function AssetCard({ asset, justAdded, onFieldChange }: AssetCardProps) {
  const prefersReduced = useReducedMotion();
  const isInherited = asset.acquisitionSource === "inherited";
  const showHeirsRisk = heirsPropertyRisk({
    acquisitionSource: asset.acquisitionSource,
    titleStatus: asset.titleStatus,
    deedRecorded: asset.deedRecorded,
  });

  return (
    <motion.article
      initial={prefersReduced ? false : { y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={[
        "rounded-xl bg-white border border-surface-lavender-300 px-5 py-4 mt-3",
        showHeirsRisk ? "border-l-4 border-l-amber-500" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          {isInherited ? <LandIcon /> : <HomeIcon />}
          <InlineEditableField
            label=""
            value={asset.label}
            placeholder="Untitled property"
            align="left"
            onCommit={(next) => onFieldChange(asset.id, "label", next)}
          />
        </h4>
        {justAdded ? (
          <motion.span
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-[11px] font-medium uppercase tracking-[0.14em] px-2 py-0.5 rounded-full bg-brand-indigo/10 text-brand-indigo"
          >
            Just added
          </motion.span>
        ) : null}
      </header>

      <dl className="mt-2 text-sm divide-y divide-surface-lavender-300/60">
        <InlineEditableField
          label="Location"
          value={asset.location}
          placeholder="Where is it?"
          onCommit={(next) => onFieldChange(asset.id, "location", next)}
        />
        <div className="flex items-center justify-between py-1.5">
          <dt className="text-foreground/55">Ownership</dt>
          <dd className="text-foreground text-sm">
            {ownershipLabel(asset.titleStatus)}
          </dd>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <dt className="text-foreground/55">Source</dt>
          <dd className="text-foreground text-sm capitalize">
            {asset.acquisitionSource ?? "We'll check"}
          </dd>
        </div>
        <div className="flex items-center justify-between py-1.5">
          <dt className="text-foreground/55">Deed</dt>
          <dd
            className={`text-sm ${
              showHeirsRisk ? "text-amber-700" : "text-foreground"
            }`}
          >
            {asset.deedRecorded === true
              ? "Recorded"
              : asset.deedRecorded === false
                ? "Not recorded"
                : "We'll check"}
          </dd>
        </div>
      </dl>

      {showHeirsRisk ? <HeirsPropertyCallout /> : null}
    </motion.article>
  );
}
