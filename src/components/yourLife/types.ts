export type AssetView = {
  id: string;
  type: string;
  label: string | null;
  location: string | null;
  estimatedValue: string | null;
  acquisitionSource: string | null;
  titleStatus: string | null;
  deedRecorded: boolean | null;
  createdAt: string;
};

export type IdentityView = {
  firstName: string;
  lastName: string;
  stateCode: string;
  legalName: string | null;
  dob: string | null; // ISO YYYY-MM-DD
  maritalStatus: string | null;
} | null;

export type FamilyView = {
  spouseName: string | null;
  dependentNames: string[];
  household: string | null;
} | null;

// "future" = a phase shown dimmed as a teaser (e.g. Wishes & stories, V1.5),
// not part of the V1 path and not lockable/reachable.
export type SidebarSectionState = "done" | "active" | "locked" | "future";

export type SidebarSection = {
  label: string;
  state: SidebarSectionState;
};

export type ChatTurnView = {
  id: string;
  role: "user" | "agent";
  text: string;
  bucket: string | null;
};

export type PersonView = {
  id: string;
  fullName: string;
  relationship: string | null;
  /** The asset this person is designated to receive, if linked. */
  receivesAssetId: string | null;
  receivesAssetLabel: string | null;
};
