// Shapes shared between the About You client form and its server action.
// Kept in a plain module (not the "use server" file, which may only export
// async functions).

export type AboutYouSpouse = {
  legalName: string;
  dob: string; // ISO YYYY-MM-DD
  state: string;
};

export type AboutYouDependent = { name: string };

export type AboutYouDetails = {
  spouse: AboutYouSpouse | null;
  dependents: AboutYouDependent[];
  household: string;
};

export type AboutYouData = {
  legalName: string;
  dob: string; // ISO YYYY-MM-DD
  state: string;
  maritalStatus: string;
  details: AboutYouDetails;
};

export const EMPTY_ABOUT_YOU: AboutYouData = {
  legalName: "",
  dob: "",
  state: "",
  maritalStatus: "",
  details: { spouse: null, dependents: [], household: "" },
};
