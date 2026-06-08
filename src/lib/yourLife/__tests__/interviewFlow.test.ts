import { describe, it, expect } from "vitest";
import { nextProbe } from "@/lib/yourLife/interviewFlow";
import type { ChapterState } from "@/lib/yourLife/loadChapterState";

// Regression: loadChapterState now loads ALL of the user's assets into the
// record (so cross-type assets are visible to entity resolution and the pane).
// The real-estate probe must filter to real_estate so an account or vehicle is
// never treated as a gapped property. See the duplicate-rows investigation.

function asset(over: Partial<ChapterState["assets"][number]>): ChapterState["assets"][number] {
  return {
    id: "a",
    type: "real_estate",
    label: null,
    location: null,
    estimatedValue: null,
    acquisitionSource: null,
    titleStatus: null,
    deedRecorded: null,
    createdAt: new Date(0),
    ...over,
  };
}

function stateWith(assets: ChapterState["assets"]): ChapterState {
  return { authUserId: "auth", user: null, assets, turns: [], beneficiaries: [] };
}

describe("realEstateProbe ignores non-real-estate assets", () => {
  it("treats a savings-only record as having no property (probe = open)", () => {
    const p = nextProbe({
      chapter: "real_estate",
      state: stateWith([asset({ id: "s", type: "account_savings", label: "Navy Federal" })]),
      capturedThisTurn: [],
    });
    expect(p.topic).toBe("open");
  });

  it("still walks a real-estate gap when a property exists alongside accounts", () => {
    const p = nextProbe({
      chapter: "real_estate",
      state: stateWith([
        asset({ id: "s", type: "account_savings", label: "Navy Federal" }),
        asset({ id: "h", type: "real_estate", label: "Home", acquisitionSource: null }),
      ]),
      capturedThisTurn: [],
    });
    // The property has no acquisition source -> ask that, not treat the savings as a gap.
    expect(p.topic).toBe("acquisition_source");
  });
});
