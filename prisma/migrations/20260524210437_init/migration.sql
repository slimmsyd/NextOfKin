-- pgcrypto provides gen_random_uuid(); some Supabase projects ship with it,
-- but enable explicitly so the migration is portable.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('real_estate', 'account_401k', 'account_ira', 'account_brokerage', 'account_checking', 'account_savings', 'life_insurance', 'annuity', 'vehicle', 'business_interest', 'personal_property', 'other');

-- CreateEnum
CREATE TYPE "TransferPath" AS ENUM ('non_probate_designation', 'probate', 'jtwros', 'trust');

-- CreateEnum
CREATE TYPE "AcquisitionSource" AS ENUM ('inherited', 'purchased', 'gifted', 'unknown');

-- CreateEnum
CREATE TYPE "TitleStatus" AS ENUM ('sole', 'jtwros', 'tenancy_in_common', 'undivided_fractional', 'no_recorded_deed', 'unclear');

-- CreateEnum
CREATE TYPE "BeneficiaryType" AS ENUM ('person', 'entity');

-- CreateEnum
CREATE TYPE "BeneficiaryDesignation" AS ENUM ('primary', 'contingent');

-- CreateEnum
CREATE TYPE "BeneficiarySource" AS ENUM ('user_declared', 'institution_verified', 'document_inferred');

-- CreateEnum
CREATE TYPE "EstateIntentRole" AS ENUM ('residual_heir', 'specific_bequest');

-- CreateEnum
CREATE TYPE "TrustedContactRole" AS ENUM ('executor', 'attestor', 'info_recipient', 'agent_financial', 'agent_healthcare');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('user', 'system', 'admin');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('create', 'update', 'delete', 'restore');

-- CreateEnum
CREATE TYPE "AuditSource" AS ENUM ('web', 'agent', 'system');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('will', 'poa_financial', 'poa_healthcare', 'advance_directive', 'trust', 'uploaded_other');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('draft', 'pending_review', 'finalized', 'superseded');

-- CreateEnum
CREATE TYPE "CheckInCadence" AS ENUM ('quarterly', 'annual', 'event_triggered');

-- CreateEnum
CREATE TYPE "DeathSignalSource" AS ENUM ('heartbeat', 'attestation', 'obituary', 'public_records', 'ssdmf');

-- CreateEnum
CREATE TYPE "DisseminationMethod" AS ENUM ('email', 'sms', 'postal', 'api_call');

-- CreateEnum
CREATE TYPE "DisseminationStatus" AS ENUM ('pending', 'ready', 'executed', 'reversed', 'cancelled');

