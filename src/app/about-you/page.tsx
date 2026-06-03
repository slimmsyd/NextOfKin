import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AboutYouPage } from "@/components/aboutYou/AboutYouPage";
import type {
  AboutYouData,
  AboutYouDetails,
} from "@/lib/setup/about-you-types";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    redirect("/signup");
  }

  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    select: {
      legalName: true,
      maritalStatus: true,
      dateOfBirth: true,
      stateCode: true,
      aboutYouDetails: true,
    },
  });
  if (!user) {
    redirect("/signup");
  }

  const stored = (user.aboutYouDetails as AboutYouDetails | null) ?? null;
  const initial: AboutYouData = {
    legalName: user.legalName ?? "",
    dob: user.dateOfBirth
      ? user.dateOfBirth.toISOString().slice(0, 10)
      : "",
    state: user.stateCode?.trim() ?? "",
    maritalStatus: user.maritalStatus ?? "",
    details: {
      spouse: stored?.spouse ?? null,
      dependents: stored?.dependents ?? [],
      household: stored?.household ?? "",
    },
  };

  return <AboutYouPage initial={initial} />;
}
