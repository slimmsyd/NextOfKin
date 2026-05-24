// PII manifest. Populated for the encryption rollout phase scheduled before
// broader rollout. Imported by no production code today; lives here as a
// machine-readable record of which columns must be encrypted at-field-level.

export type SensitiveField = {
  model: string;
  field: string;
  reason: string;
};

export const SENSITIVE_FIELDS: SensitiveField[] = [
  { model: "User", field: "dateOfBirth", reason: "Identity vector + age inference" },
  { model: "Asset", field: "identifier", reason: "Account number / deed identifier / VIN" },
  { model: "Beneficiary", field: "fullName", reason: "Direct identifier of third party" },
  { model: "Beneficiary", field: "dateOfBirth", reason: "Identity vector" },
  { model: "Beneficiary", field: "ein", reason: "Entity tax identifier" },
  { model: "TrustedContact", field: "phone", reason: "Contact PII of third party" },
  { model: "TrustedContact", field: "email", reason: "Contact PII of third party" },
];
