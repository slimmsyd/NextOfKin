-- ============================================================
-- Fix: log_audit_event() aborted every UPDATE on audited tables that lack a
-- deleted_at column (e.g. chapter_progress). The restore-detection branch
-- referenced OLD.deleted_at / NEW.deleted_at unconditionally, so any UPDATE on
-- such a table failed with Postgres 42703 ("record \"old\" has no field
-- \"deleted_at\""). This silently blocked confirm_chapter_complete and
-- defer_chapter, so chapter progress never advanced past 'active' and the
-- intake sidebar never unlocked the next phase.
--
-- Guard the deleted_at reference with a jsonb key-existence check so the
-- function works for soft-delete tables (asset, debt, ...) AND status-only
-- tables (chapter_progress) alike. INSERT/DELETE paths were never affected.
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
    -- Restore-detection only applies to tables that have a deleted_at column.
    -- Probe via jsonb key existence so tables without it (chapter_progress)
    -- take the plain 'update' path instead of aborting on a missing field.
    IF (to_jsonb(OLD) ? 'deleted_at')
       AND (to_jsonb(OLD) ->> 'deleted_at') IS NOT NULL
       AND (to_jsonb(NEW) ->> 'deleted_at') IS NULL THEN
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
