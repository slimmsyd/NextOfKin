import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

import { toolSchemas } from "@/lib/yourLife/tools";
import { OFFERED_TOOLS, TOOL_PRODUCES_ASSET_TYPES } from "@/lib/yourLife/tools/registry";
import { CHAPTERS, type ChapterId } from "@/lib/yourLife/chapters";

// Guards the agent's tool contract against the drift that left financial assets
// uncapturable: the model was offered only real-estate tools for every chapter,
// while the route, the schemas, and the evals all referenced financial tools the
// model never saw. These are deterministic (no API).

const applyableTools = new Set(Object.keys(toolSchemas));

const contract = JSON.parse(
  readFileSync(resolve(process.cwd(), "agent-contract.json"), "utf8"),
) as {
  chapterGoals: Record<string, string>;
  tools: Array<{ function: { name: string } }>;
};
const contractToolNames = new Set(contract.tools.map((t) => t.function.name));

const offeredUnion = new Set<string>(
  (Object.values(OFFERED_TOOLS) as string[][]).flat(),
);

describe("tool contract consistency", () => {
  it("every offered tool is applyable by the route (offered ⊆ toolSchemas)", () => {
    for (const [chapter, tools] of Object.entries(OFFERED_TOOLS)) {
      for (const name of tools) {
        expect(
          applyableTools.has(name),
          `chapter "${chapter}" offers "${name}" but validateAndApply cannot apply it`,
        ).toBe(true);
      }
    }
  });

  it("agent-contract.json tools mirror the offered set (so evals match prod)", () => {
    expect([...contractToolNames].sort()).toEqual([...offeredUnion].sort());
  });

  it("agent-contract.json declares a goal for every chapter", () => {
    for (const chapter of CHAPTERS) {
      expect(
        Boolean(contract.chapterGoals[chapter.id]),
        `agent-contract.json is missing a chapterGoal for "${chapter.id}"`,
      ).toBe(true);
    }
  });

  it("every chapter is offered a tool that can capture its asset types", () => {
    for (const chapter of CHAPTERS) {
      const owned = new Set<string>(chapter.assetTypes);
      const offered = OFFERED_TOOLS[chapter.id as ChapterId];
      const canCapture = offered.some((toolName) =>
        (TOOL_PRODUCES_ASSET_TYPES[toolName] ?? []).some((t) => owned.has(t)),
      );
      expect(
        canCapture,
        `chapter "${chapter.id}" (asset types: ${[...owned].join(", ")}) has no offered tool that can capture them`,
      ).toBe(true);
    }
  });
});
