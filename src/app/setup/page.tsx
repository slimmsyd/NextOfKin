import { cookies } from "next/headers";
import { PhaseHeader } from "@/components/setup/PhaseHeader";
import { SetupWelcome } from "@/components/setup/SetupWelcome";

type SignupCookie = {
  first_name?: string;
  last_name?: string;
  email?: string;
};

function readSignup(raw: string | undefined): SignupCookie | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as SignupCookie;
    return null;
  } catch {
    return null;
  }
}

export default async function SetupPage() {
  const jar = await cookies();
  const signup = readSignup(jar.get("nok_signup")?.value);
  const firstName = signup?.first_name?.trim() || "there";

  return (
    <main className="min-h-screen bg-surface-lavender-100 flex flex-col">
      <PhaseHeader
        phase={1}
        phaseLabel="Welcome"
        step={1}
        stepCount={3}
      />
      <div className="flex-1 flex items-start md:items-center">
        <SetupWelcome firstName={firstName} />
      </div>
    </main>
  );
}
