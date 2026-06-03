-- ============================================================================
-- RESET one user's demo data, KEEPING their account. ("Start from the top.")
--
-- Paste into the Supabase SQL editor. Runs in ONE transaction (a DO block):
-- if any statement fails, NOTHING is deleted.
--
-- KEEPS:  the auth account (auth.users) and the public.user row, including
--         first_name, last_name, state_code (signup data). User can still log in.
-- CLEARS: all intake/demo entities, conversation, chapter progress, consent.
-- OPTIONAL: audit-log trail and the About You profile fields (see toggles below).
--
-- Set the email once (v_email). The block resolves the user from:
--   public.user.auth_user_id -> auth.users.id -> auth.users.email
-- ============================================================================

DO $$
DECLARE
  v_email   text := 'REPLACE_WITH_SYDNEY_EMAIL';   -- <-- SET THIS
  v_user_id uuid;
BEGIN
  -- Resolve the target user (by login email).
  -- Alternatives: target by name  ->  WHERE u.first_name = 'Sydney'
  --               target by id    ->  v_user_id := '<uuid>';  (skip this SELECT)
  SELECT u.id
    INTO v_user_id
  FROM public."user" u
  JOIN auth.users au ON au.id = u.auth_user_id
  WHERE au.email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No public.user found for auth email %', v_email;
  END IF;

  RAISE NOTICE 'Resetting demo data for user % (email %)', v_user_id, v_email;

  -- --------------------------------------------------------------------------
  -- Delete children before parents (FK-safe order).
  -- --------------------------------------------------------------------------

  -- Asset<->Beneficiary junction first (it has no user_id; scope via both sides).
  DELETE FROM public.asset_beneficiary
   WHERE asset_id       IN (SELECT id FROM public.asset       WHERE user_id = v_user_id)
      OR beneficiary_id IN (SELECT id FROM public.beneficiary WHERE user_id = v_user_id);

  -- estate_intent references beneficiary with ON DELETE RESTRICT, so it MUST be
  -- deleted before beneficiary rows.
  DELETE FROM public.estate_intent WHERE user_id = v_user_id;

  -- Now the rest of the user-owned tables.
  DELETE FROM public.beneficiary          WHERE user_id = v_user_id;
  DELETE FROM public.asset                WHERE user_id = v_user_id;
  DELETE FROM public.debt                 WHERE user_id = v_user_id;
  DELETE FROM public.trusted_contact      WHERE user_id = v_user_id;
  DELETE FROM public.document             WHERE user_id = v_user_id;
  DELETE FROM public.check_in             WHERE user_id = v_user_id;
  DELETE FROM public.death_signal         WHERE user_id = v_user_id;
  DELETE FROM public.dissemination_action WHERE user_id = v_user_id;
  DELETE FROM public.life_event           WHERE user_id = v_user_id;

  -- The intake conversation + chapter progress (the "work from the demo").
  DELETE FROM public.conversation_turn    WHERE user_id = v_user_id;
  DELETE FROM public.chapter_progress     WHERE user_id = v_user_id;

  -- Consent acceptance. Deleting it makes the welcome/consent gate show again.
  -- Comment this line out if you want to KEEP the consent record.
  DELETE FROM public.consent              WHERE user_id = v_user_id;

  -- --------------------------------------------------------------------------
  -- OPTIONAL: reset the About You / identity-foundation fields on the profile,
  -- keeping the ACCOUNT (auth user, first/last name, state).
  -- Comment out this UPDATE to KEEP the About You answers.
  -- --------------------------------------------------------------------------
  UPDATE public."user"
     SET legal_name        = NULL,
         marital_status    = NULL,
         about_you_details = NULL,
         date_of_birth     = NULL,
         phone             = NULL,
         mfa_method        = NULL
   WHERE id = v_user_id;

  -- --------------------------------------------------------------------------
  -- OPTIONAL: clear this user's audit-log trail too. Off by default (the audit
  -- log is a system record). Uncomment to wipe it for a fully clean slate.
  -- --------------------------------------------------------------------------
  -- DELETE FROM public.audit_log WHERE user_id = v_user_id;

  RAISE NOTICE 'Reset complete for user %.', v_user_id;
END $$;
