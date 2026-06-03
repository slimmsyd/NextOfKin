-- ============================================================
-- Waitlist (early-access capture from the landing page)
-- ============================================================

-- CreateEnum
CREATE TYPE "WaitlistGender" AS ENUM ('woman', 'man', 'non_binary', 'prefer_not_to_say');

-- CreateEnum
CREATE TYPE "WaitlistAgeBracket" AS ENUM ('under_25', 'age_25_34', 'age_35_44', 'age_45_54', 'age_55_64', 'age_65_plus', 'prefer_not_to_say');

-- CreateTable
CREATE TABLE "waitlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "phone" TEXT,
    "gender" "WaitlistGender",
    "age_bracket" "WaitlistAgeBracket",
    "source" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");
