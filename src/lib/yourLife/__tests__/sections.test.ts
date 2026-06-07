import { describe, it, expect } from "vitest";

import { deriveSections } from "@/lib/yourLife/sections";
import type { SidebarSection } from "@/components/yourLife/types";

// Locks the render contract: chapter progress + people -> sidebar section states.
// This is the path the investigation proved healthy; the guard keeps it that way.

function state(sections: SidebarSection[], label: string) {
  return sections.find((s) => s.label === label)?.state;
}

describe("deriveSections", () => {
  it("at the start: What you have is active, Who you protect locked", () => {
    const s = deriveSections({}, { hasPeople: false });
    expect(state(s, "About you")).toBe("done");
    expect(state(s, "What you have")).toBe("active");
    expect(state(s, "Who you protect")).toBe("locked");
  });

  it("mid-loop (one chapter complete) keeps What you have active", () => {
    const s = deriveSections({ real_estate: "complete" }, { hasPeople: false });
    expect(state(s, "What you have")).toBe("active");
    expect(state(s, "Who you protect")).toBe("locked");
  });

  it("once people exist, Who you protect unlocks even before the loop finishes", () => {
    const s = deriveSections({ real_estate: "active" }, { hasPeople: true });
    expect(state(s, "What you have")).toBe("active");
    expect(state(s, "Who you protect")).toBe("active");
  });

  it("when every chapter is complete or deferred, What you have is done", () => {
    const s = deriveSections(
      { real_estate: "complete", financial_accounts: "deferred" },
      { hasPeople: false },
    );
    expect(state(s, "What you have")).toBe("done");
    expect(state(s, "Who you protect")).toBe("active");
  });
});
