-- ============================================================
-- Audit log trigger function + attachments.
-- Runs SECURITY DEFINER so it can INSERT into audit_log regardless of RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_action  public."AuditAction";
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
    v_action  := 'delete';
  ELSIF TG_OP = 'INSERT' THEN
    v_user_id := NEW.user_id;
    v_action  := 'create';
  ELSE
    v_user_id := NEW.user_id;
    IF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      v_action := 'restore';
    ELSE
      v_action := 'update';
    END IF;
  END IF;

  INSERT INTO public.audit_log (
    user_id, actor_type, entity_type, entity_id, action, before, after, source
  ) VALUES (
    v_user_id,
    'user'::public."ActorType",
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_action,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
    'system'::public."AuditSource"
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach to V1 business entities.
CREATE TRIGGER audit_asset
  AFTER INSERT OR UPDATE OR DELETE ON public.asset
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_debt
  AFTER INSERT OR UPDATE OR DELETE ON public.debt
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_beneficiary
  AFTER INSERT OR UPDATE OR DELETE ON public.beneficiary
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_estate_intent
  AFTER INSERT OR UPDATE OR DELETE ON public.estate_intent
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_trusted_contact
  AFTER INSERT OR UPDATE OR DELETE ON public.trusted_contact
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER audit_life_event
  AFTER INSERT OR UPDATE OR DELETE ON public.life_event
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- AssetBeneficiary: junction table; user_id is not on this row. Use a
-- dedicated trigger function that joins to find the owning user.
CREATE OR REPLACE FUNCTION public.log_asset_beneficiary_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_action  public."AuditAction";
  v_asset_id uuid;
BEGIN
  v_asset_id := COALESCE(NEW.asset_id, OLD.asset_id);
  SELECT user_id INTO v_user_id FROM public.asset WHERE id = v_asset_id;

  IF TG_OP = 'DELETE' THEN v_action := 'delete';
  ELSIF TG_OP = 'INSERT' THEN v_action := 'create';
  ELSE v_action := 'update';
  END IF;

  INSERT INTO public.audit_log (
    user_id, actor_type, entity_type, entity_id, action, before, after, source
  ) VALUES (
    v_user_id,
    'user'::public."ActorType",
    TG_TABLE_NAME,
    v_asset_id,
    v_action,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
    'system'::public."AuditSource"
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_asset_beneficiary
  AFTER INSERT OR UPDATE OR DELETE ON public.asset_beneficiary
  FOR EACH ROW EXECUTE FUNCTION public.log_asset_beneficiary_audit();
