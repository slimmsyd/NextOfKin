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

export type SidebarSectionState = "done" | "active" | "locked";

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
