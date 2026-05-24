import { SignupSplitLayout } from "@/components/signup/SignupSplitLayout";
import { SignupLeftPanel } from "@/components/signup/SignupLeftPanel";
import { SignupForm } from "@/components/signup/SignupForm";

export default function SignupPage() {
  return (
    <SignupSplitLayout
      left={<SignupLeftPanel />}
      right={<SignupForm />}
    />
  );
}
