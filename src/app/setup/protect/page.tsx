import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SetupProtect } from "@/components/setup/SetupProtect";

export const metadata = {
  title: "Protect your account · NextOfKin",
};

export default async function SetupProtectPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/signup");
  }

  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    select: { id: true, mfaMethod: true },
  });
  if (!user) {
    redirect("/signup");
  }

  // Hard gate: consent must be recorded before this step.
  const consent = await prisma.consent.findFirst({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!consent) {
    redirect("/setup/consent");
  }

  return <SetupProtect initialMethod={user.mfaMethod ?? null} />;
}
