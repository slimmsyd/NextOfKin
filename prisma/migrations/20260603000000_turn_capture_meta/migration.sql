-- Capture-intelligence signals on conversation turns (the onboarding flywheel).
-- All nullable, additive, and safe to apply online.
ALTER TABLE "conversation_turn"
  ADD COLUMN "input_method" TEXT,
  ADD COLUMN "desync" BOOLEAN,
  ADD COLUMN "meta" JSONB;
