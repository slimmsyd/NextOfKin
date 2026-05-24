import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupSplitLayout } from "@/components/signup/SignupSplitLayout";
import { SignupLeftPanel } from "@/components/signup/SignupLeftPanel";
import { SignupForm } from "@/components/signup/SignupForm";

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/start");
  }

  return (
    <SignupSplitLayout
      left={<SignupLeftPanel />}
      right={<SignupForm />}
    />
  );
}
