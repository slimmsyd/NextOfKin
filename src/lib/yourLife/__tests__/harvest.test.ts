import { describe, it, expect } from "vitest";

import {
  classifyTurn,
  buildEvalCase,
  type TurnPair,
} from "@/lib/yourLife/harvest";

const base: Omit<TurnPair, "userText" | "applied"> = {
  chapter: "real_estate",
  userTurnId: "abcd1234-0000-0000-0000-000000000000",
  history: [{ role: "agent", text: "Do you own your home?" }],
  profile: { user: null, assets: [] },
};

describe("classifyTurn", () => {
  it("capture when tools were applied", () => {
    expect(
      classifyTurn({ ...base, userText: "We own our home.", applied: [{ name: "upsert_asset" }] }),
    ).toBe("capture");
  });

  it("desync when substantive input captured nothing", () => {
    expect(
      classifyTurn({ ...base, userText: "I want my Vanguard accounts protected.", applied: [] }),
    ).toBe("desync");
  });

  it("skip for a trivial reply with no capture", () => {
    expect(classifyTurn({ ...base, userText: "yes", applied: [] })).toBe("skip");
  });
});

describe("buildEvalCase", () => {
  it("desync -> under_extraction with blank expect + provenance", () => {
    const c = buildEvalCase(
      { ...base, userText: "I just want my Mother and Father.", applied: [] },
      "desync",
    );
    expect(c.mode).toBe("under_extraction");
    expect(c.expect).toEqual({});
    expect(c.source_turn_id).toBe(base.userTurnId);
    expect(c.id).toBe("harvested-abcd1234");
  });

  it("capture -> expect derived from the applied tool (id excluded)", () => {
    const c = buildEvalCase(
      {
        ...base,
        userText: "We own our home on Elm Street.",
        applied: [
          { name: "upsert_asset", args: { id: "x", label: "Our home", location: "Elm St" } },
        ],
      },
      "capture",
    );
    expect(c.expect.tool).toBe("upsert_asset");
    expect(c.expect.args_present).toEqual(["label", "location"]);
  });
});
