-- ============================================================
-- ChapterProgress: per-user, per-chapter status for the Phase 3 loop.
-- Mutable (status advances active -> complete/deferred), so RLS includes
-- UPDATE. updated_at carries a DB-level default so raw SQL / triggers never
-- hit a NOT NULL violation.
-- ============================================================

CREATE TYPE "ChapterStatus" AS ENUM ('not_started', 'active', 'complete', 'deferred');

CREATE TABLE public.chapter_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  chapter      text NOT NULL,
  status       "ChapterStatus" NOT NULL DEFAULT 'not_started',
  defer_reason text,
  started_at   timestamptz,
  completed_at timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX chapter_progress_user_chapter_key
  ON public.chapter_progress (user_id, chapter);

-- ---------- RLS: owner-only ----------
ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chapter_progress_owner_select" ON public.chapter_progress
  FOR SELECT USING (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "chapter_progress_owner_insert" ON public.chapter_progress
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "chapter_progress_owner_update" ON public.chapter_progress
  FOR UPDATE USING (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  );

-- Service-role (Prisma) bypasses RLS for admin operations.

-- ---------- Audit trigger ----------
CREATE TRIGGER audit_chapter_progress
  AFTER INSERT OR UPDATE OR DELETE ON public.chapter_progress
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
