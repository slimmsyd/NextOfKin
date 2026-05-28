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
} | null;

export type ChatTurnView = {
  id: string;
  role: "user" | "agent";
  text: string;
  bucket: string | null;
};
