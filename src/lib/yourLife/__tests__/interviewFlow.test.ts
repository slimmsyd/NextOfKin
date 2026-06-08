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
        asset({
          id: "h",
          type: "real_estate",
          label: "Home",
          location: "123 Main St",
          acquisitionSource: null,
        }),
      ]),
      capturedThisTurn: [],
    });
    // Location is known, so the next gap is acquisition source (and the savings
    // is never treated as a gapped property).
    expect(p.topic).toBe("acquisition_source");
  });
});

describe("realEstateProbe asks for the property address (location)", () => {
  it("asks location first when a property is newly named without one", () => {
    const p = nextProbe({
      chapter: "real_estate",
      state: stateWith([]),
      capturedThisTurn: [{ name: "upsert_asset", args: { label: "House" } }],
    });
    // Address before "who gets it": identify the property first.
    expect(p.topic).toBe("location");
  });

  it("drops the location question once an address is on record", () => {
    const p = nextProbe({
      chapter: "real_estate",
      state: stateWith([
        asset({
          id: "h",
          type: "real_estate",
          label: "House",
          location: "19 Cedarview Ct",
          acquisitionSource: null,
        }),
      ]),
      capturedThisTurn: [],
    });
    expect(p.topic).not.toBe("location");
    expect(p.topic).toBe("acquisition_source");
  });
});
