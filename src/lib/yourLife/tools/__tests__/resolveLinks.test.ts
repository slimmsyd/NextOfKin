import { describe, it, expect } from "vitest";
import { resolveRecipientAssetId } from "@/lib/yourLife/tools/resolveLinks";

// Regression for the same-turn create-and-link gap: a recipient named for an
// asset created in the same turn could not be linked because the asset had no
// id at extraction time. resolveRecipientAssetId fills the link after the asset
// is created. See LangSmith trace where Rene was left on the home, not the car.

const HOME = { id: "asset-home", label: "Our home" };
const CAR = { id: "asset-car", label: "Hyundai Sonata 2017" };

describe("resolveRecipientAssetId", () => {
  it("prefers an explicit existing asset_id over any same-turn matching", () => {
    expect(
      resolveRecipientAssetId(
        { asset_id: "asset-home", receives_new_asset_label: "Hyundai Sonata 2017" },
        [CAR],
      ),
    ).toBe("asset-home");
  });

  it("resolves receives_new_asset_label to a this-turn asset by exact label", () => {
    expect(
      resolveRecipientAssetId(
        { receives_new_asset_label: "Hyundai Sonata 2017" },
        [HOME, CAR],
      ),
    ).toBe("asset-car");
  });

  it("matches case-insensitively and trims whitespace (LLM label drift)", () => {
    expect(
      resolveRecipientAssetId(
        { receives_new_asset_label: "  hyundai sonata 2017 " },
        [HOME, CAR],
      ),
    ).toBe("asset-car");
  });

  it("falls back to the single asset created this turn when the label misses", () => {
    expect(
      resolveRecipientAssetId({ receives_new_asset_label: "Hyundai" }, [CAR]),
    ).toBe("asset-car");
  });

  it("returns undefined when the label misses and several assets are ambiguous", () => {
    expect(
      resolveRecipientAssetId({ receives_new_asset_label: "the car" }, [HOME, CAR]),
    ).toBeUndefined();
  });

  it("returns undefined for a general heir (no asset_id, no label)", () => {
    expect(resolveRecipientAssetId({}, [HOME, CAR])).toBeUndefined();
  });
});
