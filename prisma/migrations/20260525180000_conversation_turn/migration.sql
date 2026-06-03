-- ============================================================
-- ConversationTurn: per-turn capture for chapter loop resumability.
-- One row per agent or user turn. Tool calls captured as JSONB.
-- ============================================================

CREATE TABLE public.conversation_turn (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  chapter     text NOT NULL,
  role        text NOT NULL,
  text        text NOT NULL,
  tool_calls  jsonb,
  bucket      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX conversation_turn_user_chapter_created_idx
  ON public.conversation_turn (user_id, chapter, created_at);

-- ---------- RLS: owner-only ----------
ALTER TABLE public.conversation_turn ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversation_turn_owner_select" ON public.conversation_turn
  FOR SELECT USING (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "conversation_turn_owner_insert" ON public.conversation_turn
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM public."user" WHERE auth_user_id = auth.uid())
  );

-- No UPDATE / DELETE policies. Turns are append-only from the user's perspective.
-- Service-role (Prisma) bypasses RLS for admin operations.

-- ---------- Audit trigger ----------
-- Reuse the existing log_audit_event function. Conversation turns are state
-- changes worth tracking just like asset writes.
CREATE TRIGGER audit_conversation_turn
  AFTER INSERT OR UPDATE OR DELETE ON public.conversation_turn
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
