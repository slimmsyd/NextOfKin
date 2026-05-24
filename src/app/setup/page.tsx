import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { PhaseHeader } from "@/components/setup/PhaseHeader";
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

  return (
    <main className="min-h-screen bg-surface-lavender-100 flex flex-col">
      <PhaseHeader phase={1} phaseLabel="Welcome" step={1} stepCount={3} />
      <div className="flex-1 flex items-start md:items-center">
        <SetupWelcome firstName={user.firstName || "there"} />
      </div>
    </main>
  );
}
