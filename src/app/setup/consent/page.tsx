import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SetupConsent } from "@/components/setup/SetupConsent";

export const metadata = {
  title: "What we promise · NextOfKin",
};

export default async function SetupConsentPage() {
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

  // Already consented? Skip ahead — no reason to ask twice.
  const existing = await prisma.consent.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });
  if (existing) {
    redirect("/setup/protect");
  }

  return <SetupConsent />;
}
