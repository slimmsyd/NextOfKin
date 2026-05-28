"use server";

import type { MaritalStatus, Prisma } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { AboutYouData } from "./about-you-types";

export type SaveAboutYouResult = { ok: true } | { ok: false; error: string };

const VALID_MARITAL: ReadonlySet<MaritalStatus> = new Set([
  "single",
  "married",
  "domestic_partnership",
  "divorced",
  "widowed",
  "separated",
]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Persists the identity-foundation answers. Scalar facts (legal name, marital
 * status, DOB, state) land on their own User columns; the nested spouse /
 * dependents / household object is stored as JSON until Phase 4 normalizes it.
 */
export async function saveAboutYouAction(
  data: AboutYouData,
): Promise<SaveAboutYouResult> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return { ok: false, error: "You're signed out. Please sign in again." };
  }

  const maritalStatus = VALID_MARITAL.has(data.maritalStatus as MaritalStatus)
    ? (data.maritalStatus as MaritalStatus)
    : null;
  const dateOfBirth = ISO_DATE.test(data.dob) ? new Date(data.dob) : null;
  const stateCode =
    data.state && data.state.trim().length === 2
      ? data.state.trim().toUpperCase()
      : undefined;

  await prisma.user.update({
    where: { authUserId: authUser.id },
    data: {
      legalName: data.legalName.trim() || null,
      maritalStatus,
      dateOfBirth,
      ...(stateCode ? { stateCode } : {}),
      aboutYouDetails: data.details as unknown as Prisma.InputJsonValue,
    },
  });

  return { ok: true };
}
