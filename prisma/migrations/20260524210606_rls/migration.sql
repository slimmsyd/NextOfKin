-- ============================================================
-- Row-Level Security
-- Pattern: user owns their rows. supabase-js requests carry auth.uid().
-- Prisma (service-role) bypasses RLS entirely; trusted server paths only.
-- ============================================================

-- ---------- User ----------
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_self_select" ON public."user"
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "user_self_update" ON public."user"
  FOR UPDATE USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- INSERT into public.user is handled by the auth.users trigger (SECURITY DEFINER).
-- No INSERT policy = no user can insert their own row via supabase-js. Intentional.
-- DELETE cascades from auth.users; no policy needed.

-- ---------- Asset ----------
ALTER TABLE public.asset ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_owner_select" ON public.asset
  FOR SELECT USING (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
    AND deleted_at IS NULL
  );

CREATE POLICY "asset_owner_insert" ON public.asset
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "asset_owner_update" ON public.asset
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  ) WITH CHECK (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  );

-- ---------- Debt ----------
ALTER TABLE public.debt ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debt_owner_select" ON public.debt FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "debt_owner_insert" ON public.debt FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));
CREATE POLICY "debt_owner_update" ON public.debt FOR UPDATE USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())) WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));

-- ---------- Beneficiary ----------
ALTER TABLE public.beneficiary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "beneficiary_owner_select" ON public.beneficiary FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "beneficiary_owner_insert" ON public.beneficiary FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));
CREATE POLICY "beneficiary_owner_update" ON public.beneficiary FOR UPDATE USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())) WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));

-- ---------- AssetBeneficiary (junction; ownership via parent asset) ----------
ALTER TABLE public.asset_beneficiary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "asset_beneficiary_owner_select" ON public.asset_beneficiary
  FOR SELECT USING (
    asset_id IN (
      SELECT a.id FROM public.asset a
      JOIN public."user" u ON a.user_id = u.id
      WHERE u.auth_user_id = auth.uid() AND a.deleted_at IS NULL
    )
  );
CREATE POLICY "asset_beneficiary_owner_insert" ON public.asset_beneficiary
  FOR INSERT WITH CHECK (
    asset_id IN (
      SELECT a.id FROM public.asset a
      JOIN public."user" u ON a.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );
CREATE POLICY "asset_beneficiary_owner_update" ON public.asset_beneficiary
  FOR UPDATE USING (
    asset_id IN (
      SELECT a.id FROM public.asset a
      JOIN public."user" u ON a.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  ) WITH CHECK (
    asset_id IN (
      SELECT a.id FROM public.asset a
      JOIN public."user" u ON a.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );
CREATE POLICY "asset_beneficiary_owner_delete" ON public.asset_beneficiary
  FOR DELETE USING (
    asset_id IN (
      SELECT a.id FROM public.asset a
      JOIN public."user" u ON a.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- ---------- EstateIntent ----------
ALTER TABLE public.estate_intent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "estate_intent_owner_select" ON public.estate_intent FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "estate_intent_owner_insert" ON public.estate_intent FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));
CREATE POLICY "estate_intent_owner_update" ON public.estate_intent FOR UPDATE USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())) WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));

-- ---------- TrustedContact ----------
ALTER TABLE public.trusted_contact ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trusted_contact_owner_select" ON public.trusted_contact FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "trusted_contact_owner_insert" ON public.trusted_contact FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));
CREATE POLICY "trusted_contact_owner_update" ON public.trusted_contact FOR UPDATE USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())) WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));

-- ---------- Document ----------
ALTER TABLE public.document ENABLE ROW LEVEL SECURITY;
CREATE POLICY "document_owner_select" ON public.document FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "document_owner_insert" ON public.document FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));
CREATE POLICY "document_owner_update" ON public.document FOR UPDATE USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())) WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));

-- ---------- CheckIn ----------
ALTER TABLE public.check_in ENABLE ROW LEVEL SECURITY;
CREATE POLICY "check_in_owner_select" ON public.check_in FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "check_in_owner_insert" ON public.check_in FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));
CREATE POLICY "check_in_owner_update" ON public.check_in FOR UPDATE USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())) WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));

-- ---------- DeathSignal (V1: no client writes; reads only via service-role server jobs) ----------
ALTER TABLE public.death_signal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "death_signal_owner_select" ON public.death_signal FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()) AND deleted_at IS NULL);
-- No INSERT/UPDATE policy: V1 has no death-signal client writes. All writes go via service-role from server jobs (V2).

-- ---------- DisseminationAction (V1: no client writes) ----------
ALTER TABLE public.dissemination_action ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dissemination_action_owner_select" ON public.dissemination_action FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()) AND deleted_at IS NULL);
-- No INSERT/UPDATE policy: V1 has no dissemination-action client writes.

-- ---------- LifeEvent ----------
ALTER TABLE public.life_event ENABLE ROW LEVEL SECURITY;
CREATE POLICY "life_event_owner_select" ON public.life_event FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()) AND deleted_at IS NULL);
CREATE POLICY "life_event_owner_insert" ON public.life_event FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));
CREATE POLICY "life_event_owner_update" ON public.life_event FOR UPDATE USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())) WITH CHECK (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));

-- ---------- AuditLog (read-only for users; writes happen via SECURITY DEFINER trigger) ----------
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_self_select" ON public.audit_log FOR SELECT USING (user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid()));
-- No INSERT/UPDATE/DELETE policies. Triggers run as SECURITY DEFINER and bypass.