-- CreateEnum
CREATE TYPE "LifeEventType" AS ENUM ('marriage', 'divorce', 'birth_or_adoption', 'death_of_relative', 'address_change', 'major_purchase', 'major_sale', 'diagnosis', 'other');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auth_user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "state_code" CHAR(2) NOT NULL,
    "date_of_birth" DATE,
    "phone" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "AssetType" NOT NULL,
    "institution" TEXT,
    "identifier" TEXT,
    "estimated_value" DECIMAL(15,2),
    "transfer_path" "TransferPath" NOT NULL,
    "acquisition_source" "AcquisitionSource",
    "title_status" "TitleStatus",
    "deed_recorded" BOOLEAN,
    "co_owners_known" BOOLEAN,
    "designation_last_verified" TIMESTAMPTZ,
    "state_code" CHAR(2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "creditor" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DECIMAL(15,2),
    "payment_terms" TEXT,
    "state_code" CHAR(2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "debt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiary" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "BeneficiaryType" NOT NULL,
    "full_name" TEXT,
    "date_of_birth" DATE,
    "relationship" TEXT,
    "org_legal_name" TEXT,
    "ein" TEXT,
    "entity_type" TEXT,
    "state_code" CHAR(2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_beneficiary" (
    "asset_id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "share_percentage" DECIMAL(5,2) NOT NULL,
    "designation" "BeneficiaryDesignation" NOT NULL,
    "source" "BeneficiarySource" NOT NULL,
    "captured_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "asset_beneficiary_pkey" PRIMARY KEY ("asset_id","beneficiary_id")
);

-- CreateTable
CREATE TABLE "estate_intent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "share_percentage" DECIMAL(5,2) NOT NULL,
    "role" "EstateIntentRole" NOT NULL,
    "note" TEXT,
    "state_code" CHAR(2) NOT NULL,
    "captured_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "estate_intent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trusted_contact" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "BeneficiaryType" NOT NULL,
    "full_name" TEXT,
    "relationship" TEXT,
    "org_legal_name" TEXT,
    "entity_type" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "roles" "TrustedContactRole"[],
    "state_code" CHAR(2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "trusted_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "jurisdiction" CHAR(2) NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'draft',
    "storage_path" TEXT,
    "is_uploaded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_in" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "cadence" "CheckInCadence" NOT NULL,
    "scheduled_for" TIMESTAMPTZ NOT NULL,
    "triggered_by" TEXT,
    "response" TEXT,
    "outcome" TEXT,
    "state_code" CHAR(2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "check_in_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "death_signal" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "source" "DeathSignalSource" NOT NULL,
    "confidence" DECIMAL(5,2) NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "state_code" CHAR(2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "death_signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dissemination_action" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "trigger" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "method" "DisseminationMethod" NOT NULL,
    "status" "DisseminationStatus" NOT NULL DEFAULT 'pending',
    "executed_at" TIMESTAMPTZ,
    "state_code" CHAR(2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "dissemination_action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "life_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "LifeEventType" NOT NULL,
    "occurred_on" DATE NOT NULL,
    "source" TEXT,
    "notes" TEXT,
    "state_code" CHAR(2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "life_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "actor_type" "ActorType" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "source" "AuditSource" NOT NULL,
    "request_id" TEXT,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_user_id_key" ON "user"("auth_user_id");

-- CreateIndex
CREATE INDEX "asset_user_id_idx" ON "asset"("user_id");

-- CreateIndex
CREATE INDEX "asset_user_id_deleted_at_idx" ON "asset"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "debt_user_id_idx" ON "debt"("user_id");

-- CreateIndex
CREATE INDEX "beneficiary_user_id_idx" ON "beneficiary"("user_id");

-- CreateIndex
CREATE INDEX "estate_intent_user_id_idx" ON "estate_intent"("user_id");

-- CreateIndex
CREATE INDEX "trusted_contact_user_id_idx" ON "trusted_contact"("user_id");

-- CreateIndex
CREATE INDEX "document_user_id_idx" ON "document"("user_id");

-- CreateIndex
CREATE INDEX "check_in_user_id_idx" ON "check_in"("user_id");

-- CreateIndex
CREATE INDEX "death_signal_user_id_idx" ON "death_signal"("user_id");

-- CreateIndex
CREATE INDEX "dissemination_action_user_id_idx" ON "dissemination_action"("user_id");

-- CreateIndex
CREATE INDEX "life_event_user_id_idx" ON "life_event"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_occurred_at_idx" ON "audit_log"("occurred_at");

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debt" ADD CONSTRAINT "debt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary" ADD CONSTRAINT "beneficiary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_beneficiary" ADD CONSTRAINT "asset_beneficiary_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_beneficiary" ADD CONSTRAINT "asset_beneficiary_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estate_intent" ADD CONSTRAINT "estate_intent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estate_intent" ADD CONSTRAINT "estate_intent_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "beneficiary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trusted_contact" ADD CONSTRAINT "trusted_contact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in" ADD CONSTRAINT "check_in_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "death_signal" ADD CONSTRAINT "death_signal_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dissemination_action" ADD CONSTRAINT "dissemination_action_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "life_event" ADD CONSTRAINT "life_event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
