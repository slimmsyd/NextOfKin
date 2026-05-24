# Supabase + Prisma Foundation — Design Spec

**Date:** 2026-05-24
**Status:** Approved (pending user review of this document)
**Phase:** V1 data layer + auth foundation
**Estimated scope:** Single landing, ~15 files, one cohesive PR

---

## Goal

Wire Supabase Postgres + Supabase Auth + Prisma ORM into NextOfKin as the V1 data and identity layer. Replace the cookie-based `/signup` stub with real authenticated user creation. Define the full 10-entity schema (CLAUDE.md non-negotiable rule #2: structured profile is the single source of truth). Enforce row-level security at the database layer (CLAUDE.md security baseline).

End state: a new email + password through `/signup` produces a real `auth.users` row, a corresponding Prisma `User` row, and an authenticated session that lets the user reach `/start`. Every business entity is queryable, soft-deletable, audit-logged, and state-aware.

This phase ships only the **foundation**. The conversational chapter loop (Phase 3), the people layer UI (Phase 4), and the review/gap surface (Phase 5) consume this foundation but are not in scope here.

---

## Non-goals

- Document generation (V1.5; rule #1 — LLM never touches legal core)
- Death detection (V2)
- Dissemination (V2; rule #3 — multi-signal convergence required)
- Asset recovery integrations (V2)
- MFA UX
- Email confirmation UX
- Field-level PII encryption (deferred; see PII Manifest below)
- Asset/Debt/Beneficiary intake UI (consumes this foundation in later phases)
- Audit log viewer UI (table and triggers exist; surfacing the log is a later phase)

---

## Decisions log (with rationale)

Each entry locks an architecturally hard-to-reverse choice. Reordering or revisiting any of these requires an ADR.

### D1. Database region

**Decision:** Both Supabase projects (`nextofkin-dev`, `nextofkin-prod`) provisioned in **us-east-1 (N. Virginia)**.

**Rationale:** All V1 users (founder's mother + 4 families in founder's network) and the primary distribution channels (NC funeral homes, HBCU alumni, Black-led credit unions) are East Coast. Region is irreversible — switching later means provisioning a new project and migrating data.

**The us-west-2 project the user initially provisioned is discarded.**

### D2. ORM choice

**Decision:** Prisma 5.x.

**Rationale:** User-specified. Mature ecosystem (Studio, Migrate), strong TypeScript integration, well-documented Supabase pairing. Drizzle considered (better RLS ergonomics) but rejected because Prisma was already specified and re-evaluating tooling mid-design adds churn.

### D3. Auth provider

**Decision:** Supabase Auth via `@supabase/ssr`. Email + password.

**Rationale:** Avoids custom auth (security risk + maintenance burden). Auth-emails are fully brandable via custom SMTP (Postmark or Resend) — chosen to address the "non-branded TFA email" concern.

### D4. Beta auth scope

**Decision:** Instant signup. Email confirmation **disabled**. MFA **deferred**.

**Rationale:** Five beta users are known by the founder personally; the email-confirmation friction is unnecessary. MFA before product-market-fit is premature. Both come in a post-beta phase. Custom SMTP is wired now so password-reset emails are branded from day one.

### D5. Data access pattern

**Decision:** Dual-client.

- `prisma` (service-role connection) — server-only, bypasses RLS, used for trusted writes (signup post-creation, internal jobs, admin)
- `supabase-js` (anon key + user JWT) — used for user-scoped reads/writes; RLS auto-enforced by Postgres

**Rationale:** Prisma cannot express RLS policies in its schema language. Using Prisma exclusively means writing zero RLS (violating CLAUDE.md security baseline) or writing manual ownership filters that one missed `WHERE` clause defeats. Dual-client provides defense in depth: app-layer filtering + database-layer RLS, both must fail to leak data. Matches Supabase's documented Prisma pairing.

**Trust boundary enforced via `import "server-only"` at the top of `src/lib/prisma.ts`.** Any client component importing Prisma fails the build.

### D6. Primary key type

**Decision:** `uuid` with Postgres `gen_random_uuid()` default on every entity.

**Rationale:** Matches `auth.users.id` type — clean linkage. RLS predicates against `auth.uid()` work directly. Does not leak row counts in URLs. Standard Supabase pattern.

### D7. Money representation

**Decision:** `numeric(15,2)` for currency, `numeric(5,2)` for percentages.

**Rationale:** Exact-precision decimal storage matches how lawyers, accountants, and tax authorities reason about money. Prisma exposes as `Decimal.js`. BigInt-cents rejected because off-by-100 display bugs are likelier than the precision wins that pattern provides.

### D8. Soft delete

**Decision:** `deleted_at timestamptz NULL` on every business entity. Prisma extension applies the filter automatically. RLS policies include `AND deleted_at IS NULL` for reads.

**Excluded from soft delete:**
- `User` — deletion cascades from `auth.users`
- `AuditLog` — immutable by definition
- Junction tables (`AssetBeneficiary`) — delete the relationship row to remove the relationship

**Rationale:** Estate data is delete-averse. Family disputes, recovery from beta-user mistakes, and the future 72-hour dissemination grace window all require reversibility. Soft delete is the well-known pattern.

### D9. Polymorphism (Beneficiary, TrustedContact)

**Decision:** Single table per polymorphic concept, with a `type` discriminator. Type-specific columns are nullable based on discriminator.

```
Beneficiary { ..., type ('person'|'entity'),
              full_name, date_of_birth?, relationship?,    -- person fields
              org_legal_name?, ein?, entity_type?, ... }    -- entity fields
```

`AssetBeneficiary` junction holds per-asset metadata (share %, primary/contingent, source). Same pattern for `TrustedContact`.

**Rationale:** The two-table (Person + Entity) approach pays a UNION cost on the most common query ("show all my beneficiaries"). Nullable columns by type are not a smell when the discriminator is explicit and constrained.

### D10. POD/TOD non-probate transfer modeling

**Decision:** Extended schema explicitly representing the institution-vs-intent gap.

- `Asset.transfer_path enum('non_probate_designation', 'probate', 'jtwros', 'trust')` — set deterministically by `Asset.type` mapping (401k, IRA, life insurance, TOD/POD → non_probate; etc.). Stored, not derived, so gap-surface queries don't relitigate domain rules.
- `AssetBeneficiary.source enum('user_declared', 'institution_verified', 'document_inferred')` — distinguishes "user said this" from "we confirmed with Fidelity."
- `EstateIntent` table — captures user-level "who I want to inherit my estate" separately from per-asset designations. Phase 5 gap surface joins these to detect the catastrophic-scenario divergence (will says kids, 401k says ex-spouse).

**Rationale:** This is the product's stated differentiator versus will-only competitors. Hard-coding the detection in app code instead of the schema reduces it to "trust me, this matters" rather than queryable evidence.

### D11. Heirs property modeling

**Decision:** Structured fields directly on `Asset`, nullable for non-real-estate types:

```
Asset {
  ...
  acquisition_source ('inherited'|'purchased'|'gifted'|'unknown')?
  title_status ('sole'|'jtwros'|'tenancy_in_common'
                |'undivided_fractional'|'no_recorded_deed'|'unclear')?
  deed_recorded boolean?
  co_owners_known boolean?
}
```

Heirs property risk is **computed** by Phase 5 queries from this combination — not stored as a column.

**Rationale:** Required by CLAUDE.md ("heirs property risk surfaces automatically when family land is mentioned" + "cultural specificity is a feature"). A single boolean loses the structural detail needed for accurate detection. A separate `RealEstateDetail` extension table is premature when real estate is the only asset type with this much structure in V1; revisited in V1.5+ when vehicles, personal property, and business interests arrive.

### D12. Audit logging

**Decision:** Single polymorphic `AuditLog` table populated by Postgres triggers on every business table. Triggers attached now to all V1 entities.

```
AuditLog { id, occurred_at, user_id?, actor_type, entity_type, entity_id,
           action ('create'|'update'|'delete'|'restore'),
           before jsonb?, after jsonb?, source, request_id? }
```

Append-only via RLS (no `UPDATE` or `DELETE` policies on `AuditLog` ever).

**Rationale:** Retrofitting audit on populated data is a multi-day incident. Triggers mean app code can never forget to log. Shape is locked so future entities = one trigger addition.

### D13. Enum representation

**Decision:** Postgres native `enum` types for stable concepts (asset_type, transfer_path, title_status, acquisition_source, beneficiary_type, designation, actor_type, audit_action, trusted_contact_role, life_event_type, etc.).

**Rationale:** Adding a value requires `ALTER TYPE` — a deliberate migration. Type safety in Prisma + TypeScript catches typos at compile time. The rigidity is a feature: adding a new asset type *should* be an explicit architectural moment.

### D14. Email storage

**Decision:** Not duplicated. `auth.users.email` is the source of truth.

**Rationale:** The auth session carries email on every authenticated request. Duplicating creates a sync problem with no offsetting convenience win. `first_name`, `last_name` live on `User` (app-domain). Email stays on `auth.users` (auth-domain).

### D15. `state_code` semantics

**Decision:** `char(2) NOT NULL` on every entity. **Per-entity jurisdiction**, defaulting to the user's domicile.

- `User.state_code` = user's domicile
- `Asset.state_code` (real estate) = property location
- `Asset.state_code` (financial accounts) = institution state, or user domicile if unclear
- `Beneficiary.state_code` = beneficiary's residence
- `TrustedContact.state_code` = contact's residence

App code defaults to `user.state_code` on insert; conversation layer can override based on context. Phase 5 surfaces inconsistencies.

**Rationale:** CLAUDE.md explicitly states "architecturally multi-state." Defaulting wrong now means backfill logic later that doesn't have the original context. V1 beta is NC-only so defaults will be NC anyway — the column already means the right thing.

### D16. Migration ownership

**Decision:** Prisma owns all migrations. Supabase CLI used **only** for `supabase gen types typescript`.

**Workflow:**
1. Edit `prisma/schema.prisma`
2. `pnpm prisma migrate dev --create-only --name <change>` — drafts SQL, does not apply
3. Hand-edit the generated SQL to add RLS policies, triggers, and `CREATE EXTENSION` statements
4. `pnpm prisma migrate dev` — applies to dev DB
5. `pnpm supabase gen types typescript --linked > src/lib/supabase/database.types.ts` — regenerates TS types for supabase-js
6. Commit migration SQL + regenerated types together

**Rationale:** Mixing Prisma Migrate and Supabase CLI migrations produces two histories that drift. One owner removes confusion.

### D17. Local development environment

**Decision:** Two Supabase projects: `nextofkin-dev` and `nextofkin-prod`. Both us-east-1, free tier.

- `.env.local` → dev project
- Vercel env vars → prod project
- Migrations applied to dev first, then promoted to prod by rerunning `prisma migrate deploy` against the prod connection string

**Rationale:** Real Supabase environment matches real production behavior. Free tier covers both. Local Supabase via Docker considered and rejected for setup overhead and inability to surface RLS/networking edge cases.

### D18. Connection pooling

**Decision:**

```bash
DATABASE_URL="postgresql://postgres.<ref>:<pw>@<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.<ref>:<pw>@<region>.pooler.supabase.com:5432/postgres"
```

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Rationale:** Vercel serverless invocations open new DB connections on cold start. Supavisor (port 6543, transaction mode) pools them. `pgbouncer=true` tells Prisma to disable prepared statements (transaction mode drops them between statements). `connection_limit=1` prevents pool pinning under burst load. `DIRECT_URL` (port 5432) bypasses pooling for `prisma migrate`, which needs session-level features pooling drops.

### D19. PII encryption strategy

**Decision:** Deferred to a dedicated phase before user #6 (broader rollout). For V1 beta, sensitive fields stored in plaintext columns inside the RLS-enforced, at-rest-encrypted Supabase Postgres.

**Manifest:** `prisma/sensitive_fields.ts` enumerates every column that must be encrypted before broader rollout. The pre-rollout encryption phase is scheduled and added to the project roadmap as a hard gate, not a "nice to have." Approach (Supabase Vault vs application-layer envelope encryption) chosen during that phase.

**V1 manifest contents:**
- `User.date_of_birth`
- `Asset.identifier` (account numbers, deed identifiers)
- `Beneficiary.full_name`, `Beneficiary.date_of_birth`, `Beneficiary.ein`
- `TrustedContact.phone`, `TrustedContact.email`
- Any future `User.ssn` field (not in V1 schema)

**Rationale:** Five trusted beta users + RLS + at-rest encryption + SOC-2-bound Supabase = acceptable risk for the beta window. App-layer encryption at this stage trades complexity for protection from a threat model (service-role key leak) that the beta cohort is unlikely to materialize. The hard deadline + manifest prevent "we'll do it later" from becoming "we never did."

### D20. Signup flow rewrite

**Decision:** Replace the cookie-based stub with real Supabase Auth.

**New flow:**
1. `/signup` form collects `first_name`, `last_name`, `email`, **`password`** (new field)
2. Server action calls `supabase.auth.signUp({ email, password, options: { data: { first_name, last_name } } })`
3. Postgres trigger on `auth.users` INSERT auto-creates a `User` row with `first_name`, `last_name`, default `state_code='NC'` for V1
4. User is auto-confirmed (email confirmation disabled), session cookie set
5. Redirect to `/start`

**The cookie-based `nok_signup` flow is removed entirely.** Middleware protects `/start` and `/setup`, redirecting unauthenticated users to `/signup`.

---

## Architecture

### Directory layout

```
prisma/
  schema.prisma                            # 10 entities + AuditLog + auth.users link
  sensitive_fields.ts                      # PII encryption manifest
  migrations/
    <ts>_init/migration.sql                # Prisma-generated tables + Postgres enums
    <ts>_rls/migration.sql                 # RLS enable + policies (hand-written SQL)
    <ts>_audit_triggers/migration.sql      # AuditLog triggers per entity (hand-written SQL)
    <ts>_user_mirror_trigger/migration.sql # auth.users → User mirror (hand-written SQL)

src/lib/
  prisma.ts                                # PrismaClient singleton; "server-only"
  supabase/
    server.ts                              # createServerClient (RSC, route handlers)
    client.ts                              # createBrowserClient (client components)
    middleware.ts                          # session refresh helper
    database.types.ts                      # generated; do not edit

src/middleware.ts                          # delegates to supabase/middleware.ts

src/app/
  signup/
    page.tsx                               # adds password field
    actions.ts                             # server action: supabase.auth.signUp
  start/page.tsx                           # protected
  setup/page.tsx                           # protected
  api/
    signup/route.ts                        # DELETED (cookie stub removed)

.env.local                                 # gitignored
.env.local.example                         # committed; no secrets
```

### Trust-boundary diagram

```
                          Browser (React client components)
                                      |
                                      |  supabase-js (anon key + user JWT)
                                      |  RLS enforced
                                      v
                              Postgres (Supabase)
                                      ^
                                      |
                                      |  supabase-js (server, RSC/route handlers)
                                      |  Prisma (service-role, server-only, RLS bypass)
                                      |
                  Server (Next.js RSC + route handlers + server actions)

  - "server-only" import guard on lib/prisma.ts prevents Prisma reaching client
  - Auth session cookies are httpOnly, set by Supabase Auth, read by middleware
```

### Module responsibilities

| Module | Owns | Used by |
|---|---|---|
| `lib/prisma.ts` | Service-role DB access; admin, signup post-creation, internal jobs | Server actions, route handlers (trusted paths only) |
| `lib/supabase/server.ts` | User-scoped reads/writes from RSC and route handlers | RSC pages, route handlers needing user context |
| `lib/supabase/client.ts` | User-scoped reads/writes from browser | Client components needing live queries |
| `lib/supabase/middleware.ts` | Session refresh, redirect helpers | `src/middleware.ts` |
| `src/middleware.ts` | Route protection (redirect to /signup if no session) | Edge runtime, every request |

---

## Schema (full Prisma model)

This section is the source-of-truth schema. Migration SQL is generated from this.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================================
// Enums (Postgres native)
// ============================================================

enum AssetType {
  real_estate
  account_401k
  account_ira
  account_brokerage
  account_checking
  account_savings
  life_insurance
  annuity
  vehicle
  business_interest
  personal_property
  other
}

enum TransferPath {
  non_probate_designation
  probate
  jtwros
  trust
}

enum AcquisitionSource {
  inherited
  purchased
  gifted
  unknown
}

enum TitleStatus {
  sole
  jtwros
  tenancy_in_common
  undivided_fractional
  no_recorded_deed
  unclear
}

enum BeneficiaryType {
  person
  entity
}

enum BeneficiaryDesignation {
  primary
  contingent
}

enum BeneficiarySource {
  user_declared
  institution_verified
  document_inferred
}

enum EstateIntentRole {
  residual_heir
  specific_bequest
}

enum TrustedContactRole {
  executor
  attestor
  info_recipient
  agent_financial
  agent_healthcare
}

enum ActorType {
  user
  system
  admin
}

enum AuditAction {
  create
  update
  delete
  restore
}

enum AuditSource {
  web
  agent
  system
}

enum DocumentType {
  will
  poa_financial
  poa_healthcare
  advance_directive
  trust
  uploaded_other
}

enum DocumentStatus {
  draft
  pending_review
  finalized
  superseded
}

enum CheckInCadence {
  quarterly
  annual
  event_triggered
}

enum DeathSignalSource {
  heartbeat
  attestation
  obituary
  public_records
  ssdmf
}

enum DisseminationMethod {
  email
  sms
  postal
  api_call
}

enum DisseminationStatus {
  pending
  ready
  executed
  reversed
  cancelled
}

enum LifeEventType {
  marriage
  divorce
  birth_or_adoption
  death_of_relative
  address_change
  major_purchase
  major_sale
  diagnosis
  other
}

// ============================================================
// User (linked to auth.users)
// ============================================================

model User {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  authUserId    String   @unique @map("auth_user_id") @db.Uuid   // FK to auth.users
  firstName     String   @map("first_name")
  lastName      String   @map("last_name")
  stateCode     String   @map("state_code") @db.Char(2)
  dateOfBirth   DateTime? @map("date_of_birth") @db.Date
  phone         String?
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamptz

  assets             Asset[]
  debts              Debt[]
  beneficiaries      Beneficiary[]
  trustedContacts    TrustedContact[]
  documents          Document[]
  checkIns           CheckIn[]
  deathSignals       DeathSignal[]
  disseminationActs  DisseminationAction[]
  lifeEvents         LifeEvent[]
  estateIntents      EstateIntent[]

  @@map("user")
}

// ============================================================
// Assets, Debts
// ============================================================

model Asset {
  id                          String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId                      String              @map("user_id") @db.Uuid
  type                        AssetType
  institution                 String?
  identifier                  String?             // account number, deed id, VIN; sensitive (see manifest)
  estimatedValue              Decimal?            @map("estimated_value") @db.Decimal(15, 2)
  transferPath                TransferPath        @map("transfer_path")

  // real-estate-specific (nullable for non-RE)
  acquisitionSource           AcquisitionSource?  @map("acquisition_source")
  titleStatus                 TitleStatus?        @map("title_status")
  deedRecorded                Boolean?            @map("deed_recorded")
  coOwnersKnown               Boolean?            @map("co_owners_known")

  designationLastVerified     DateTime?           @map("designation_last_verified") @db.Timestamptz
  stateCode                   String              @map("state_code") @db.Char(2)

  createdAt                   DateTime            @default(now()) @map("created_at") @db.Timestamptz
  updatedAt                   DateTime            @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt                   DateTime?           @map("deleted_at") @db.Timestamptz

  user                        User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  beneficiaries               AssetBeneficiary[]

  @@index([userId])
  @@index([userId, deletedAt])
  @@map("asset")
}

model Debt {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String   @map("user_id") @db.Uuid
  creditor        String
  type            String   // text + check constraint, not enum — debt types vary widely
  balance         Decimal? @db.Decimal(15, 2)
  paymentTerms    String?  @map("payment_terms")
  stateCode       String   @map("state_code") @db.Char(2)

  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime? @map("deleted_at") @db.Timestamptz

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("debt")
}

// ============================================================
// People (Beneficiary, TrustedContact) + relationships
// ============================================================

model Beneficiary {
  id              String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String                @map("user_id") @db.Uuid
  type            BeneficiaryType

  // person fields
  fullName        String?               @map("full_name")
  dateOfBirth     DateTime?             @map("date_of_birth") @db.Date
  relationship    String?

  // entity fields
  orgLegalName    String?               @map("org_legal_name")
  ein             String?
  entityType      String?               @map("entity_type")

  stateCode       String                @map("state_code") @db.Char(2)

  createdAt       DateTime              @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime              @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?             @map("deleted_at") @db.Timestamptz

  user            User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  assetDesignations AssetBeneficiary[]
  estateIntents   EstateIntent[]

  @@index([userId])
  @@map("beneficiary")
}

model AssetBeneficiary {
  assetId         String                  @map("asset_id") @db.Uuid
  beneficiaryId   String                  @map("beneficiary_id") @db.Uuid
  sharePercentage Decimal                 @map("share_percentage") @db.Decimal(5, 2)
  designation     BeneficiaryDesignation
  source          BeneficiarySource
  capturedAt      DateTime                @map("captured_at") @db.Timestamptz

  createdAt       DateTime                @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime                @updatedAt @map("updated_at") @db.Timestamptz

  asset           Asset                   @relation(fields: [assetId], references: [id], onDelete: Cascade)
  beneficiary     Beneficiary             @relation(fields: [beneficiaryId], references: [id], onDelete: Cascade)

  // One beneficiary appears at most once per asset. Designation is data,
  // not identity — a beneficiary cannot be both primary and contingent
  // on the same asset.
  @@id([assetId, beneficiaryId])
  @@map("asset_beneficiary")
}

model EstateIntent {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String              @map("user_id") @db.Uuid
  beneficiaryId   String              @map("beneficiary_id") @db.Uuid
  sharePercentage Decimal             @map("share_percentage") @db.Decimal(5, 2)
  role            EstateIntentRole
  note            String?
  stateCode       String              @map("state_code") @db.Char(2)
  capturedAt      DateTime            @map("captured_at") @db.Timestamptz

  createdAt       DateTime            @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime            @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?           @map("deleted_at") @db.Timestamptz

  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  beneficiary     Beneficiary         @relation(fields: [beneficiaryId], references: [id], onDelete: Restrict)

  @@index([userId])
  @@map("estate_intent")
}

model TrustedContact {
  id              String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String                @map("user_id") @db.Uuid
  type            BeneficiaryType       // reuses person|entity enum

  // person fields
  fullName        String?               @map("full_name")
  relationship    String?

  // entity fields
  orgLegalName    String?               @map("org_legal_name")
  entityType      String?               @map("entity_type")

  phone           String?
  email           String?

  roles           TrustedContactRole[]  // Postgres enum array

  stateCode       String                @map("state_code") @db.Char(2)

  createdAt       DateTime              @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime              @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?             @map("deleted_at") @db.Timestamptz

  user            User                  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("trusted_contact")
}

// ============================================================
// Documents, Check-ins, Death Signals, Dissemination, Life Events
// (Tables defined now; V1 routes do not write to these except LifeEvent
// which Phase 2/3 may use for address changes etc.)
// ============================================================

model Document {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String          @map("user_id") @db.Uuid
  type            DocumentType
  version         Int             @default(1)
  jurisdiction    String          @db.Char(2)
  status          DocumentStatus  @default(draft)
  storagePath     String?         @map("storage_path")
  isUploaded      Boolean         @default(false) @map("is_uploaded")

  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime        @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?       @map("deleted_at") @db.Timestamptz

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("document")
}

model CheckIn {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String          @map("user_id") @db.Uuid
  cadence         CheckInCadence
  scheduledFor    DateTime        @map("scheduled_for") @db.Timestamptz
  triggeredBy     String?         @map("triggered_by")
  response        String?
  outcome         String?
  stateCode       String          @map("state_code") @db.Char(2)

  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime        @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?       @map("deleted_at") @db.Timestamptz

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("check_in")
}

model DeathSignal {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String              @map("user_id") @db.Uuid
  source          DeathSignalSource
  confidence      Decimal             @db.Decimal(5, 2)
  timestamp       DateTime            @db.Timestamptz
  verified        Boolean             @default(false)
  stateCode       String              @map("state_code") @db.Char(2)

  createdAt       DateTime            @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime            @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?           @map("deleted_at") @db.Timestamptz

  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("death_signal")
}

model DisseminationAction {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String              @map("user_id") @db.Uuid
  trigger         String              // textual trigger description for V1; structured later
  recipient       String
  payload         Json
  method          DisseminationMethod
  status          DisseminationStatus @default(pending)
  executedAt      DateTime?           @map("executed_at") @db.Timestamptz
  stateCode       String              @map("state_code") @db.Char(2)

  createdAt       DateTime            @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime            @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?           @map("deleted_at") @db.Timestamptz

  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("dissemination_action")
}

model LifeEvent {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String          @map("user_id") @db.Uuid
  type            LifeEventType
  occurredOn      DateTime        @map("occurred_on") @db.Date
  source          String?
  notes           String?
  stateCode       String          @map("state_code") @db.Char(2)

  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz
  updatedAt       DateTime        @updatedAt @map("updated_at") @db.Timestamptz
  deletedAt       DateTime?       @map("deleted_at") @db.Timestamptz

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("life_event")
}

// ============================================================
// AuditLog (append-only; populated by triggers)
// ============================================================

model AuditLog {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  occurredAt      DateTime      @default(now()) @map("occurred_at") @db.Timestamptz
  userId          String?       @map("user_id") @db.Uuid
  actorType       ActorType     @map("actor_type")
  entityType      String        @map("entity_type")    // table name
  entityId        String        @map("entity_id") @db.Uuid
  action          AuditAction
  before          Json?
  after           Json?
  source          AuditSource
  requestId       String?       @map("request_id")

  @@index([userId])
  @@index([entityType, entityId])
  @@index([occurredAt])
  @@map("audit_log")
}
```

---

## RLS policies (raw SQL, hand-written in migration)

For every business entity table, the pattern is:

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<table>_owner_select"
  ON public.<table>
  FOR SELECT
  USING (
    user_id IN (SELECT id FROM public.user WHERE auth_user_id = auth.uid())
    AND deleted_at IS NULL
  );

CREATE POLICY "<table>_owner_insert"
  ON public.<table>
  FOR INSERT
  WITH CHECK (
    user_id IN (SELECT id FROM public.user WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "<table>_owner_update"
  ON public.<table>
  FOR UPDATE
  USING (
    user_id IN (SELECT id FROM public.user WHERE auth_user_id = auth.uid())
  )
  WITH CHECK (
    user_id IN (SELECT id FROM public.user WHERE auth_user_id = auth.uid())
  );

-- No DELETE policy: soft-delete via UPDATE deleted_at instead.
```

**Exceptions:**

- **`User` table:** SELECT/UPDATE policies key on `auth_user_id = auth.uid()` directly. No `user_id` indirection.
- **`AssetBeneficiary`** (junction): policy checks ownership through `asset_id`'s parent asset.
- **`AuditLog`:** SELECT policy (own rows only via `user_id`). **No** INSERT/UPDATE/DELETE policies — only triggers (running as `SECURITY DEFINER`) can write.

---

## Trigger SQL (raw SQL, hand-written in migration)

### `auth.users` → `public.user` mirror

```sql
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user (auth_user_id, first_name, last_name, state_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'state_code', 'NC')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
```

### AuditLog write-trigger (template; one per entity)

```sql
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_action public."AuditAction";
BEGIN
  -- determine user_id from row (NEW for insert/update, OLD for delete)
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
    v_action := 'delete';
  ELSIF TG_OP = 'INSERT' THEN
    v_user_id := NEW.user_id;
    v_action := 'create';
  ELSE
    v_user_id := NEW.user_id;
    -- restore detection: deleted_at went from non-null to null
    IF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      v_action := 'restore';
    ELSE
      v_action := 'update';
    END IF;
  END IF;

  INSERT INTO public.audit_log (
    user_id, actor_type, entity_type, entity_id, action,
    before, after, source
  ) VALUES (
    v_user_id,
    'user',
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_action,
    CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
    'system'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach to each entity:
CREATE TRIGGER audit_asset AFTER INSERT OR UPDATE OR DELETE ON public.asset
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_debt AFTER INSERT OR UPDATE OR DELETE ON public.debt
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
-- ... (one per entity)
```

---

## Environment variables

`.env.local.example` (committed):

```bash
# Pooled connection (port 6543, Supavisor transaction mode)
DATABASE_URL="postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct connection (port 5432) — used only by prisma migrate
DIRECT_URL="postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:5432/postgres"

# Supabase client config
NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

`.env.local` is gitignored (already in `.gitignore` per the `.env*` rule).

---

## Risks and known gotchas

1. **`connection_limit=1` on pooled URL is non-obvious.** Without it, Vercel serverless under load can pin the connection pool. Documented in D18.
2. **The `auth.users` mirror trigger relies on signup metadata.** If `signUp({ options: { data: { first_name, last_name } } })` is called without those fields, the trigger inserts empty strings. Server action validates first.
3. **RLS bypass via Prisma is intentional and load-bearing.** The signup-time `User` row insert happens via Prisma (service-role) because the user has no session yet at that exact moment, so supabase-js wouldn't be RLS-authorized. The trigger approach above does this via SECURITY DEFINER instead, sidestepping the problem entirely. Document this.
4. **Postgres array enum (TrustedContactRole[])** is supported by Prisma but rare. Tested in Prisma 5.x; works on Postgres 14+. Supabase ships modern Postgres so this is fine.
5. **PII in audit log JSON.** `before`/`after` JSONB columns will contain sensitive fields once we add encryption. The encryption-rollout phase must address whether to encrypt these JSONB blobs as well.
6. **Auth-mirror trigger and `state_code` default.** Trigger defaults `state_code` to `'NC'` if not provided in metadata. V1 only accepts NC users, so this is correct for V1. V2 multi-state expansion requires updating both the signup form and the trigger.
7. **Vercel deploys need env vars.** Spec assumes manual setup of Vercel env vars pointing to prod project. CI/CD wiring out of scope here.
8. **`state_code` is on business entities only, not on `AuditLog` or junction tables.** CLAUDE.md says "every entity carries state_code"; that applies to domain entities. `AuditLog` is an operational record (state derivable from the entity it references); `AssetBeneficiary` is a junction (state derivable from the parent Asset). This is intentional; spec calls it out so reviewers don't read it as an omission.
9. **RLS subquery vs JWT claim — performance.** Policies use `user_id IN (SELECT id FROM public.user WHERE auth_user_id = auth.uid())`. Postgres caches the subquery per statement so it's fine at V1 scale (5–500 users). At larger scale, replace with a custom JWT claim (`auth.jwt() ->> 'user_id'`) emitted by a Supabase Auth hook. Not in V1 scope; flagged for future optimization.

---

## What this spec does *not* cover (intentionally)

These are downstream phases that consume this foundation:

- The conversational chapter loop (Phase 3) — uses the schema, lives in its own phase
- The right-pane live profile UI (Phase 3) — consumes Supabase Realtime, scoped separately
- The people-layer intake UI (Phase 4) — writes to Beneficiary, AssetBeneficiary, EstateIntent, TrustedContact
- The Phase 5 review + gap surface — queries the schema, including the POD/TOD mismatch detection
- Document generation (V1.5) — writes to Document
- Death detection + dissemination (V2) — write to DeathSignal, DisseminationAction
- PII encryption rollout — own phase, scheduled before broader rollout
- MFA + email confirmation UX — own phase, post-beta
- CI/CD pipeline for `prisma migrate deploy` to prod — own phase

---

## Implementation handoff

After approval, this spec routes to the `writing-plans` skill, which will produce a phase-level implementation plan with concrete task breakdown, dependency ordering, and verification checkpoints.

**Estimated work:**
- Provision two Supabase projects (~5 min)
- Install + scaffold (`pnpm add prisma @prisma/client @supabase/ssr @supabase/supabase-js`, `pnpm dlx prisma init`) (~10 min)
- Write `prisma/schema.prisma` (~1–2 hr)
- Initial migration + hand-edit RLS SQL + audit trigger SQL + user-mirror SQL (~2–3 hr)
- `lib/prisma.ts`, `lib/supabase/{server,client,middleware}.ts`, `src/middleware.ts` (~1 hr)
- Rewrite `/signup` page + server action; delete old `/api/signup/route.ts` (~1 hr)
- Wire custom SMTP in Supabase Auth dashboard (~30 min)
- Update `/start` and `/setup` to be session-protected (~30 min)
- Generate types (`supabase gen types`) and commit (~5 min)
- Smoke test the full signup flow end-to-end (~30 min)

Total: ~half a working day, plus Supabase dashboard configuration.
