import { describe, it, expect } from "vitest";

import { isDesync, buildAgentTurnMeta } from "@/lib/yourLife/turnMeta";

// isDesync is the production canary for the capture desync we fixed: the user
// states something substantive but the agent emits zero tools.

describe("isDesync", () => {
  it("flags a substantive statement that captured nothing", () => {
    expect(
      isDesync("I want to protect my Vanguard accounts and my Bitcoin.", []),
    ).toBe(true);
    expect(isDesync("I just want my Mother and Father.", [])).toBe(true);
  });

  it("does not flag when the agent emitted any tool", () => {
    expect(
      isDesync("We own our home on Elm Street.", ["upsert_asset"]),
    ).toBe(false);
  });

  it("does not flag short acknowledgements", () => {
    expect(isDesync("yes", [])).toBe(false);
    expect(isDesync("ok thanks", [])).toBe(false);
  });

  it("does not flag a pure question (asking, not stating)", () => {
    expect(isDesync("What is heirs property?", [])).toBe(false);
    expect(isDesync("Can I add more later?", [])).toBe(false);
  });
});

describe("buildAgentTurnMeta", () => {
  it("captures probe, extraction outcome, and chips", () => {
    const meta = buildAgentTurnMeta({
      probe: { kind: "field", topic: "title_status" },
      emitted: ["upsert_asset", "add_person"],
      applied: ["upsert_asset"],
      failed: ["add_person"],
      chipsShown: ["title_status", "whats_left"],
    });
    expect(meta.probe).toEqual({ kind: "field", topic: "title_status" });
    expect(meta.extraction.applied).toEqual(["upsert_asset"]);
    expect(meta.extraction.failed).toEqual(["add_person"]);
    expect(meta.chipsShown).toEqual(["title_status", "whats_left"]);
  });

  it("null probe is preserved", () => {
    const meta = buildAgentTurnMeta({
      emitted: [],
      applied: [],
      failed: [],
      chipsShown: [],
    });
    expect(meta.probe).toBeNull();
  });
});
