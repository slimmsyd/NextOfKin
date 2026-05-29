import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { firstIncompleteChapter } from "@/lib/yourLife/chapters";

// Resume-aware entry into the chapter loop: drop the user into the first
// chapter they haven't finished. The chapter page enforces auth too.
export default async function YourLifeEntry() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/signin");

  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
    select: { id: true },
  });
  if (!user) redirect("/signup");

  const progress = await prisma.chapterProgress.findMany({
    where: { userId: user.id },
    select: { chapter: true, status: true },
  });

  redirect(`/your-life/${firstIncompleteChapter(progress).slug}`);
}
