// Pure helper for the same-turn create-and-link resolution. When the person
// names a recipient for an asset that is being captured in the SAME turn, the
// asset has no id yet (ids are assigned on create), so add_person cannot pass a
// real asset_id. The model instead passes receives_new_asset_label (the asset's
// label), and the route resolves it to the freshly-created asset's id after the
// asset tools run. Pure + plain (no server-only, no IO) so it is unit-tested.

export type NewAsset = { id: string; label: string | null };

function norm(s: string | null | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

/**
 * Decide which asset id an add_person recipient should link to.
 * - An explicit existing asset_id always wins (the normal, on-record case).
 * - Else match receives_new_asset_label against assets created THIS turn, by
 *   normalized label.
 * - Else, if exactly one asset was created this turn, link to it (covers LLM
 *   label drift, e.g. "Hyundai" vs "Hyundai Sonata 2017").
 * - Else undefined (a general heir with no specific asset, or ambiguous).
 */
export function resolveRecipientAssetId(
  args: { asset_id?: string | null; receives_new_asset_label?: string | null },
  newAssetsThisTurn: NewAsset[],
): string | undefined {
  if (args.asset_id) return args.asset_id;

  const label = args.receives_new_asset_label;
  if (!label) return undefined;

  const want = norm(label);
  const exact = newAssetsThisTurn.find((a) => norm(a.label) === want);
  if (exact) return exact.id;

  if (newAssetsThisTurn.length === 1) return newAssetsThisTurn[0].id;

  return undefined;
}
