import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SetupWelcome } from "@/components/setup/SetupWelcome";

export default async function SetupPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/signup");
  }

  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    select: { firstName: true },
  });

  if (!user) {
    redirect("/signup");
  }

  return <SetupWelcome firstName={user.firstName || "there"} />;
}
