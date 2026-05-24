import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignupSplitLayout } from "@/components/signup/SignupSplitLayout";
import { SignupLeftPanel } from "@/components/signup/SignupLeftPanel";
import { SigninForm } from "@/components/signin/SigninForm";

export default async function SigninPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/start");
  }

  return (
    <SignupSplitLayout left={<SignupLeftPanel />} right={<SigninForm />} />
  );
}
