"use server";

import type { MaritalStatus, Prisma } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { AboutYouData, AboutYouDetails } from "./about-you-types";

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

// Partial edit of the captured profile from the live "Your profile" pane (the
// correction guardrail). Only provided fields are touched; family fields merge
// into the existing aboutYouDetails JSON.
export type ProfileEdit = {
  legalName?: string;
  dob?: string; // ISO YYYY-MM-DD
  state?: string;
  maritalStatus?: string;
  spouseName?: string | null;
  dependentNames?: string[];
  household?: string;
};

export async function updateProfileAction(
  patch: ProfileEdit,
): Promise<SaveAboutYouResult> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return { ok: false, error: "You're signed out. Please sign in again." };
  }

  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    select: { aboutYouDetails: true },
  });
  if (!user) {
    return { ok: false, error: "User profile not found." };
  }

  const data: Prisma.UserUpdateInput = {};
  if (patch.legalName !== undefined) {
    data.legalName = patch.legalName.trim() || null;
  }
  if (patch.maritalStatus !== undefined) {
    data.maritalStatus = VALID_MARITAL.has(patch.maritalStatus as MaritalStatus)
      ? (patch.maritalStatus as MaritalStatus)
      : null;
  }
  if (patch.dob !== undefined) {
    data.dateOfBirth = ISO_DATE.test(patch.dob) ? new Date(patch.dob) : null;
  }
  if (
    patch.state !== undefined &&
    patch.state.trim().length === 2
  ) {
    data.stateCode = patch.state.trim().toUpperCase();
  }

  const touchesFamily =
    patch.spouseName !== undefined ||
    patch.dependentNames !== undefined ||
    patch.household !== undefined;
  if (touchesFamily) {
    const current = (user.aboutYouDetails as AboutYouDetails | null) ?? {
      spouse: null,
      dependents: [],
      household: "",
    };
    const merged: AboutYouDetails = {
      spouse:
        patch.spouseName !== undefined
          ? patch.spouseName && patch.spouseName.trim()
            ? {
                ...(current.spouse ?? { legalName: "", dob: "", state: "" }),
                legalName: patch.spouseName.trim(),
              }
            : null
          : current.spouse,
      dependents:
        patch.dependentNames !== undefined
          ? patch.dependentNames
              .map((n) => n.trim())
              .filter(Boolean)
              .map((name) => ({ name }))
          : current.dependents,
      household:
        patch.household !== undefined ? patch.household : current.household,
    };
    data.aboutYouDetails = merged as unknown as Prisma.InputJsonValue;
  }

  await prisma.user.update({ where: { authUserId: authUser.id }, data });
  return { ok: true };
}
