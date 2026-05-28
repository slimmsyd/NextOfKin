"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type MfaChoice = "sms" | "totp";
export type SetMfaResult = { ok: true } | { ok: false; error: string };

/**
 * Persists the user's chosen MFA method. V1 records the preference only — the
 * actual code send/verify flow lands in V1.5. Idempotent: re-selecting updates.
 */
export async function setMfaMethodAction(
  method: MfaChoice,
): Promise<SetMfaResult> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return { ok: false, error: "You're signed out. Please sign in again." };
  }

  await prisma.user.update({
    where: { authUserId: authUser.id },
    data: { mfaMethod: method },
  });

  return { ok: true };
}
