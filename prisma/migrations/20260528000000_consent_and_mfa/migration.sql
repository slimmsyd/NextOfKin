-- ============================================================
-- MFA method on user + Consent gate table
-- ============================================================

-- ---------- User.mfa_method ----------
CREATE TYPE "MfaMethod" AS ENUM ('sms', 'totp');

ALTER TABLE public."user" ADD COLUMN "mfa_method" "MfaMethod";

-- ============================================================
-- Consent: append-only record of intake consent acceptance.
-- One row per acceptance (re-acceptance on a new version adds a row).
-- ============================================================

CREATE TABLE public.consent (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  version     text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  ip_address  text
);

CREATE INDEX consent_user_id_idx ON public.consent (user_id);

-- ---------- RLS: owner-only ----------
ALTER TABLE public.consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "consent_owner_select" ON public.consent
  FOR SELECT USING (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "consent_owner_insert" ON public.consent
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  );

-- No UPDATE / DELETE policies. Consent is append-only from the user's
-- perspective. Service-role (Prisma) bypasses RLS for admin operations.

-- ---------- Audit trigger ----------
-- Reuse the existing log_audit_event function. Consent acceptance is a
-- state change worth tracking just like asset writes.
CREATE TRIGGER audit_consent
  AFTER INSERT OR UPDATE OR DELETE ON public.consent
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
