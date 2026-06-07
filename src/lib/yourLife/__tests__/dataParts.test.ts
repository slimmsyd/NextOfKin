import { describe, it, expect } from "vitest";

import { dataPartForResult, ASSET_TOOLS } from "@/lib/yourLife/dataParts";

// Locks the capture -> pane channel: every applied tool maps to the right
// transient data-* part (the only channel useChat's onData receives).

describe("dataPartForResult", () => {
  it("routes every asset tool to data-asset", () => {
    for (const name of ASSET_TOOLS) {
      expect(dataPartForResult({ name, data: { id: "a1" } })?.type).toBe(
        "data-asset",
      );
    }
  });

  it("routes add_person to data-person", () => {
    expect(dataPartForResult({ name: "add_person", data: { id: "p1" } })?.type).toBe(
      "data-person",
    );
  });

  it("routes confirm/defer to data-progress", () => {
    expect(
      dataPartForResult({ name: "confirm_chapter_complete", data: {} })?.type,
    ).toBe("data-progress");
    expect(dataPartForResult({ name: "defer_chapter", data: {} })?.type).toBe(
      "data-progress",
    );
  });

  it("passes the applied data through unchanged", () => {
    const data = { id: "a1", label: "Our home" };
    expect(dataPartForResult({ name: "upsert_asset", data })?.data).toBe(data);
  });

  it("returns null for tools with no pane effect", () => {
    expect(dataPartForResult({ name: "something_else", data: {} })).toBeNull();
  });
});
