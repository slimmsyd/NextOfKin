-- ============================================================
-- updated_at defaults.
-- Prisma's @updatedAt is client-side: PrismaClient populates it on writes
-- but does not emit a database DEFAULT. Triggers and raw-SQL writers hit
-- the NOT NULL constraint. Adding DB-level DEFAULT now() makes the column
-- self-populating for every writer, while PrismaClient still overwrites on
-- UPDATE as it always has.
-- ============================================================

ALTER TABLE public."user"             ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.asset              ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.debt               ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.beneficiary        ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.asset_beneficiary  ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.estate_intent      ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.trusted_contact    ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.document           ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.check_in           ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.death_signal       ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.dissemination_action ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.life_event         ALTER COLUMN updated_at SET DEFAULT now();
