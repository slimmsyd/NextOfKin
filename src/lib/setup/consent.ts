"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Bump when the promise/ask copy changes materially. A new version writes a
// fresh acceptance row rather than overwriting the prior one. Kept local: a
// "use server" module may only export async functions.
const CONSENT_VERSION = "v1.0";

/**
 * Records the user's acceptance of the intake consent terms, then advances to
 * the Protect step. The checkbox gate is enforced in the client component; this
 * action is the durable record. Append-only — re-accepting adds a row.
 */
export async function acceptConsentAction() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    redirect("/signup");
  }

  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    select: { id: true },
  });
  if (!user) {
    redirect("/signup");
  }

  const hdrs = await headers();
  const ipAddress =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

  await prisma.consent.create({
    data: {
      userId: user.id,
      version: CONSENT_VERSION,
      ipAddress,
    },
  });

  redirect("/setup/protect");
}
