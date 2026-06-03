# DB maintenance SQL

Repeatable, hand-run SQL for the NextOfKin Supabase database. Paste into the
Supabase SQL editor (it runs as a privileged role, so RLS does not block these).

These are operational scripts, NOT Prisma migrations. They never run
automatically. Read the comments before running anything destructive.

## Files

| File | What it does | Destructive? |
|---|---|---|
| `inspect-user-data.sql` | Counts every demo row for one user (by email). Run before/after a reset. | No (read-only) |
| `reset-user-demo-data.sql` | Clears all intake/demo data for one user but KEEPS their account. | Yes |

## How to reset a user's demo data ("start from the top")

1. Open `inspect-user-data.sql`, set the email at the top, run it. Note the counts.
2. Open `reset-user-demo-data.sql`, set the same email at the top.
3. Read the OPTIONAL sections (consent, audit log, About You profile reset) and
   comment out anything you want to keep.
4. Run it. It executes in one transaction (a `DO` block): if anything fails,
   nothing is deleted.
5. Re-run `inspect-user-data.sql` to confirm counts are 0.

## What "reset" keeps vs clears

- **KEEPS:** the auth account (`auth.users`) and the `public.user` row, including
  `first_name`, `last_name`, `state_code` (set at signup). The user can still log in.
- **CLEARS (default):** every asset, beneficiary + links, debt, trusted contact,
  document, check-in, death signal, dissemination action, life event,
  conversation turn, chapter progress, and consent.
- **OPTIONAL (toggle in the file):** the audit-log trail, and the About You /
  identity-foundation fields on the profile (`legal_name`, `marital_status`,
  `about_you_details`, `date_of_birth`, `phone`, `mfa_method`).

## Targeting a user

All scripts resolve the user from their login email:
`public.user.auth_user_id -> auth.users.id -> auth.users.email`.
If you prefer, the files note how to target by `first_name`/`last_name` or by a
known `public.user.id` instead.
