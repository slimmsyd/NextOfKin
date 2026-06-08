import { describe, it, expect } from "vitest";

import { deriveSections } from "@/lib/yourLife/sections";
import type { SidebarSection } from "@/components/yourLife/types";

// Locks the render contract: chapter progress + people -> sidebar section states
// for the V1 journey (About you -> What you own -> Who you protect -> Review,
// with Wishes & stories shown dimmed as a V1.5 teaser).

function state(sections: SidebarSection[], label: string) {
  return sections.find((s) => s.label === label)?.state;
}

describe("deriveSections", () => {
  it("at the start: What you own active, Who you protect / Review locked", () => {
    const s = deriveSections({}, { hasPeople: false });
    expect(state(s, "About you")).toBe("done");
    expect(state(s, "What you own")).toBe("active");
    expect(state(s, "Who you protect")).toBe("locked");
    expect(state(s, "Review")).toBe("locked");
    expect(state(s, "Wishes & stories")).toBe("future");
  });

  it("mid-loop (one chapter complete) keeps What you own active", () => {
    const s = deriveSections({ real_estate: "complete" }, { hasPeople: false });
    expect(state(s, "What you own")).toBe("active");
    expect(state(s, "Who you protect")).toBe("locked");
  });

  it("once people exist, Who you protect unlocks even before the loop finishes", () => {
    const s = deriveSections({ real_estate: "active" }, { hasPeople: true });
    expect(state(s, "What you own")).toBe("active");
    expect(state(s, "Who you protect")).toBe("active");
  });

  it("when every chapter is complete or deferred, What you own is done", () => {
    const s = deriveSections(
      { real_estate: "complete", financial_accounts: "deferred" },
      { hasPeople: false },
    );
    expect(state(s, "What you own")).toBe("done");
    expect(state(s, "Who you protect")).toBe("active");
  });

  it("Wishes & stories is always a dimmed future teaser in V1", () => {
    expect(
      state(deriveSections({}, { hasPeople: false }), "Wishes & stories"),
    ).toBe("future");
    expect(
      state(
        deriveSections(
          { real_estate: "complete", financial_accounts: "complete" },
          { hasPeople: true },
        ),
        "Wishes & stories",
      ),
    ).toBe("future");
  });
});
