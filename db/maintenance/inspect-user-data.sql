-- ============================================================================
-- INSPECT one user's demo data (READ-ONLY). Run before/after a reset.
-- Set the email below, run, and read the per-table counts.
-- ============================================================================
-- Target the user by their login email. The chain is:
--   public.user.auth_user_id  ->  auth.users.id  ->  auth.users.email
-- (To target another way, replace the WHERE in `target`, e.g.
--    WHERE u.first_name = 'Sydney'      -- by name (risky if more than one)
--    WHERE u.id = '<uuid>'              -- by known public.user id
-- )

WITH target AS (
  SELECT u.id
  FROM public."user" u
  JOIN auth.users au ON au.id = u.auth_user_id
  WHERE au.email = 'REPLACE_WITH_SYDNEY_EMAIL'   -- <-- SET THIS
)
SELECT 'asset'                AS table_name, count(*) AS rows FROM public.asset                WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'asset_beneficiary',     count(*) FROM public.asset_beneficiary    WHERE asset_id IN (SELECT id FROM public.asset WHERE user_id IN (SELECT id FROM target))
UNION ALL SELECT 'beneficiary',           count(*) FROM public.beneficiary          WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'estate_intent',         count(*) FROM public.estate_intent        WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'debt',                  count(*) FROM public.debt                 WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'trusted_contact',       count(*) FROM public.trusted_contact      WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'document',              count(*) FROM public.document             WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'check_in',              count(*) FROM public.check_in             WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'death_signal',          count(*) FROM public.death_signal         WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'dissemination_action',  count(*) FROM public.dissemination_action WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'life_event',            count(*) FROM public.life_event           WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'conversation_turn',     count(*) FROM public.conversation_turn    WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'chapter_progress',      count(*) FROM public.chapter_progress     WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'consent',               count(*) FROM public.consent              WHERE user_id IN (SELECT id FROM target)
UNION ALL SELECT 'audit_log',             count(*) FROM public.audit_log            WHERE user_id IN (SELECT id FROM target)
ORDER BY table_name;

-- See the profile fields that a reset would clear (About You / identity):
SELECT id, first_name, last_name, state_code,           -- KEPT by reset
       legal_name, marital_status, about_you_details,   -- cleared by optional reset
       date_of_birth, phone, mfa_method                 -- cleared by optional reset
FROM public."user" u
JOIN auth.users au ON au.id = u.auth_user_id
WHERE au.email = 'REPLACE_WITH_SYDNEY_EMAIL';            -- <-- SET THIS (same email)
