import { describe, it, expect } from "vitest";
import { Client } from "pg";

// Regression test for the audit-trigger bug: log_audit_event() referenced
// OLD/NEW.deleted_at unconditionally, so every UPDATE on chapter_progress (a
// table without deleted_at) aborted with Postgres 42703. That silently blocked
// confirm_chapter_complete / defer_chapter, freezing chapter progress at
// 'active' and stopping the intake sidebar from unlocking the next phase.
// Fixed in migration 20260608000000_audit_deleted_at_guard.
//
// DB-gated: skips without DATABASE_URL (so `pnpm test` and CI stay green).
// Run it against the real DB with:  pnpm test:db
// Everything runs inside a transaction that is rolled back, so no data is
// mutated. Pre-fix this UPDATE throws; post-fix it resolves.

const DB = process.env.DATABASE_URL;
const SENTINEL_CHAPTER = "__smoke_audit_trigger__";

describe.skipIf(!DB)("chapter_progress audit trigger (integration)", () => {
  it("permits UPDATE on a table without a deleted_at column", async () => {
    const c = new Client({ connectionString: DB });
    await c.connect();
    try {
      await c.query("BEGIN");
      const u = await c.query('SELECT id FROM "user" LIMIT 1');
      if (!u.rows.length) {
        // No user to satisfy the FK; nothing to assert in an empty DB.
        await c.query("ROLLBACK");
        return;
      }
      const userId = u.rows[0].id;

      // INSERT works even pre-fix (the trigger's INSERT branch never reads
      // deleted_at). The UPDATE below is the path that crashed pre-fix.
      await c.query(
        "INSERT INTO chapter_progress (user_id, chapter, status, started_at) VALUES ($1, $2, $3, now())",
        [userId, SENTINEL_CHAPTER, "active"],
      );

      await expect(
        c.query(
          "UPDATE chapter_progress SET status = $1, completed_at = now() WHERE user_id = $2 AND chapter = $3",
          ["complete", userId, SENTINEL_CHAPTER],
        ),
      ).resolves.toBeDefined();
    } finally {
      await c.query("ROLLBACK").catch(() => {});
      await c.end();
    }
  });
});
