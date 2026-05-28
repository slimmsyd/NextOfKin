// Heirs property is a derived state of the asset row, not its own column.
// Surface it when an inherited property has uncertain title or no recorded deed.
// Accepts the loose serialized shape (string | null) the UI carries; Prisma
// enum types narrow to subsets of strings, which makes equality checks safe.
export function heirsPropertyRisk(a: {
  acquisitionSource: string | null;
  titleStatus: string | null;
  deedRecorded: boolean | null;
}): boolean {
  if (a.acquisitionSource !== "inherited") return false;
  return (
    a.titleStatus === "unclear" ||
    a.titleStatus === "no_recorded_deed" ||
    a.titleStatus === "undivided_fractional" ||
    a.deedRecorded === false
  );
}
