// Maps an applied tool result to the transient data-* part that updates the live
// profile pane. Transient data-* parts are the ONLY channel that reaches
// useChat's onData (tool-output-available does not), so every pane update must
// go through here. Pure + plain (no server-only) so it is unit-testable.

// Tools whose applied result is an asset row (drives the "What you have" pane).
export const ASSET_TOOLS: ReadonlySet<string> = new Set([
  "upsert_asset",
  "add_real_estate",
  "add_financial_account",
  "flag_heirs_property_risk",
  "update_asset_field",
]);

export type DataPart =
  | { type: "data-asset"; data: unknown }
  | { type: "data-person"; data: unknown }
  | { type: "data-progress"; data: unknown };

export function dataPartForResult(result: {
  name: string;
  data: unknown;
}): DataPart | null {
  if (ASSET_TOOLS.has(result.name)) {
    return { type: "data-asset", data: result.data };
  }
  if (result.name === "add_person") {
    return { type: "data-person", data: result.data };
  }
  if (
    result.name === "confirm_chapter_complete" ||
    result.name === "defer_chapter"
  ) {
    return { type: "data-progress", data: result.data };
  }
  return null;
}
