-- ============================================================
-- About You (identity foundation): marital status + legal name as
-- columns, nested spouse/dependents/household as JSON.
-- ============================================================

CREATE TYPE "MaritalStatus" AS ENUM (
  'single',
  'married',
  'domestic_partnership',
  'divorced',
  'widowed',
  'separated'
);

ALTER TABLE public."user"
  ADD COLUMN "legal_name"        text,
  ADD COLUMN "marital_status"    "MaritalStatus",
  ADD COLUMN "about_you_details" jsonb;
