import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signoutAction } from "@/app/signin/actions";

export default async function StartPage() {
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

  return (
    <main className="min-h-screen bg-surface-lavender-100 flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-serif text-4xl text-foreground">
          Welcome, {user?.firstName || "there"}.
        </h1>
        <p className="text-foreground/65 text-[14px] leading-relaxed">
          Your account is ready. Setup is next.
        </p>
        <Link
          href="/setup"
          className="inline-block rounded-full bg-brand-indigo px-6 py-3 text-white text-sm font-medium hover:bg-brand-violet transition-colors"
        >
          Continue to setup
        </Link>
        <form action={signoutAction} className="pt-2">
          <button
            type="submit"
            className="cursor-pointer text-xs text-foreground/50 hover:text-foreground/80 transition-colors underline underline-offset-4"
          >
            Not you? Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
