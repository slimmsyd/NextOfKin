import "server-only";

import { createClient } from "@/lib/supabase/server";

export type LandingCta = {
  label: string;
  href: string;
  isAuthenticated: boolean;
};

export async function getLandingCta(): Promise<LandingCta> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { label: "Continue", href: "/setup", isAuthenticated: true };
  }
  return { label: "Start your plan", href: "/signup", isAuthenticated: false };
}
